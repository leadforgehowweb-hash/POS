import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CategoryNode,
  PlatformId,
  Product,
  ProductVisualKey,
} from '../types';
import {
  PLATFORMS,
  VISUAL_KEY_OPTIONS,
  formatRs,
  getCategoryTrail,
  getDescendantIds,
  readAndResizeImage,
} from '../utils/format';
import { ProductVisual } from './ProductVisual';

interface InventoryViewProps {
  categories: CategoryNode[];
  products: Product[];
  openAddTriggerNonce: number;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAdjustStock: (productId: string, delta: number) => void;
  onTogglePlatform: (productId: string, platform: PlatformId) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  categories,
  products,
  openAddTriggerNonce,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
  onTogglePlatform,
}) => {
  const [platformFilter, setPlatformFilter] = useState<PlatformId | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [nameDraft, setNameDraft] = useState('');
  const [urduDraft, setUrduDraft] = useState('');
  const [skuDraft, setSkuDraft] = useState('');
  const [unitDraft, setUnitDraft] = useState('1kg');
  const [categoryDraft, setCategoryDraft] = useState(
    categories[0]?.id || 'cat-grains'
  );
  const [priceDraft, setPriceDraft] = useState('100');
  const [stockDraft, setStockDraft] = useState('20');
  const [visualKeyDraft, setVisualKeyDraft] = useState<ProductVisualKey>('atta');
  const [imageDraft, setImageDraft] = useState<string | undefined>(undefined);
  const [platformsDraft, setPlatformsDraft] = useState<PlatformId[]>([
    'dukaan',
    'web',
    'delivery',
    'whatsapp',
  ]);

  const openAddModal = () => {
    setEditingProduct(null);
    setNameDraft('');
    setUrduDraft('');
    setSkuDraft(`ND-${101 + products.length}`);
    setUnitDraft('1kg');
    setCategoryDraft(categories[0]?.id || 'cat-grains');
    setPriceDraft('150');
    setStockDraft('20');
    setVisualKeyDraft('atta');
    setImageDraft(undefined);
    setPlatformsDraft(['dukaan', 'web', 'delivery', 'whatsapp']);
    setModalOpen(true);
  };

  useEffect(() => {
    if (openAddTriggerNonce > 0) {
      openAddModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddTriggerNonce]);

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNameDraft(product.name);
    setUrduDraft(product.urduName);
    setSkuDraft(product.sku);
    setUnitDraft(product.unit);
    setCategoryDraft(product.categoryId);
    setPriceDraft(String(product.price));
    setStockDraft(String(product.stock));
    setVisualKeyDraft(product.visualKey);
    setImageDraft(product.imageUrl);
    setPlatformsDraft(product.platforms);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndResizeImage(file, 360);
      setImageDraft(dataUrl);
    } catch {
      // ignore invalid image
    }
  };

  const toggleDraftPlatform = (plat: PlatformId) => {
    setPlatformsDraft((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Math.max(1, Math.round(Number(priceDraft) || 0));
    const parsedStock = Math.max(0, Math.round(Number(stockDraft) || 0));
    if (!nameDraft.trim() || !urduDraft.trim()) return;

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: skuDraft.trim() || `ND-${Date.now().toString().slice(-3)}`,
      name: nameDraft.trim(),
      urduName: urduDraft.trim(),
      unit: unitDraft.trim() || '1kg',
      categoryId: categoryDraft,
      price: parsedPrice,
      stock: parsedStock,
      visualKey: visualKeyDraft,
      imageUrl: imageDraft,
      platforms: platformsDraft.length > 0 ? platformsDraft : ['dukaan'],
    };

    if (editingProduct) {
      onUpdateProduct(payload);
    } else {
      onAddProduct(payload);
    }
    setModalOpen(false);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allowedCats =
      categoryFilter !== 'all'
        ? new Set(getDescendantIds(categories, categoryFilter))
        : null;

    return products.filter((p) => {
      if (platformFilter !== 'all' && !p.platforms.includes(platformFilter)) {
        return false;
      }
      if (allowedCats && !allowedCats.has(p.categoryId)) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.urduName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, categories, platformFilter, categoryFilter, searchQuery]);

  const categoryTrailLabel = (catId: string) => {
    const trail = getCategoryTrail(categories, catId);
    if (trail.length === 0) return 'General';
    return trail.map((t) => t.urduName).join(' › ');
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Stock & Inventory · <span className="font-urdu">اسٹاک مینجمنٹ</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              <span className="font-num font-bold text-slate-800">
                {products.length}
              </span>{' '}
              Items ·{' '}
              <span className="font-num font-bold text-amber-600">
                {products.filter((p) => p.stock <= 10).length}
              </span>{' '}
              Kam Stock
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[46px] px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Naya Item</span>
            <span aria-hidden="true">·</span>
            <span className="font-urdu">نیا سامان</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Platform Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                platformFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sab · <span className="font-urdu">سب</span>
            </button>
            {PLATFORMS.map((plat) => (
              <button
                key={plat.id}
                type="button"
                onClick={() => setPlatformFilter(plat.id)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  platformFilter === plat.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-urdu mr-1">{plat.urduName}</span>
                {plat.name}
              </button>
            ))}
          </div>

          {/* Search & Category Select */}
          <div className="flex flex-col sm:flex-row gap-2.5 flex-1 lg:max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Talash · تلاش..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Sab Categories · تمام</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryTrail(categories, c.id)
                    .map((n) => n.name)
                    .join(' › ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const status =
            product.stock <= 0
              ? { label: 'Khatam · ختم', cls: 'text-rose-700' }
              : product.stock <= 10
              ? { label: 'Kam · کم', cls: 'text-amber-700' }
              : { label: 'Ok · ٹھیک', cls: 'text-emerald-700' };

          const progressPct = Math.min(100, Math.round((product.stock / 50) * 100));

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div>
                {/* Top row: Image + Title + Edit/Delete */}
                <div className="flex items-start gap-3.5">
                  <ProductVisual
                    visualKey={product.visualKey}
                    imageUrl={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-2xl shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                      <span className="font-num text-slate-400">
                        {product.sku}
                      </span>
                    </div>

                    <div className="font-urdu text-lg font-bold text-slate-900 truncate mt-0.5">
                      {product.urduName}
                    </div>
                    <div className="text-xs font-medium text-slate-600 truncate">
                      {product.name} · {product.unit}
                    </div>
                    <div className="font-urdu text-[11px] text-slate-400 truncate mt-0.5">
                      {categoryTrailLabel(product.categoryId)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      title="Edit"
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product.id)}
                      title="Delete"
                      className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price & Stock Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-num text-lg font-extrabold text-slate-900">
                      {formatRs(product.price)}
                    </span>
                    <span className="font-num text-sm font-bold text-slate-700">
                      {product.stock} <span className="font-urdu text-xs">موجود</span>
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        product.stock <= 0
                          ? 'bg-rose-500'
                          : product.stock <= 10
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Quick Stock Adjustment */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[-1, 1, 5, 10].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => onAdjustStock(product.id, delta)}
                        className={`font-num min-h-[40px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          delta < 0
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Toggles */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                {PLATFORMS.map((plat) => {
                  const active = product.platforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => onTogglePlatform(product.id, plat.id)}
                      className={`min-h-[40px] px-1.5 py-1 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                    >
                      <div className="font-urdu text-[11px] font-semibold leading-tight">
                        {plat.urduName}
                      </div>
                      <div className="text-[9px] opacity-80">{plat.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Item' : 'Naya Item'} ·{' '}
                <span className="font-urdu">سامان</span>
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {/* Photo Upload + Preview */}
              <div className="flex items-center gap-4">
                <ProductVisual
                  visualKey={visualKeyDraft}
                  imageUrl={imageDraft}
                  alt={nameDraft || 'Item'}
                  className="w-20 h-20 rounded-2xl shrink-0"
                />
                <div className="space-y-2">
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
                  {imageDraft && (
                    <button
                      type="button"
                      onClick={() => setImageDraft(undefined)}
                      className="block text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Roman Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="Chakki Atta"
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
                    value={urduDraft}
                    onChange={(e) => setUrduDraft(e.target.value)}
                    placeholder="چکی آٹا"
                    className="font-urdu w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={skuDraft}
                    onChange={(e) => setSkuDraft(e.target.value)}
                    className="font-num w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Unit · وزن
                  </label>
                  <input
                    type="text"
                    value={unitDraft}
                    onChange={(e) => setUnitDraft(e.target.value)}
                    placeholder="1kg"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Icon Art
                  </label>
                  <select
                    value={visualKeyDraft}
                    onChange={(e) =>
                      setVisualKeyDraft(e.target.value as ProductVisualKey)
                    }
                    className="w-full min-h-[44px] px-2.5 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    {VISUAL_KEY_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label} · {opt.urduLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category · کیٹیگری
                </label>
                <select
                  value={categoryDraft}
                  onChange={(e) => setCategoryDraft(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryTrail(categories, c.id)
                        .map((n) => `${n.urduName} (${n.name})`)
                        .join(' › ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Price (Rs) · قیمت
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={priceDraft}
                    onChange={(e) => setPriceDraft(e.target.value)}
                    className="font-num w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock Qty · تعداد
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stockDraft}
                    onChange={(e) => setStockDraft(e.target.value)}
                    className="font-num w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Active Platforms · پلیٹ فارم
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PLATFORMS.map((plat) => {
                    const active = platformsDraft.includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => toggleDraftPlatform(plat.id)}
                        className={`min-h-[44px] rounded-xl border text-xs font-bold cursor-pointer ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <div className="font-urdu">{plat.urduName}</div>
                        <div className="text-[10px] opacity-80">{plat.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 cursor-pointer"
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
