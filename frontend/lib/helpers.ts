import type { Variants } from 'framer-motion';

export const STORAGE_KEYS = {
  VIEW_MODE:  'udir_view_mode',
  SORT_FIELD: 'udir_sort_field',
  SORT_DIR:   'udir_sort_dir',
  LAST_QUERY: 'udir_last_query',
  LAST_USER:  'udir_last_user_id',
  IMPORTS:    'groweasy_saved_imports',
};

export const AVATAR_PALETTES = [
  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#fdf4ff', text: '#7c3aed', border: '#e9d5ff' },
  { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
  { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
  { bg: '#fefce8', text: '#92400e', border: '#fde68a' },
];

export const getAvatarColor = (name?: string) =>
  AVATAR_PALETTES[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length];

export const getInitials = (name?: string) =>
  (name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const BANNER_GRADIENTS = [
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
  'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
  'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
  'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
  'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)',
  'linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)',
  'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)',
  'linear-gradient(135deg,#0ba360 0%,#3cba92 100%)',
];

export const getBannerGradient = (name?: string, index?: number) => {
  // When index is provided each card position gets a distinct gradient
  if (index !== undefined) return BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];
  // Fallback: full-string hash so names differing beyond the first char still differ
  const s = name ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return BANNER_GRADIENTS[Math.abs(h) % BANNER_GRADIENTS.length];
};

export const COMPANY_PALETTES = [
  { bg: '#eff6ff', text: '#1d4ed8' },
  { bg: '#fdf4ff', text: '#7c3aed' },
  { bg: '#fff7ed', text: '#c2410c' },
  { bg: '#f0fdf4', text: '#15803d' },
  { bg: '#fff1f2', text: '#be123c' },
];

export const getCompanyColor = (name?: string) =>
  COMPANY_PALETTES[(name?.charCodeAt(0) ?? 0) % COMPANY_PALETTES.length];

export const getBadgeFlags = (index: number) => ({
  isTop: index < 3,
  isNew: index % 3 === 1,
});

export const stripPhoneExt = (phone?: string) => phone?.split(' x')[0] ?? phone;

export const formatWebsite = (url?: string) => url?.replace(/^https?:\/\//, '') ?? '';

export const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const STAGGER_CONTAINER: Variants = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const STAGGER_ITEM: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const SIDEBAR_VARIANTS: Variants = {
  closed: { x: -260, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  open:   { x: 0,    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

export const BACKDROP_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const MODAL_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 16 },
  animate: { opacity: 1, scale: 1,    y: 0,
             transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.95, y: 8,
             transition: { duration: 0.2, ease: 'easeIn' } },
};

export const OVERLAY_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

export const TOAST_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0,  scale: 1,
             transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: 4,  scale: 0.97,
             transition: { duration: 0.2 } },
};

export const STAT_CARD_VARIANTS: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1,
             transition: { duration: 0.38, ease: 'easeOut' } },
};

export const CENTER_SCALE_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1,
             transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export const SHIMMER_TRANSITION = {
  duration: 1.5,
  repeat: Infinity,
  ease: 'linear',
};
