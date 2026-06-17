import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const pvcRoot = process.env.PVC_ROOT || path.join(process.cwd(), 'storage', 'pvc');
export const pdfRoot = path.join(pvcRoot, 'pdf');
export const dataRoot = path.join(pvcRoot, 'data');

export async function ensureStorage() {
  await mkdir(pdfRoot, { recursive: true });
  await mkdir(dataRoot, { recursive: true });
}

export function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureStorage();
  await writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

export async function listPdfFiles() {
  await ensureStorage();
  const entries = await readdir(pdfRoot);
  const files = await Promise.all(
    entries
      .filter((entry) => entry.toLowerCase().endsWith('.pdf'))
      .map(async (entry) => {
        const fullPath = path.join(pdfRoot, entry);
        const details = await stat(fullPath);
        return {
          name: entry,
          size: details.size,
          updatedAt: details.mtime.toISOString(),
          url: `/api/pdf/files/${encodeURIComponent(entry)}`,
          downloadUrl: `/api/pdf/files/${encodeURIComponent(entry)}?download=1`,
        };
      }),
  );
  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
