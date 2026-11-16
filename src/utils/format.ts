import { CategoryNode, PlatformId, ProductVisualKey } from '../types';

export const PLATFORMS: {
  id: PlatformId;
  name: string;
  urduName: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
}[] = [
  {
    id: 'dukaan',
    name: 'Dukaan',
    urduName: 'دکان',
    colorHex: '#059669',
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-700',
  },
  {
    id: 'web',
    name: 'Web',
    urduName: 'ویب',
    colorHex: '#0284C7',
    bgClass: 'bg-sky-50 border-sky-200',
    textClass: 'text-sky-700',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    urduName: 'ڈیلیوری',
    colorHex: '#D97706',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-700',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    urduName: 'واٹس ایپ',
    colorHex: '#16A34A',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-700',
  },
];

export const VISUAL_KEY_OPTIONS: {
  key: ProductVisualKey;
  label: string;
  urduLabel: string;
}[] = [
  { key: 'atta', label: 'Atta', urduLabel: 'آٹا' },
  { key: 'rice', label: 'Chawal', urduLabel: 'چاول' },
  { key: 'daal', label: 'Daal', urduLabel: 'دال' },
  { key: 'oil', label: 'Oil', urduLabel: 'تیل' },
  { key: 'sugar', label: 'Cheeni', urduLabel: 'چینی' },
  { key: 'tea', label: 'Chai', urduLabel: 'چائے' },
  { key: 'salt', label: 'Namak', urduLabel: 'نمک' },
  { key: 'milk', label: 'Doodh', urduLabel: 'دودھ' },
  { key: 'eggs', label: 'Anday', urduLabel: 'انڈے' },
  { key: 'butter', label: 'Makhan', urduLabel: 'مکھن' },
  { key: 'biscuits', label: 'Biscuit', urduLabel: 'بسکٹ' },
  { key: 'soda', label: 'Drink', urduLabel: 'مشروب' },
  { key: 'chips', label: 'Chips', urduLabel: 'چپس' },
  { key: 'detergent', label: 'Surf', urduLabel: 'سرف' },
  { key: 'soap', label: 'Sabun', urduLabel: 'صابن' },
  { key: 'spices', label: 'Masala', urduLabel: 'مصالحہ' },
];

export const COLOR_SWATCHES = [
  '#D97706',
  '#059669',
  '#0284C7',
  '#E11D48',
  '#7C3AED',
  '#EA580C',
  '#0D9488',
  '#4F46E5',
];

export function formatRs(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs ${rounded.toLocaleString('en-PK')}`;
}

export function formatSerial(serialNo: number): string {
  return `#${String(serialNo).padStart(2, '0')}`;
}

export function formatUdhaarElapsed(udhaarSince: string | null): string {
  if (!udhaarSince) return '';
  const start = new Date(udhaarSince).getTime();
  if (Number.isNaN(start)) return '';
  const diffMs = Math.max(0, Date.now() - start);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    const mins = Math.max(1, minutes);
    return `${mins} min pehly · ${mins} منٹ پہلے`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ghante pehly · ${hours} گھنٹے پہلے`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} din pehly · ${days} دن پہلے`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} hafte pehly · ${weeks} ہفتے پہلے`;
  }
  const months = Math.floor(days / 30);
  return `${months} mah pehly · ${months} ماہ پہلے`;
}

export function formatShortDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffHours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (diffHours < 1) return 'Abhi · ابھی';
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
  });
}

export function getCategoryTrail(
  categories: CategoryNode[],
  categoryId: string
): CategoryNode[] {
  const map = new Map(categories.map((c) => [c.id, c]));
  const trail: CategoryNode[] = [];
  let current = map.get(categoryId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return trail;
}

export function getRootCategory(
  categories: CategoryNode[],
  categoryId: string
): CategoryNode | undefined {
  const trail = getCategoryTrail(categories, categoryId);
  return trail[0];
}

export function getDirectChildren(
  categories: CategoryNode[],
  parentId: string | null
): CategoryNode[] {
  return categories.filter((c) => c.parentId === parentId);
}

export function getDescendantIds(
  categories: CategoryNode[],
  rootId: string
): string[] {
  const result = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const cat of categories) {
      if (cat.parentId && result.has(cat.parentId) && !result.has(cat.id)) {
        result.add(cat.id);
        added = true;
      }
    }
  }
  return Array.from(result);
}

export function readAndResizeImage(
  file: File,
  maxSize = 360
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Image read error'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ND';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
