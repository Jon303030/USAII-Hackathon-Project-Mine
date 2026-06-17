import { listPdfFiles } from '@/backend/storage';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    files: await listPdfFiles(),
  });
}
