export type MediaItem = { url: string; kind: "image" | "video" };

export const MAX_MEDIA = 6;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export const mediaKind = (contentType: string) =>
  IMAGE_TYPES.includes(contentType) ? "image" : VIDEO_TYPES.includes(contentType) ? "video" : null;

// Only our Blob store and the built-in photo library are allowed as media sources.
const isMediaUrl = (url: string) =>
  url.startsWith("/images/") || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//.test(url);

export function parseMedia(raw: string): MediaItem[] {
  try {
    const items: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(items)) return [];
    return items
      .filter((m): m is MediaItem => typeof m?.url === "string" && isMediaUrl(m.url) && (m.kind === "image" || m.kind === "video"))
      .map(({ url, kind }) => ({ url, kind }))
      .slice(0, MAX_MEDIA);
  } catch {
    return [];
  }
}
