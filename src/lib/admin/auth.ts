import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin-auth";
const ADMIN_SECRET = process.env.ADMIN_PASSWORD ?? "";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === ADMIN_SECRET;
}

export function getAdminCookieName(): string {
  return ADMIN_COOKIE;
}
