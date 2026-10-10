import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { currentOrg } from "@/lib/auth";
import { IMAGE_TYPES, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/media";

// Issues short-lived tokens so organisations can upload photos and videos
// straight from the browser to Vercel Blob (bypassing the 4.5 MB body limit).
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await currentOrg())) throw new Error("Only organisation accounts can upload.");
        return {
          allowedContentTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
