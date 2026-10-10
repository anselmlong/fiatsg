// Saints a supporter can meet. One task brings one saint; each saint is met once.
// Causes bring the next saint in their (category, tier) pool. Faith tasks each bring one fixed saint.
import { SAINTS } from "./saint-roster";

export const CATEGORIES = [
  { id: "seniors", label: "Seniors" },
  { id: "migrants", label: "Migrants" },
  { id: "children", label: "Children & youth" },
  { id: "sick", label: "The sick" },
  { id: "poor", label: "The hungry & poor" },
  { id: "faith", label: "Sharing the faith" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
export const isCategory = (id: string): id is CategoryId => CATEGORIES.some((c) => c.id === id);

// 1: a one-off event. 2: a regular role. 3: a long-term or skilled commitment.
export type Tier = 1 | 2 | 3;
export const defaultTier = (kind: "one_off" | "regular"): Tier => (kind === "one_off" ? 1 : 2);

export type Saint = {
  id: string; // also the image file name: /saints/<id>.jpg
  name: string; // "St Monica"
  feast: string; // "27 August"
  patron: string; // "Patron of mothers and of patience"
  category: CategoryId;
  tier: Tier;
  story: string; // about 80 words
  quote: { text: string; source: string }; // a real, sourced quote, or a scripture line tied to the saint
  prayer: string; // one line
  why: string; // why you met them: "You brought a friend. So did Andrew."
  image: string; // "/saints/monica.jpg"
  credit: string; // "Painting by Ary Scheffer, 1846. Public domain, via Wikimedia Commons"
};

export type FaithTaskId = "pray" | "invite" | "mass" | "parish" | "with_friend" | "offer" | "retreat";
export type FaithTask = {
  id: FaithTaskId;
  saintId: string;
  title: string;
  body: string;
  // honour: the supporter taps "I did this". auto: Fiat notices on its own.
  kind: "honour" | "auto";
};

export const FAITH_TASKS: FaithTask[] = [
  { id: "pray", saintId: "monica", kind: "auto", title: "Pray for a cause", body: "Light a candle for any cause on Fiat." },
  { id: "offer", saintId: "joseph", kind: "auto", title: "Offer to help a cause", body: "Say yes to any cause, however small." },
  { id: "invite", saintId: "andrew", kind: "auto", title: "Invite a friend to Fiat", body: "Share Fiat with a friend. When they join, you'll meet someone." },
  { id: "mass", saintId: "philip", kind: "honour", title: "Bring a friend to Mass", body: "Invite someone to come to Mass with you." },
  { id: "parish", saintId: "john-vianney", kind: "honour", title: "Attend a parish event", body: "Go to a talk, a fellowship or a feast at your parish." },
  { id: "with_friend", saintId: "frassati", kind: "auto", title: "Volunteer with a friend", body: "Serve at the same cause as a friend you invited, and both check in." },
  { id: "retreat", saintId: "ignatius", kind: "honour", title: "Bring a friend to a retreat", body: "Spend a day or a weekend with God, and bring someone along." },
];
export const faithTask = (id: string) => FAITH_TASKS.find((t) => t.id === id);

const byId = new Map(SAINTS.map((s) => [s.id, s]));
export const saint = (id: string) => byId.get(id);
export const saintsIn = (category: string) => SAINTS.filter((s) => s.category === category);

// Pools for causes: saints in this category and tier that are not tied to a faith task, in roster order.
const faithSaintIds = new Set(FAITH_TASKS.map((t) => t.saintId));
export const causePool = (category: string, tier: number) =>
  SAINTS.filter((s) => s.category === category && s.tier === tier && !faithSaintIds.has(s.id));

export { SAINTS };
