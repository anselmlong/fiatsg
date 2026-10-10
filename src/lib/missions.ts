import type { FaithTaskId } from "./saints";

export const MISSION_CATEGORIES = [
  { id: "small", label: "Small steps" },
  { id: "event", label: "Join an event" },
  { id: "course", label: "Find a course" },
  { id: "retreat", label: "Join a retreat" },
] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number]["id"];
export type Mission = {
  id: string;
  category: MissionCategory;
  taskId: FaithTaskId;
  title: string;
  description: string;
  commitment: string;
  nextStep: string;
  isDemo: boolean;
};

// An additive, versioned starter catalogue. No database reset or booking is needed.
// Real-world completion uses the existing faith tasks and saint_meetings records.
export const MISSIONS: Mission[] = [
  { id: "mass-with-a-friend", category: "small", taskId: "mass", title: "Bring a friend to Mass", description: "A simple invitation can mean a lot. Pick a Mass together, meet at the door and help your friend feel at home.", commitment: "One Mass · With a friend", nextStep: "Check your parish's Mass times and invite someone. Mark this complete after you have attended together.", isDemo: false },
  { id: "invite-to-fiat", category: "small", taskId: "invite", title: "Invite a friend to Fiat", description: "Know someone who would love to help? Share your personal invitation and take the first step together.", commitment: "A few minutes · From anywhere", nextStep: "Share your link below. Your saint unlocks when a new friend joins through it, not when you send it.", isDemo: false },
  { id: "prayer-for-a-cause", category: "small", taskId: "pray", title: "Hold a cause in prayer", description: "Pause for someone serving our community. Find a cause that speaks to you and light a candle on its page.", commitment: "A quiet moment · From anywhere", nextStep: "Open a cause and use its prayer form. Your saint unlocks when you light your candle.", isDemo: false },
  { id: "parish-welcome-evening", category: "event", taskId: "parish", title: "A parish welcome evening", description: "An evening of conversation, fellowship and meeting someone new. Come as you are; you do not need to know everyone.", commitment: "One evening · At a parish", nextStep: "Ask your parish about its next gathering. Attend a real parish event before marking this complete.", isDemo: true },
  { id: "serve-with-a-friend", category: "event", taskId: "with_friend", title: "A morning of service, together", description: "Turn catching up into helping out. Choose a cause with a friend you invited to Fiat and serve side by side.", commitment: "One volunteering session · Together", nextStep: "Both offer to help the same cause, get accepted and check in there. Your saint unlocks automatically after both check-ins.", isDemo: false },
  { id: "faith-foundations", category: "course", taskId: "course", title: "Faith foundations", description: "Make space for the big questions: Who is Jesus? Why do we pray? Explore the faith with others, one conversation at a time.", commitment: "A short course · At your own pace", nextStep: "Ask your parish or a Catholic community about a faith course. Complete the real course before marking this mission done.", isDemo: true },
  { id: "quiet-day", category: "retreat", taskId: "attend_retreat", title: "A day to pause and listen", description: "Step out of the usual rush for prayer, quiet and reflection. You can come on your own and make room for God.", commitment: "A day or weekend · Away from the rush", nextStep: "Find and attend a retreat through your parish or a Catholic retreat centre. Then return here to mark it complete.", isDemo: true },
  { id: "retreat-with-a-friend", category: "retreat", taskId: "retreat", title: "Bring someone on retreat", description: "Some invitations are easier to accept together. Invite a friend to share a day or weekend of prayer and reflection.", commitment: "A day or weekend · With a friend", nextStep: "Arrange a real retreat with a friend and attend together before marking this complete.", isDemo: true },
];
