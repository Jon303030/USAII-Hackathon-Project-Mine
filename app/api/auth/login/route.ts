export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string };

  if (!body.username?.trim()) {
    return Response.json({ error: 'Name is required.' }, { status: 400 });
  }

  const name = body.username.trim();

  return Response.json({
    user: {
      name,
      id: 'demo-user',
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
      role: 'user',
    },
  });
}
