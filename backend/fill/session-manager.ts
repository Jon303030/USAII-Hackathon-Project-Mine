/**
 * User Session Manager
 * Manages user conversation state, message history, data persistence
 */

import path from 'path';
import { promises as fs } from 'fs';
import type { UserSession, Message, DialogState, UserProfile, Language } from '@/backend/types';
import { pvcRoot } from '@/backend/storage';

const SESSIONS_DIR = path.join(pvcRoot, 'sessions');

// ============== Ensure sessions directory exists ==============
async function ensureSessionsDir() {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create sessions directory:', error);
  }
}

// ============== Main Session Manager Class ==============
export class SessionManager {
  /**
   * Create new session
   */
  static async createSession(phone: string, language: Language = 'zh_CN', customSessionId?: string): Promise<UserSession> {
    await ensureSessionsDir();

    const sessionId = customSessionId || `session_${phone}_${Date.now()}`;
    const session: UserSession = {
      sessionId,
      phone,
      language,
      state: 'INIT',
      userProfile: {},
      collectedData: {},
      messages: [],
      consentTerms: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as UserSession;
    } catch (error) {
      console.warn(`会话 ${sessionId} 不存在或读取失败:`, error);
      return null;
    }
  }

  /**
   * Save session
   */
  static async saveSession(session: UserSession): Promise<void> {
    try {
      await ensureSessionsDir();
      const filePath = path.join(SESSIONS_DIR, `${session.sessionId}.json`);
      session.updatedAt = Date.now();
      await fs.writeFile(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      console.error(`Failed to save session ${session.sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Update session state
   */
  static async updateState(
    sessionId: string,
    newState: DialogState,
    userMessage?: string,
    assistantReply?: string,
  ): Promise<UserSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.state = newState;

    if (userMessage) {
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });
    }

    if (assistantReply) {
      session.messages.push({
        role: 'assistant',
        content: assistantReply,
        timestamp: Date.now(),
      });
    }

    await this.saveSession(session);
    return session;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    sessionId: string,
    profileUpdate: Partial<UserProfile>,
  ): Promise<UserSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.userProfile = {
      ...session.userProfile,
      ...profileUpdate,
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Add message to history
   */
  static async addMessage(
    sessionId: string,
    message: Message,
  ): Promise<UserSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.messages.push({
      ...message,
      timestamp: Date.now(),
    });

    await this.saveSession(session);
    return session;
  }

  /**
   * Update collected data (form fields)
   */
  static async updateCollectedData(
    sessionId: string,
    dataUpdate: Record<string, any>,
  ): Promise<UserSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.collectedData = {
      ...session.collectedData,
      ...dataUpdate,
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Get session message history (for AI context)
   */
  static async getMessageHistory(sessionId: string, limit: number = 20): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    if (!session) return [];

    return session.messages.slice(-limit);
  }

  /**
   * Confirm terms
   */
  static async confirmTerms(sessionId: string): Promise<UserSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.consentTerms = true;
    await this.saveSession(session);
    return session;
  }

  /**
   * Complete session (archive)
   */
  static async completeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.state = 'COMPLETED';
    const archiveDir = path.join(pvcRoot, 'sessions_archive');

    try {
      await fs.mkdir(archiveDir, { recursive: true });
      const archiveFilePath = path.join(archiveDir, `${session.sessionId}_${Date.now()}.json`);
      await fs.writeFile(archiveFilePath, JSON.stringify(session, null, 2));
      console.log(`Session archived: ${archiveFilePath}`);
    } catch (error) {
      console.error('Failed to archive session:', error);
    }
  }

  /**
   * List all sessions for a user
   */
  static async listUserSessions(phone: string): Promise<UserSession[]> {
    try {
      await ensureSessionsDir();
      const files = await fs.readdir(SESSIONS_DIR);
      const sessions: UserSession[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = await fs.readFile(path.join(SESSIONS_DIR, file), 'utf-8');
          const session = JSON.parse(data) as UserSession;
          if (session.phone === phone) {
            sessions.push(session);
          }
        }
      }

      return sessions.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Failed to list user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions (older than 30 days)
   */
  static async cleanupExpiredSessions(daysOld: number = 30): Promise<number> {
    try {
      await ensureSessionsDir();
      const files = await fs.readdir(SESSIONS_DIR);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(SESSIONS_DIR, file);
          const stat = await fs.stat(filePath);
          if (now - stat.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      console.log(`Cleaned up ${deletedCount} expired sessions`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to clean up expired sessions:', error);
      return 0;
    }
  }
}

/**
 * Get session context info (for Gemini prompt)
 */
export function getSessionContext(session: UserSession): Record<string, any> {
  const requiredFields = ['name', 'age', 'maritalStatus', 'childrenCount', 'annualIncome'];
  const missingFields = requiredFields.filter(
    field => !session.collectedData || !session.collectedData[field]
  );

  const formInfoMap: Record<Language, string> = {
    zh_CN: "马来西亚乐龄人士生活援助金 (Bantuan Warga Emas)。申请条件：必须是60岁以上的马来西亚公民，家庭总收入每月低于3000令吉，且没有固定的退休金收入。",
    ms_MY: "Bantuan Warga Emas (BWE). Syarat permohonan: Warganegara Malaysia berumur 60 tahun ke atas, jumlah pendapatan isi rumah di bawah RM3,000 sebulan, dan tiada pendapatan pencen tetap.",
    en_US: "Assistance for Older Persons (Bantuan Warga Emas). Requirements: Malaysian citizen aged 60 and above, total household income below RM3,000 per month, and no fixed pension income."
  };

  const disclaimersMap: Record<Language, string> = {
    zh_CN: "本人在此声明，以上提供的所有信息均真实有效。如有虚假，政府有权撤销援助资格。本信息仅用于援助金申请，将严格保密。",
    ms_MY: "Saya dengan ini mengaku bahawa semua maklumat yang diberikan adalah benar. Jika palsu, kerajaan berhak membatalkan kelayakan. Maklumat ini hanya untuk permohonan bantuan dan akan dirahsiakan dengan ketat.",
    en_US: "I hereby declare that all information provided is true and valid. If false, the government reserves the right to revoke eligibility. This information is solely for the aid application and will be kept strictly confidential."
  };

  const currentLang = session.language || 'en_US';

  return {
    phone: session.phone,
    language: session.language,
    state: session.state,

    profile_json: JSON.stringify(session.userProfile, null, 2),
    collected_fields_json: JSON.stringify(session.collectedData, null, 2),

    form_info: formInfoMap[currentLang as Language],
    missing_fields_json: JSON.stringify(missingFields),
    disclaimers: disclaimersMap[currentLang as Language],
    
    messages_count: session.messages.length,
    time_spent: Date.now() - session.createdAt,
  };
}
