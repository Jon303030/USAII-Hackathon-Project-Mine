import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pdfRoot, safeFileName } from '@/backend/storage';

export const runtime = 'nodejs';

export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const url = new URL(request.url);
  const safeName = safeFileName(filename);
  const filePath = path.join(pdfRoot, safeName);
  const bytes = await readFile(filePath);
  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Cache-Control': 'no-store',
  });

  if (url.searchParams.get('download') === '1') {
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`);
  } else {
    headers.set('Content-Disposition', `inline; filename="${safeName}"`);
  }

  return new Response(bytes, { headers });
}
