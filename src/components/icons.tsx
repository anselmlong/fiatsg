import {
  Armchair,
  Baby,
  BookOpen,
  Camera,
  Car,
  ClipboardList,
  CookingPot,
  HandHeart,
  HeartHandshake,
  Languages,
  Laptop,
  type LucideIcon,
  Music,
  Package,
  Palette,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";

const SKILL_ICONS: Record<string, LucideIcon> = {
  befriending: HeartHandshake,
  teaching: BookOpen,
  music: Music,
  cooking: CookingPot,
  driving: Car,
  tech: Laptop,
  admin: ClipboardList,
  translation: Languages,
  eldercare: Armchair,
  childcare: Baby,
  design: Palette,
  photography: Camera,
  health: Stethoscope,
  handyman: Wrench,
  events: Package,
};

export function SkillIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  const Icon = SKILL_ICONS[id] ?? Sparkles;
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}

export { HandHeart as PrayIcon };
