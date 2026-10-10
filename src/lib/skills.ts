export const SKILLS = [
  { id: "befriending", label: "Befriending & listening", icon: "🤝" },
  { id: "teaching", label: "Teaching & tutoring", icon: "📚" },
  { id: "music", label: "Music & singing", icon: "🎵" },
  { id: "cooking", label: "Cooking & food", icon: "🍲" },
  { id: "driving", label: "Driving", icon: "🚗" },
  { id: "tech", label: "IT & tech help", icon: "💻" },
  { id: "admin", label: "Admin & paperwork", icon: "📋" },
  { id: "translation", label: "Languages & translation", icon: "🗣️" },
  { id: "eldercare", label: "Caring for seniors", icon: "🧓" },
  { id: "childcare", label: "Working with children", icon: "🧒" },
  { id: "design", label: "Design & social media", icon: "🎨" },
  { id: "photography", label: "Photo & video", icon: "📷" },
  { id: "health", label: "First aid & health", icon: "🩺" },
  { id: "handyman", label: "Repairs & handyman", icon: "🔧" },
  { id: "events", label: "Event help & logistics", icon: "📦" },
] as const;

export type SkillId = (typeof SKILLS)[number]["id"];

const byId = new Map<string, (typeof SKILLS)[number]>(SKILLS.map((s) => [s.id, s]));
export const skillLabel = (id: string) => byId.get(id)?.label ?? id;
export const skillIcon = (id: string) => byId.get(id)?.icon ?? "✨";
export const isSkill = (id: string) => byId.has(id);

export const AREAS = ["Central", "North", "North-East", "East", "West", "Online"] as const;

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const AGE_GROUPS = [
  { id: "all", label: "All ages & families welcome" },
  { id: "teens", label: "Teens 13+ and adults" },
  { id: "adults", label: "Adults 18+" },
] as const;
export const ageLabel = (id: string) => AGE_GROUPS.find((a) => a.id === id)?.label ?? id;

export const COVER_LIBRARY = [
  { url: "/images/cws-sjh.jpg", label: "Youth with seniors" },
  { url: "/images/vf-banner2.jpg", label: "Residents at a home for the aged" },
  { url: "/images/cws-haw.jpg", label: "Art & craft with seniors" },
  { url: "/images/cws-haw2.jpg", label: "Night outreach" },
  { url: "/images/acmi-volunteer.jpg", label: "Volunteers packing donations" },
  { url: "/images/acmi-stories.jpg", label: "Listening to a migrant worker" },
  { url: "/images/acmi-events.jpg", label: "Backpack drive" },
  { url: "/images/caritas-community.jpg", label: "Parish community" },
  { url: "/images/oyp-community.webp", label: "Young people together" },
  { url: "/images/oyp-1.webp", label: "Young adults outdoors" },
  { url: "/images/cws-yr.jpg", label: "Youth outreach" },
  { url: "/images/cps-mass.jpg", label: "Workplace Mass" },
] as const;
