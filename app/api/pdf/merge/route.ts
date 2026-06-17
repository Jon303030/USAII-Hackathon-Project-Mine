import { mergePdfs } from '@/backend/pdf';
import { listPdfFiles } from '@/backend/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as { fileNames?: string[] };
  const fileNames = body.fileNames ?? [];

  if (fileNames.length < 2) {
    return Response.json({ error: 'Choose at least two PDFs to merge.' }, { status: 400 });
  }

  const name = await mergePdfs(fileNames);

  return Response.json({
    message: `Merged PDF saved as ${name}.`,
    file: {
      name,
      url: `/api/pdf/files/${encodeURIComponent(name)}`,
      downloadUrl: `/api/pdf/files/${encodeURIComponent(name)}?download=1`,
    },
    files: await listPdfFiles(),
  });
}
