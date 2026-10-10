import { currentUser } from "@/lib/auth";
import { nextUnseen } from "@/lib/meet";
import { saint } from "@/lib/saints";

// The next saint this supporter has met but not yet seen revealed.
export async function GET() {
  const user = await currentUser();
  if (user?.role !== "supporter") return Response.json(null);
  const meeting = await nextUnseen(user.id);
  const s = meeting && saint(meeting.saintId);
  if (!meeting || !s) return Response.json(null);
  return Response.json({ meetingId: meeting.id, saint: s, firstName: user.name.split(" ")[0] });
}
