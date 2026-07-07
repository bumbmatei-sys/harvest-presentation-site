import React from 'react';
import {
  Users, TrendingUp, Blocks, BookOpen, BrainCircuit, Bot, Rss, PenLine,
  GraduationCap, LayoutDashboard, ChartColumn, Mail, Map, Wheat, ArrowRight,
  Check, HeartHandshake, CalendarCheck, QrCode, Radio, HandHeart, Globe,
  Smartphone, Palette, FileText, Send, Church, Contact, ClipboardList,
  Calculator, ReceiptText, Link, ShieldCheck, MessageSquareText, Zap, Sparkles,
  Crown, Inbox, Building2, MessageSquare, Lock, Youtube, Instagram, ChevronDown,
  Sun, Share2, UserCheck, Monitor, Star, Circle, MapPin, ArrowDownToLine, Play,
  type LucideIcon,
} from 'lucide-react';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** kebab-case name → Lucide component (only icons the design actually uses). */
const NAME_MAP: Record<string, LucideIcon> = {
  users: Users,
  'trending-up': TrendingUp,
  blocks: Blocks,
  'book-open': BookOpen,
  'brain-circuit': BrainCircuit,
  bot: Bot,
  rss: Rss,
  'pen-line': PenLine,
  'graduation-cap': GraduationCap,
  'layout-dashboard': LayoutDashboard,
  'chart-column': ChartColumn,
  mail: Mail,
  map: Map,
  wheat: Wheat,
  'arrow-right': ArrowRight,
  check: Check,
  'heart-handshake': HeartHandshake,
  'calendar-check': CalendarCheck,
  'qr-code': QrCode,
  radio: Radio,
  'hand-heart': HandHeart,
  globe: Globe,
  smartphone: Smartphone,
  palette: Palette,
  'file-text': FileText,
  send: Send,
  church: Church,
  contact: Contact,
  'clipboard-list': ClipboardList,
  calculator: Calculator,
  'receipt-text': ReceiptText,
  link: Link,
  'shield-check': ShieldCheck,
  'message-square-text': MessageSquareText,
  zap: Zap,
  sparkles: Sparkles,
  crown: Crown,
  inbox: Inbox,
  'building-2': Building2,
  'message-square': MessageSquare,
  lock: Lock,
  youtube: Youtube,
  instagram: Instagram,
  'chevron-down': ChevronDown,
  sun: Sun,
  'share-2': Share2,
  'user-check': UserCheck,
  monitor: Monitor,
  star: Star,
  'map-pin': MapPin,
  'arrow-down-to-line': ArrowDownToLine,
  play: Play,
};

/** Name-based icon, e.g. <L name="arrow-right" size={16} color="currentColor" />. */
export const L: React.FC<{ name: string } & IconProps> = ({
  name,
  size = 24,
  color,
  strokeWidth,
  style,
}) => {
  const Cmp = NAME_MAP[name] ?? Circle;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} aria-hidden />;
};

type IconFn = (p?: IconProps) => React.ReactElement;
const fn = (name: string): IconFn => (p = {}) => <L name={name} {...p} />;

/**
 * Semantic icon map used across the landing sections. Every entry resolves to a
 * lucide-react icon, matching the rest of the codebase's icon set.
 */
export const I = {
  community: fn('users'),
  growth: fn('trending-up'),
  tech: fn('blocks'),
  bible: fn('book-open'),
  ai: fn('brain-circuit'),
  assistant: fn('bot'),
  feed: fn('rss'),
  blog: fn('pen-line'),
  courses: fn('graduation-cap'),
  dashboard: fn('layout-dashboard'),
  analytics: fn('chart-column'),
  newsletter: fn('mail'),
  map: fn('map'),
  wheat: fn('wheat'),
  arrow: fn('arrow-right'),
  check: fn('check'),
  prayer: fn('heart-handshake'),
  events: fn('calendar-check'),
  checkin: fn('qr-code'),
  livestream: fn('radio'),
  giving: fn('hand-heart'),
  globe: fn('globe'),
  phone: fn('smartphone'),
  brand: fn('palette'),
  docs: fn('file-text'),
  send: fn('send'),
  church: fn('church'),
  crm: fn('contact'),
  forms: fn('clipboard-list'),
  accounting: fn('calculator'),
  receipt: fn('receipt-text'),
  domain: fn('link'),
  admin: fn('shield-check'),
  sms: fn('message-square-text'),
  zap: fn('zap'),
  sparkles: fn('sparkles'),
  crown: fn('crown'),
  inbox: fn('inbox'),
  building: fn('building-2'),
  chat: fn('message-square'),
  lock: fn('lock'),
  youtube: fn('youtube'),
  instagram: fn('instagram'),
} as const;
