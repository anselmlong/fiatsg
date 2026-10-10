"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, orgs, users } from "@/db";
import { checkPassword, endSession, hashPassword, startSession } from "@/lib/auth";
import { meetForTask } from "@/lib/meet";
import { sendOffer } from "@/lib/offers";
import { type FormState, list, safeNext, str, strOrNull } from "@/lib/forms";
import { COVER_LIBRARY, isSkill } from "@/lib/skills";

const homeFor = (role: string) => (role === "org" ? "/org" : role === "cf_admin" ? "/admin" : "/causes");

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await checkPassword(str(fd, "password"), user.passwordHash))) {
    return { error: "That email and password don't match. Please try again." };
  }
  await startSession(user.id);
  if (user.role === "supporter") await offerFrom(user.id, fd);
  redirect(safeNext(str(fd, "next"), homeFor(user.role)));
}

// "I'd like to help" sent someone to join or log in first; their yes goes through as they arrive.
async function offerFrom(userId: number, fd: FormData) {
  const id = Number(str(fd, "offer"));
  if (Number.isInteger(id) && id > 0) await sendOffer(userId, id);
}

async function emailTaken(email: string) {
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return !!u;
}

function checkBasics(fd: FormData): string | null {
  if (!str(fd, "name")) return "Please tell us your name.";
  if (!/^\S+@\S+\.\S+$/.test(str(fd, "email"))) return "Please enter a valid email address.";
  if (str(fd, "password").length < 6) return "Your password needs at least 6 characters.";
  return null;
}

export async function joinSupporter(_: FormState, fd: FormData): Promise<FormState> {
  const problem = checkBasics(fd);
  if (problem) return { error: problem };
  const email = str(fd, "email").toLowerCase();
  if (await emailTaken(email)) return { error: "An account with this email already exists. Try logging in instead." };
  const jar = await cookies();
  const inviter = await inviterFrom(jar.get("fiat_ref")?.value);

  const [user] = await db
    .insert(users)
    .values({
      email,
      name: str(fd, "name"),
      phone: strOrNull(fd, "phone"),
      passwordHash: await hashPassword(str(fd, "password")),
      role: "supporter",
      invitedBy: inviter?.id ?? null,
      skills: list(fd, "skills").filter(isSkill),
      otherSkill: strOrNull(fd, "otherSkill"),
      area: strOrNull(fd, "area"),
    })
    .returning();
  // The friend who shared the link meets St Andrew, who brought his brother Peter to Jesus.
  if (inviter) await meetForTask(inviter.id, "invite");
  jar.delete("fiat_ref");
  await startSession(user.id);
  await offerFrom(user.id, fd);
  redirect(safeNext(str(fd, "next"), "/causes?welcome=1"));
}

async function inviterFrom(ref: string | undefined) {
  if (!ref || !/^\d+$/.test(ref)) return null;
  const [u] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, Number(ref)));
  return u?.role === "supporter" ? u : null;
}

export async function joinOrg(_: FormState, fd: FormData): Promise<FormState> {
  const problem = checkBasics(fd);
  if (problem) return { error: problem };
  if (!str(fd, "orgName")) return { error: "Please enter your organisation's name." };
  if (str(fd, "history").length < 20) return { error: "Please tell us a little about your organisation's story." };
  const email = str(fd, "email").toLowerCase();
  if (await emailTaken(email)) return { error: "An account with this email already exists. Try logging in instead." };

  const [user] = await db
    .insert(users)
    .values({
      email,
      name: str(fd, "name"),
      phone: strOrNull(fd, "phone"),
      passwordHash: await hashPassword(str(fd, "password")),
      role: "org",
    })
    .returning();
  await db.insert(orgs).values({
    ownerId: user.id,
    name: str(fd, "orgName"),
    tagline: str(fd, "tagline"),
    history: str(fd, "history"),
    whyItMatters: str(fd, "whyItMatters"),
    website: strOrNull(fd, "website"),
    contactPhone: strOrNull(fd, "phone"),
    // Sign-up no longer asks for a photo; start with the first library cover until they pick one.
    coverUrl: strOrNull(fd, "coverUrl") ?? COVER_LIBRARY[0].url,
    foundedYear: Number(str(fd, "foundedYear")) || null,
    status: "pending",
  });
  await startSession(user.id);
  redirect("/org?joined=1");
}

export async function logout() {
  await endSession();
  redirect("/");
}
