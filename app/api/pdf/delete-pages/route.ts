import { deletePages } from '@/backend/pdf';
import { listPdfFiles } from '@/backend/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { fileName?: string; pages?: string };

    if (!body.fileName || !body.pages) {
      return Response.json({ error: 'File name and pages are required.' }, { status: 400 });
    }

    const name = await deletePages(body.fileName, body.pages);
    return Response.json({
      message: `PDF saved as ${name} after deleting pages.`,
      file: {
        name,
        url: `/api/pdf/files/${encodeURIComponent(name)}`,
        downloadUrl: `/api/pdf/files/${encodeURIComponent(name)}?download=1`,
      },
      files: await listPdfFiles(),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Failed to delete pages.' }, { status: 400 });
  }
}
