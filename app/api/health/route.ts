export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    ok: true,
    service: 'report-workflow-hackthon',
    port: 8000,
  });
}
