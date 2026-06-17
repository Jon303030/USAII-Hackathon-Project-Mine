import path from 'node:path';
import { getReport, reports } from '@/backend/reports';
import { dataRoot, readJsonFile, writeJsonFile } from '@/backend/storage';

export const runtime = 'nodejs';

const favoritesPath = path.join(dataRoot, 'favorites.json');

async function readFavoriteIds() {
  return readJsonFile<string[]>(favoritesPath, ['rpt-001']);
}

export async function GET() {
  const ids = await readFavoriteIds();
  const favorites = ids.map((id) => getReport(id)).filter(Boolean);

  return Response.json({
    favorites: favorites.length > 0 ? favorites : [reports[0]],
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { reportId?: string };
  const report = body.reportId ? getReport(body.reportId) : undefined;

  if (!report) {
    return Response.json({ error: 'Report not found.' }, { status: 404 });
  }

  const ids = await readFavoriteIds();
  const nextIds = Array.from(new Set([...ids, report.id]));
  await writeJsonFile(favoritesPath, nextIds);

  return Response.json({
    message: `${report.title} saved to PVC favorites.`,
    favorites: nextIds.map((id) => getReport(id)).filter(Boolean),
  });
}
