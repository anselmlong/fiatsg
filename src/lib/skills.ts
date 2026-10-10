export const SKILLS = [
  { id: "befriending", label: "Befriending & listening" },
  { id: "teaching", label: "Teaching & tutoring" },
  { id: "music", label: "Music & singing" },
  { id: "cooking", label: "Cooking & food" },
  { id: "driving", label: "Driving" },
  { id: "tech", label: "IT & tech help" },
  { id: "admin", label: "Admin & paperwork" },
  { id: "translation", label: "Languages & translation" },
  { id: "eldercare", label: "Caring for seniors" },
  { id: "childcare", label: "Working with children" },
  { id: "design", label: "Design & social media" },
  { id: "photography", label: "Photo & video" },
  { id: "health", label: "First aid & health" },
  { id: "handyman", label: "Repairs & handyman" },
  { id: "events", label: "Event help & logistics" },
] as const;

export type SkillId = (typeof SKILLS)[number]["id"];

const byId = new Map<string, (typeof SKILLS)[number]>(SKILLS.map((s) => [s.id, s]));
export const skillLabel = (id: string) => byId.get(id)?.label ?? id;
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
  { url: "/images/vf-resident-smile.jpg", label: "A resident smiling" },
  { url: "/images/vf-residents.jpg", label: "Residents with volunteers" },
  { url: "/images/caritas-seniors-outing.jpg", label: "Outing with seniors" },
  { url: "/images/caritas-small-group.jpg", label: "Small group conversation" },
  { url: "/images/acmi-care-packs.jpg", label: "Workers with care packs" },
  { url: "/images/acmi-class.jpg", label: "Migrant workers at a class" },
  { url: "/images/acmi-goodie-bags.jpg", label: "Students packing goodie bags" },
  { url: "/images/cws-sjh.jpg", label: "Youth with seniors" },
  { url: "/images/vf-banner2.jpg", label: "Residents at a home for the aged" },
  { url: "/images/cws-haw.jpg", label: "Art & craft with seniors" },
  { url: "/images/acmi-volunteer.jpg", label: "Volunteers packing donations" },
  { url: "/images/acmi-stories.jpg", label: "Listening to a migrant worker" },
  { url: "/images/acmi-events.jpg", label: "Backpack drive" },
  { url: "/images/caritas-community.jpg", label: "Parish community" },
  { url: "/images/oyp-community.webp", label: "Young people together" },
] as const;
