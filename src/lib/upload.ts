import { upload } from "@vercel/blob/client";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, mediaKind, type MediaItem } from "./media";

const MB = 1024 * 1024;

// Browser-side upload to Vercel Blob. Throws a friendly message on bad files.
export async function uploadMedia(file: File, onProgress?: (pct: number) => void): Promise<MediaItem> {
  const kind = mediaKind(file.type);
  if (!kind) throw new Error(`${file.name} isn't a supported photo (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV).`);
  const limit = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > limit) throw new Error(`${file.name} is too large. ${kind === "image" ? "Photos" : "Videos"} can be up to ${limit / MB} MB.`);

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const blob = await upload(`uploads/${safeName}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    contentType: file.type,
    multipart: file.size > 20 * MB,
    onUploadProgress: (p) => onProgress?.(Math.round(p.percentage)),
  });
  return { url: blob.url, kind };
}
