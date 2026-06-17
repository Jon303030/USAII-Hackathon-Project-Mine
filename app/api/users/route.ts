import path from 'node:path';
import { dataRoot, readJsonFile, writeJsonFile } from '@/backend/storage';

export const runtime = 'nodejs';

type UserRecord = {
  id: string;
  name: string;
  role: 'user' | 'admin';
  status: 'Active' | 'Pending';
};

const usersPath = path.join(dataRoot, 'users.json');

const defaultUsers: UserRecord[] = [
  { id: 'usr-001', name: 'Ali', role: 'user', status: 'Active' },
  { id: 'usr-002', name: 'Admin', role: 'admin', status: 'Active' },
];

async function readUsers() {
  const users = await readJsonFile<Array<UserRecord | (Omit<UserRecord, 'role'> & { role: string })>>(
    usersPath,
    defaultUsers,
  );
  return users.map((user) => ({
    ...user,
    role: user.role?.toLowerCase() === 'admin' ? 'admin' : 'user',
  })) satisfies UserRecord[];
}

export async function GET() {
  return Response.json({
    users: await readUsers(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; role?: string };
  const name = body.name?.trim();

  if (!name) {
    return Response.json({ error: 'Name is required.' }, { status: 400 });
  }

  const users = await readUsers();
  const nextUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name,
    role: body.role?.trim().toLowerCase() === 'admin' ? 'admin' : 'user',
    status: 'Active',
  };
  const nextUsers = [nextUser, ...users];
  await writeJsonFile(usersPath, nextUsers);

  return Response.json({
    message: `${name} added.`,
    users: nextUsers,
  });
}
