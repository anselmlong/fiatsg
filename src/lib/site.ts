import "server-only";
import { headers } from "next/headers";

// The address people reach this site at, so shared links and QR codes point back here.
export async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return process.env.SITE_URL ?? "https://fiat.anselmlong.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
