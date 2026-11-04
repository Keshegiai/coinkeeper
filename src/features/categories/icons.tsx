import type { LucideIcon } from 'lucide-react';
import {
  Baby, BookOpen, Briefcase, Bus, Car, Coffee, Dumbbell, Film, Fuel, Gamepad2, Gift, GraduationCap, Heart, House,
  Music, PawPrint, PiggyBank, Plane, Receipt, Shapes, Shirt, ShoppingCart, Smartphone, Sparkles, Stethoscope,
  TrendingUp, Utensils, Wallet, Wifi, Zap, Banknote,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  shapes: Shapes,
  cart: ShoppingCart,
  food: Utensils,
  coffee: Coffee,
  home: House,
  car: Car,
  bus: Bus,
  fuel: Fuel,
  wifi: Wifi,
  phone: Smartphone,
  bolt: Zap,
  receipt: Receipt,
  health: Stethoscope,
  sport: Dumbbell,
  heart: Heart,
  shirt: Shirt,
  film: Film,
  game: Gamepad2,
  music: Music,
  book: BookOpen,
  study: GraduationCap,
  plane: Plane,
  gift: Gift,
  baby: Baby,
  pet: PawPrint,
  beauty: Sparkles,
  salary: Banknote,
  work: Briefcase,
  invest: TrendingUp,
  savings: PiggyBank,
  wallet: Wallet,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof CATEGORY_ICONS;
export const ICON_KEYS = Object.keys(CATEGORY_ICONS) as IconKey[];

/** Map legacy react-icons names (e.g. "LuShapes") onto the new set. */
export function normalizeIcon(icon: string | undefined): IconKey {
  if (icon && icon in CATEGORY_ICONS) return icon as IconKey;
  return 'shapes';
}

export function CategoryIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const Icon = CATEGORY_ICONS[normalizeIcon(icon)];
  return <Icon size={size} strokeWidth={1.6} aria-hidden />;
}

/** Monochrome-first palette with a few accents — fits the Nothing look better than a rainbow. */
export const CATEGORY_COLORS = [
  '#111111', '#5C5C5C', '#A3A3A3', '#D71921', '#F26B1D', '#E8B10B',
  '#2E9E5B', '#1C7ED6', '#6741D9', '#C2255C', '#0B7285', '#8D6E63',
];
