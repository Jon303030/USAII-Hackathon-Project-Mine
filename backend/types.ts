/**
 * Core Type Definitions and Data Models
 * Support for multilingual, state management, user sessions
 */

// ============== Language Support ==============
export type Language = 'zh_CN' | 'ms_MY' | 'en_US';

// ============== Dialogue State Machine ==============
export type DialogState =
  | 'INIT'               // Initialization: select language, collect phone
  | 'GATHER_PROFILE'    // Gather profile: name, age, address
  | 'FORM_MATCHING'     // Form matching: recommend matching forms
  | 'FORM_EXPLANATION'  // Form explanation: AI explains terms
  | 'FORM_FILLING'      // Form filling: ask for missing fields
  | 'CONFIRM_TERMS'     // Confirm terms: user agrees to disclaimers
  | 'COMPLETED';        // Completed: summary and trigger SMS

// ============== User Profile ==============
export type UserProfile = {
  name?: string;
  age?: number;
  phone?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  children?: number;
  householdIncome?: number;
  address?: {
    state?: string;      // 州/省
    district?: string;   // 地区
    postcode?: string;   // 邮编
    taman?: string;      // 社区名称
    jalan?: string;      // 街道/路名
  };
};

// ============== Form Related ==============
export type FormQualification = {
  minAge?: number;
  maxAge?: number;
  maritalStatus?: string[];
  minChildren?: number;
  maxChildren?: number;
  maxHouseholdIncome?: number;
  citizenship?: string[];
  [key: string]: any;
};

export type FormField = {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: (value: any) => boolean;
};

export type Form = {
  id: string;
  name: string;
  description: string;
  qualifications: FormQualification;
  requiredFields: FormField[];
  disclaimers: string[];
  languages: Record<
    Language,
    {
      name: string;
      description: string;
      disclaimers: string[];
    }
  >;
};

// ============== User Session ==============
export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
};

export type UserSession = {
  sessionId: string;
  phone: string;
  language: Language;
  state: DialogState;
  userProfile: UserProfile;
  selectedFormId?: string;
  collectedData: Record<string, any>;  // 表格填充进度
  messages: Message[];
  consentTerms: boolean;
  createdAt: number;
  updatedAt: number;
};

// ============== AI Response Format ==============
export type GeminiAIResponse = {
  reply_to_user: string;              // 回复给用户的文本
  extracted_data: Partial<UserProfile | Record<string, any>>;  // 抽取的结构化数据
  next_state?: DialogState;           // 建议的下一个状态
  confidence?: 'High' | 'Medium' | 'Low';  // 置信度
  needs_clarification?: boolean;      // 是否需要进一步澄清
  clarification_field?: string;       // 需要澄清的字段
};

// ============== Form Matching Result ==============
export type FormMatchResult = {
  form: Form;
  matchScore: number;                 // 0-100 匹配分数
  missingFields: FormField[];         // 缺失的必需字段
  qualificationsMet: boolean;         // 是否满足基本资格
};

// ============== API Request/Response Body ==============
export type ChatRequest = {
  sessionId: string;
  userMessage: string;
  audioData?: {
    data: string;                     // Base64 编码的音频
    mimeType: string;                 // 如 "audio/webm" 或 "audio/wav"
  };
};

export type ChatResponse = {
  sessionId: string;
  reply: string;
  newState: DialogState;
  extractedData: Partial<UserProfile>;
  matchedForms?: FormMatchResult[];   // 当进入 FORM_MATCHING 时
  confidence: 'High' | 'Medium' | 'Low';
};

export type FormSearchRequest = {
  sessionId: string;
  userProfile: UserProfile;
};

export type FormSearchResponse = {
  forms: FormMatchResult[];
  recommendedFormId?: string;
};
