import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, orgs, users, type Role } from "@/db";

const COOKIE = "fiat_session";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET);

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function startSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export const currentUser = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const [user] = await db.select().from(users).where(eq(users.id, Number(payload.uid)));
    return user ?? null;
  } catch {
    return null;
  }
});

export async function requireUser(role?: Role, next?: string) {
  const user = await currentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (role && user.role !== role) redirect("/");
  return user;
}

export const currentOrg = cache(async () => {
  const user = await currentUser();
  if (!user || user.role !== "org") return null;
  const [org] = await db.select().from(orgs).where(eq(orgs.ownerId, user.id));
  return org ?? null;
});

export async function requireOrg() {
  await requireUser("org");
  const org = await currentOrg();
  if (!org) redirect("/");
  return org;
}
