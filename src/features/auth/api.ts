import type { User } from '@/domain/types';
import { ApiError, request } from '@/lib/http';

/**
 * NOTE: json-server is a mock backend — it has no real auth. Credentials are
 * checked client-side and the "token" is opaque. Swap these two functions for a
 * real API and nothing else in the app has to change.
 */
interface StoredUser extends User {
  password: string;
}

export interface Session {
  token: string;
  user: User;
}

const strip = ({ password: _password, ...user }: StoredUser): User => user;

async function findByEmail(email: string) {
  const needle = email.trim().toLowerCase();
  const users = await request<StoredUser[]>('/users', { where: { email: needle } });
  if (users.length) return users[0];
  // json-server matching is case-sensitive; legacy rows may have mixed case.
  const all = await request<StoredUser[]>('/users');
  return all.find((u) => u.email.toLowerCase() === needle);
}

export async function login(email: string, password: string): Promise<Session> {
  const user = await findByEmail(email);
  if (!user || user.password !== password) throw new ApiError('Неверный email или пароль', 401);
  return { token: `mock.${user.id}.${Date.now().toString(36)}`, user: strip(user) };
}

export async function register(input: { name: string; email: string; password: string }): Promise<Session> {
  if (await findByEmail(input.email)) throw new ApiError('Пользователь с таким email уже существует', 409);
  const created = await request<StoredUser>('/users', {
    method: 'POST',
    body: { id: crypto.randomUUID(), name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password },
  });
  return { token: `mock.${created.id}.${Date.now().toString(36)}`, user: strip(created) };
}
