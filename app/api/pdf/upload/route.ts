import { saveUploadedPdf } from '@/backend/pdf';
import { listPdfFiles } from '@/backend/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('files').filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return Response.json({ error: 'No PDF files uploaded.' }, { status: 400 });
  }

  const names = await Promise.all(files.map((file) => saveUploadedPdf(file)));

  return Response.json({
    message: `${names.length} PDF file(s) uploaded to PVC.`,
    uploaded: names,
    files: await listPdfFiles(),
  });
}
