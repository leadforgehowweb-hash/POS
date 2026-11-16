import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  FolderTree,
  Package,
  Plus,
  ReceiptText,
  ScanBarcode,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  CategoryNode,
  Client,
  CustomShortcut,
  Order,
  Product,
  ScreenId,
} from '../types';
import {
  COLOR_SWATCHES,
  PLATFORMS,
  formatRs,
  getInitials,
  readAndResizeImage,
} from '../utils/format';

interface AppHomeProps {
  categories: CategoryNode[];
  products: Product[];
  orders: Order[];
  clients: Client[];
  customShortcuts: CustomShortcut[];
  onNavigate: (
    screen: ScreenId,
    options?: {
      categoryId?: string | null;
      triggerScan?: boolean;
      openAddProduct?: boolean;
    }
  ) => void;
  onAddShortcut: (shortcut: CustomShortcut) => void;
  onDeleteShortcut: (id: string) => void;
}

interface BuiltinIconDef {
  id: string;
  label: string;
  urduLabel: string;
  gradient: string;
  badge?: number;
  badgeRed?: boolean;
  onClick: () => void;
  svg: React.ReactNode;
}

export const AppHome: React.FC<AppHomeProps> = ({
  categories,
  products,
  orders,
  clients,
  customShortcuts,
  onNavigate,
  onAddShortcut,
  onDeleteShortcut,
}) => {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrdu, setNewUrdu] = useState('');
  const [newTarget, setNewTarget] = useState<ScreenId>('pos');
  const [newCategoryId, setNewCategoryId] = useState<string>('');
  const [newColor, setNewColor] = useState(COLOR_SWATCHES[0]);
  const [newImage, setNewImage] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const dailyGoal = 20000;
  const goalProgress = Math.min(1, totalRevenue / dailyGoal);
  const ringRadius = 25;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - goalProgress);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= 10).length,
    [products]
  );

  const udhaarClients = useMemo(
    () => clients.filter((c) => c.udhaarBalance > 0),
    [clients]
  );

  const totalUdhaar = useMemo(
    () => udhaarClients.reduce((sum, c) => sum + c.udhaarBalance, 0),
    [udhaarClients]
  );

  const platformCounts = useMemo(() => {
    const map: Record<string, number> = {
      dukaan: 0,
      web: 0,
      delivery: 0,
      whatsapp: 0,
    };
    for (const p of products) {
      for (const plat of p.platforms) {
        map[plat] = (map[plat] || 0) + 1;
      }
    }
    return map;
  }, [products]);

  const builtinIcons: BuiltinIconDef[] = [
    {
      id: 'pos-all',
      label: 'Bill POS',
      urduLabel: 'بل کاؤنٹر',
      gradient: 'from-emerald-400 via-emerald-500 to-teal-700',
      onClick: () => onNavigate('pos', { categoryId: null }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="9" y="10" width="30" height="28" rx="6" fill="white" fillOpacity="0.22" />
          <rect x="13" y="14" width="22" height="8" rx="2.5" fill="white" />
          <circle cx="17" cy="28" r="2.2" fill="white" />
          <circle cx="24" cy="28" r="2.2" fill="white" />
          <circle cx="31" cy="28" r="2.2" fill="white" />
          <circle cx="17" cy="34" r="2.2" fill="white" />
          <rect x="22" y="32" width="11" height="4" rx="2" fill="#A7F3D0" />
        </svg>
      ),
    },
    {
      id: 'scan',
      label: 'Scan',
      urduLabel: 'اسکین',
      gradient: 'from-cyan-400 via-sky-500 to-blue-700',
      onClick: () => onNavigate('pos', { categoryId: null, triggerScan: true }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <path d="M10 17V12a2 2 0 012-2h5M31 10h5a2 2 0 012 2v5M38 31v5a2 2 0 01-2 2h-5M17 38h-5a2 2 0 01-2-2v-5" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="15" y="18" width="2.5" height="12" rx="1" fill="white" />
          <rect x="20" y="18" width="4" height="12" rx="1" fill="white" />
          <rect x="26.5" y="18" width="2" height="12" rx="1" fill="white" />
          <rect x="30.5" y="18" width="2.5" height="12" rx="1" fill="white" />
          <line x1="11" y1="24" x2="37" y2="24" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'atta-daal',
      label: 'Atta Daal',
      urduLabel: 'آٹا دال',
      gradient: 'from-amber-400 via-amber-500 to-orange-700',
      onClick: () => onNavigate('pos', { categoryId: 'cat-grains' }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <path d="M14 16h20l3 21c0 2-5 3-13 3s-13-1-13-3l3-21z" fill="white" fillOpacity="0.95" />
          <path d="M17 11h14l-2 5H19l-2-5z" fill="#FEF3C7" />
          <circle cx="24" cy="28" r="5.5" fill="#D97706" />
          <path d="M24 24v8M21 27l3-3 3 3" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'oil-chai',
      label: 'Oil Chai',
      urduLabel: 'تیل چائے',
      gradient: 'from-lime-400 via-emerald-500 to-green-700',
      onClick: () => onNavigate('pos', { categoryId: 'cat-oil-tea' }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="13" y="9" width="7" height="4" rx="1.5" fill="#FEF08A" />
          <path d="M13 13h7l4 8v17H9V21l4-8z" fill="white" fillOpacity="0.95" />
          <path d="M27 25h11v6a5.5 5.5 0 01-11 0v-6z" fill="#FEF3C7" />
          <path d="M38 26.5h2a2.5 2.5 0 010 5h-2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="16.5" cy="28" r="3" fill="#10B981" />
        </svg>
      ),
    },
    {
      id: 'dairy',
      label: 'Doodh',
      urduLabel: 'دودھ انڈے',
      gradient: 'from-sky-400 via-blue-500 to-indigo-700',
      onClick: () => onNavigate('pos', { categoryId: 'cat-dairy' }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <path d="M13 14h11l3 6v19H10V20l3-6z" fill="white" />
          <rect x="15" y="10" width="7" height="4" rx="1" fill="#BAE6FD" />
          <path d="M18.5 24c2.5 3 2.5 6 0 6s-2.5-3 0-6z" fill="#0284C7" />
          <ellipse cx="33" cy="31" rx="6" ry="8" fill="#FEF3C7" />
        </svg>
      ),
    },
    {
      id: 'snacks',
      label: 'Snacks',
      urduLabel: 'بسکٹ چپس',
      gradient: 'from-rose-400 via-rose-500 to-red-700',
      onClick: () => onNavigate('pos', { categoryId: 'cat-snacks' }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="10" y="15" width="28" height="19" rx="5" fill="white" fillOpacity="0.95" />
          <circle cx="20" cy="24.5" r="5.5" fill="#FBBF24" />
          <circle cx="28" cy="25.5" r="5" fill="#F59E0B" />
          <circle cx="19" cy="23" r="1" fill="#92400E" />
          <circle cx="22" cy="26" r="1" fill="#92400E" />
        </svg>
      ),
    },
    {
      id: 'homecare',
      label: 'Sabun',
      urduLabel: 'صابن سرف',
      gradient: 'from-violet-400 via-purple-500 to-indigo-700',
      onClick: () => onNavigate('pos', { categoryId: 'cat-homecare' }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="11" y="14" width="26" height="24" rx="6" fill="white" fillOpacity="0.95" />
          <circle cx="24" cy="26" r="6.5" fill="#8B5CF6" />
          <circle cx="35" cy="12" r="3" fill="#DDD6FE" />
          <circle cx="40" cy="17" r="2" fill="#EDE9FE" />
        </svg>
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      urduLabel: 'کیٹیگری',
      gradient: 'from-teal-400 via-teal-500 to-emerald-700',
      badge: categories.length,
      onClick: () => onNavigate('categories'),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="10" y="10" width="12" height="12" rx="3.5" fill="white" />
          <rect x="26" y="10" width="12" height="12" rx="3.5" fill="white" fillOpacity="0.7" />
          <rect x="10" y="26" width="12" height="12" rx="3.5" fill="white" fillOpacity="0.7" />
          <rect x="26" y="26" width="12" height="12" rx="3.5" fill="#99F6E4" />
        </svg>
      ),
    },
    {
      id: 'stock',
      label: 'Stock',
      urduLabel: 'اسٹاک',
      gradient: 'from-slate-600 via-slate-700 to-slate-900',
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeRed: true,
      onClick: () => onNavigate('inventory'),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <path d="M24 9l14 7v16l-14 7-14-7V16l14-7z" fill="white" fillOpacity="0.95" />
          <path d="M10 16l14 7 14-7M24 23v16" stroke="#334155" strokeWidth="2.2" fill="none" />
        </svg>
      ),
    },
    {
      id: 'khata',
      label: 'Khata',
      urduLabel: 'کھاتہ',
      gradient: 'from-orange-400 via-amber-500 to-red-600',
      badge: udhaarClients.length > 0 ? udhaarClients.length : undefined,
      onClick: () => onNavigate('khata'),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="12" y="9" width="24" height="30" rx="4" fill="white" />
          <rect x="12" y="9" width="5" height="30" rx="2" fill="#FDE68A" />
          <line x1="21" y1="18" x2="32" y2="18" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="21" y1="24" x2="32" y2="24" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="21" y1="30" x2="28" y2="30" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'clients',
      label: 'Clients',
      urduLabel: 'گاہک ڈیٹا',
      gradient: 'from-indigo-400 via-blue-500 to-indigo-700',
      badge: clients.length,
      onClick: () => onNavigate('clients'),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <circle cx="20" cy="18" r="5.5" fill="white" />
          <path d="M10 35c0-5 4.5-8.5 10-8.5s10 3.5 10 8.5" fill="white" />
          <circle cx="32" cy="20" r="4" fill="#BFDBFE" />
          <path d="M29 35c.8-3.8 3.2-6.5 7-6.5 2.5 0 4.5 1 5.5 2.8" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      id: 'charts',
      label: 'Report',
      urduLabel: 'رپورٹ',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-800',
      onClick: () => onNavigate('charts'),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <rect x="11" y="25" width="6" height="13" rx="2" fill="white" fillOpacity="0.75" />
          <rect x="21" y="17" width="6" height="21" rx="2" fill="white" />
          <rect x="31" y="11" width="6" height="27" rx="2" fill="#A7F3D0" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Bills',
      urduLabel: 'پرانے بل',
      gradient: 'from-fuchsia-500 via-purple-600 to-violet-800',
      badge: orders.length,
      onClick: () => onNavigate('orders'),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <path d="M14 10h20v29l-3.5-2.5L27 39l-3-2.5L21 39l-3.5-2.5L14 39V10z" fill="white" />
          <line x1="18" y1="18" x2="30" y2="18" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="24" x2="30" y2="24" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="30" x2="25" y2="30" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'add-item',
      label: 'Naya Item',
      urduLabel: 'نیا سامان',
      gradient: 'from-green-400 via-emerald-500 to-emerald-800',
      onClick: () => onNavigate('inventory', { openAddProduct: true }),
      svg: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <circle cx="24" cy="24" r="14" fill="white" fillOpacity="0.22" />
          <path d="M24 15v18M15 24h18" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const compressed = await readAndResizeImage(file, 260);
      setNewImage(compressed);
    } catch {
      setUploadError('Photo load nahi ho saki');
    }
  };

  const handleCreateShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrdu.trim()) return;
    onAddShortcut({
      id: `sc-${Date.now()}`,
      name: newName.trim(),
      urduName: newUrdu.trim(),
      targetScreen: newTarget,
      categoryId: newTarget === 'pos' && newCategoryId ? newCategoryId : undefined,
      colorHex: newColor,
      imageUrl: newImage,
    });
    setNewName('');
    setNewUrdu('');
    setNewTarget('pos');
    setNewCategoryId('');
    setNewImage(undefined);
    setShowAddModal(false);
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0D211C] via-[#132A2E] to-[#1A243B] p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/10">
        {/* Soft ambient wallpaper depth */}
        <div
          className="pointer-events-none absolute -top-28 -left-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl"
          aria-hidden="true"
        />

        {/* OS Status Strip */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-num text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {clock}
            </span>
            <span className="h-5 w-px bg-white/20" aria-hidden="true" />
            <div className="flex items-center gap-2 text-white/90">
              <span className="text-sm sm:text-base font-semibold">Nazim Dukan</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="font-urdu text-base sm:text-lg text-emerald-300 font-semibold">
                ناظم دکان
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md flex items-center gap-2 text-sm font-medium transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Icon</span>
            <span aria-hidden="true" className="opacity-60">·</span>
            <span className="font-urdu">نیا آئیکن</span>
          </button>
        </div>

        {/* 3 Glass Summary Widgets */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Widget 1: Kul Sale */}
          <button
            type="button"
            onClick={() => onNavigate('charts')}
            className="text-left bg-white/95 backdrop-blur-xl rounded-[26px] p-5 border border-white/60 shadow-lg hover:bg-white transition-all active:scale-[0.99] flex items-center justify-between gap-4 cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <span>Kul Sale</span>
                <span aria-hidden="true">·</span>
                <span className="font-urdu text-sm text-emerald-700">کل سیل</span>
              </div>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatRs(totalRevenue)}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-num font-semibold text-emerald-700">{orders.length}</span>
                <span>Bills · ہدف</span>
                <span className="font-num">{formatRs(dailyGoal)}</span>
              </div>
            </div>

            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="#E2E8F0"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="#059669"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="absolute font-num text-xs font-bold text-slate-800">
                {Math.round(goalProgress * 100)}%
              </span>
            </div>
          </button>

          {/* Widget 2: Platforms & Stock */}
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="text-left bg-white/95 backdrop-blur-xl rounded-[26px] p-5 border border-white/60 shadow-lg hover:bg-white transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Platforms</span>
                <span aria-hidden="true">·</span>
                <span className="font-urdu text-sm text-sky-700">پلیٹ فارم</span>
              </div>
              <span
                className={`font-num text-xs font-bold ${
                  lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {lowStockCount} <span className="font-urdu">کم اسٹاک</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((plat) => (
                <div
                  key={plat.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100/80 text-xs"
                >
                  <span className="font-medium text-slate-700 truncate">
                    <span className="font-urdu mr-1">{plat.urduName}</span>
                    {plat.name}
                  </span>
                  <span className="font-num font-bold text-slate-900 ml-1">
                    {platformCounts[plat.id] || 0}
                  </span>
                </div>
              ))}
            </div>
          </button>

          {/* Widget 3: Khata Udhaar */}
          <button
            type="button"
            onClick={() => onNavigate('khata')}
            className="text-left bg-white/95 backdrop-blur-xl rounded-[26px] p-5 border border-white/60 shadow-lg hover:bg-white transition-all active:scale-[0.99] flex items-center justify-between gap-4 cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <span>Khata Udhaar</span>
                <span aria-hidden="true">·</span>
                <span className="font-urdu text-sm text-amber-700">کھاتہ ادھار</span>
              </div>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatRs(totalUdhaar)}
              </div>
              <div className="mt-1.5 text-xs font-medium text-slate-600">
                <span className="font-num font-bold text-amber-700">
                  {udhaarClients.length}
                </span>{' '}
                <span className="font-urdu">گاہک</span> · Active Udhaar
              </div>
            </div>

            <div className="flex items-center -space-x-2.5 shrink-0">
              {udhaarClients.slice(0, 4).map((client) => (
                <div
                  key={client.id}
                  style={{ backgroundColor: client.colorHex }}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden"
                  title={client.name}
                >
                  {client.imageUrl ? (
                    <img
                      src={client.imageUrl}
                      alt={client.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(client.name)
                  )}
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Smart App Icon Grid */}
        <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-y-6 gap-x-4 sm:gap-x-6 pb-4">
          {builtinIcons.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={app.onClick}
              className="group flex flex-col items-center text-center focus-visible:outline-none cursor-pointer"
            >
              <div className="relative">
                <div
                  className={`w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-[22px] sm:rounded-[26px] bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg shadow-black/30 ring-1 ring-white/25 transition-transform duration-150 group-hover:-translate-y-0.5 group-active:scale-95 relative overflow-hidden`}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent"
                    aria-hidden="true"
                  />
                  {app.svg}
                </div>
                {typeof app.badge === 'number' && (
                  <span
                    className={`font-num absolute -top-1.5 -right-1.5 min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center border-2 border-[#132A2E] shadow ${
                      app.badgeRed
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="font-urdu mt-2 text-sm font-semibold text-white leading-snug">
                {app.urduLabel}
              </span>
              <span className="text-[11px] font-medium text-white/75 tracking-tight">
                {app.label}
              </span>
            </button>
          ))}

          {/* Custom Admin-Added Shortcuts */}
          {customShortcuts.map((sc) => (
            <div key={sc.id} className="group relative flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() =>
                  onNavigate(sc.targetScreen, {
                    categoryId: sc.categoryId || null,
                  })
                }
                className="flex flex-col items-center text-center cursor-pointer"
              >
                <div
                  style={{ backgroundColor: sc.colorHex }}
                  className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-[22px] sm:rounded-[26px] flex items-center justify-center shadow-lg shadow-black/30 ring-1 ring-white/25 transition-transform duration-150 group-hover:-translate-y-0.5 group-active:scale-95 overflow-hidden"
                >
                  {sc.imageUrl ? (
                    <img
                      src={sc.imageUrl}
                      alt={sc.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-9 h-9 text-white" />
                  )}
                </div>
                <span className="font-urdu mt-2 text-sm font-semibold text-white leading-snug">
                  {sc.urduName}
                </span>
                <span className="text-[11px] font-medium text-white/75 truncate max-w-[90px]">
                  {sc.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteShortcut(sc.id)}
                title="Delete shortcut"
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute -top-2 right-1 sm:right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Dashed + Add App Tile */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="group flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-[22px] sm:rounded-[26px] border-2 border-dashed border-white/35 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all group-active:scale-95">
              <Plus className="w-8 h-8 text-white/80" />
            </div>
            <span className="font-urdu mt-2 text-sm font-semibold text-white/90">
              مزید شامل
            </span>
            <span className="text-[11px] font-medium text-white/70">Add App</span>
          </button>
        </div>

        {/* Tablet/Desktop Translucent Glass Dock */}
        <div className="relative z-10 hidden md:flex justify-center mt-6">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-[26px] bg-white/15 backdrop-blur-xl border border-white/20 shadow-xl">
            <button
              type="button"
              onClick={() => onNavigate('pos', { categoryId: null })}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-2 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bill POS</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('categories')}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 text-sm font-medium transition-all active:scale-95 cursor-pointer"
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('clients')}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 text-sm font-medium transition-all active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('khata')}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 text-sm font-medium transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khata</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('charts')}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 text-sm font-medium transition-all active:scale-95 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Home Shortcut Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Home Icon · <span className="font-urdu">نیا آئیکن</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShortcut} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  style={{ backgroundColor: newColor }}
                  className="w-20 h-20 rounded-[22px] shrink-0 flex items-center justify-center text-white overflow-hidden shadow-md"
                >
                  {newImage ? (
                    <img
                      src={newImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo · تصویر</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newImage && (
                    <button
                      type="button"
                      onClick={() => setNewImage(undefined)}
                      className="block text-xs font-medium text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                  {uploadError && (
                    <p className="text-xs text-rose-600">{uploadError}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Roman Label
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Chawal"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Urdu Name · اردو نام
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={newUrdu}
                    onChange={(e) => setNewUrdu(e.target.value)}
                    placeholder="چاول"
                    className="font-urdu w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Target Screen · اسکرین
                </label>
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value as ScreenId)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pos">Bill POS · بل کاؤنٹر</option>
                  <option value="categories">Categories · کیٹیگری</option>
                  <option value="inventory">Stock · اسٹاک</option>
                  <option value="clients">Clients · گاہک</option>
                  <option value="khata">Khata · کھاتہ</option>
                  <option value="charts">Report · رپورٹ</option>
                  <option value="orders">Bills · پرانے بل</option>
                </select>
              </div>

              {newTarget === 'pos' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    POS Category Filter (Optional)
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Sab · تمام سامان</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.urduName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Icon Color · رنگ
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setNewColor(hex)}
                      style={{ backgroundColor: hex }}
                      className={`w-9 h-9 rounded-xl transition-transform cursor-pointer ${
                        newColor === hex
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-105'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] px-5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Save · محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
