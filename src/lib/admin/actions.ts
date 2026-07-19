"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "admin-auth";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return { error: "Admin credentials not configured." };
  }

  if (username !== validUsername || password !== validPassword) {
    return { error: "Invalid username or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, validPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
