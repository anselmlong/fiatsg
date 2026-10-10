export type FormState = { error?: string; ok?: string } | undefined;

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export const strOrNull = (fd: FormData, k: string) => str(fd, k) || null;
export const list = (fd: FormData, k: string) => fd.getAll(k).map(String).filter(Boolean);
export const int = (fd: FormData, k: string) => {
  const n = Number.parseInt(str(fd, k), 10);
  return Number.isFinite(n) ? n : null;
};

// Only allow internal paths as post-login destinations.
export const safeNext = (next: string | null | undefined, fallback: string) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
