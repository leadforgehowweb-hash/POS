import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Edit3,
  FolderPlus,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CategoryNode, Product } from '../types';
import {
  COLOR_SWATCHES,
  getCategoryTrail,
  getDescendantIds,
  getDirectChildren,
  readAndResizeImage,
} from '../utils/format';

interface CategoriesViewProps {
  categories: CategoryNode[];
  products: Product[];
  onOpenPosWithCategory: (categoryId: string) => void;
  onAddCategory: (cat: CategoryNode) => void;
  onUpdateCategory: (cat: CategoryNode) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onOpenPosWithCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryNode | null>(null);

  const [nameDraft, setNameDraft] = useState('');
  const [urduDraft, setUrduDraft] = useState('');
  const [colorDraft, setColorDraft] = useState(COLOR_SWATCHES[0]);
  const [imageDraft, setImageDraft] = useState<string | undefined>(undefined);

  const trail = useMemo(
    () =>
      currentParentId ? getCategoryTrail(categories, currentParentId) : [],
    [categories, currentParentId]
  );

  const visibleCategories = useMemo(
    () => getDirectChildren(categories, currentParentId),
    [categories, currentParentId]
  );

  const openAddModal = () => {
    setEditingCat(null);
    setNameDraft('');
    setUrduDraft('');
    setColorDraft(COLOR_SWATCHES[0]);
    setImageDraft(undefined);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryNode) => {
    setEditingCat(cat);
    setNameDraft(cat.name);
    setUrduDraft(cat.urduName);
    setColorDraft(cat.colorHex);
    setImageDraft(cat.imageUrl);
    setModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndResizeImage(file, 360);
      setImageDraft(dataUrl);
    } catch {
      // ignore invalid image
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameDraft.trim() || !urduDraft.trim()) return;
    if (editingCat) {
      onUpdateCategory({
        ...editingCat,
        name: nameDraft.trim(),
        urduName: urduDraft.trim(),
        colorHex: colorDraft,
        imageUrl: imageDraft,
      });
    } else {
      onAddCategory({
        id: `cat-${Date.now()}`,
        name: nameDraft.trim(),
        urduName: urduDraft.trim(),
        parentId: currentParentId,
        colorHex: colorDraft,
        imageUrl: imageDraft,
      });
    }
    setModalOpen(false);
  };

  const currentParent = currentParentId
    ? categories.find((c) => c.id === currentParentId)
    : null;

  return (
    <div className="w-full space-y-5">
      {/* Header Bar + Breadcrumb */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">
            Categories · <span className="font-urdu">کیٹیگری لسٹ</span>
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => setCurrentParentId(null)}
              className={`min-h-[36px] px-3 py-1 rounded-xl font-semibold cursor-pointer ${
                currentParentId === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sab · <span className="font-urdu">سب</span>
            </button>

            {trail.map((node) => (
              <React.Fragment key={node.id}>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setCurrentParentId(node.id)}
                  className={`min-h-[36px] px-3 py-1 rounded-xl font-semibold cursor-pointer ${
                    node.id === currentParentId
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {node.name}{' '}
                  <span className="font-urdu ml-1">{node.urduName}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="min-h-[46px] px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>
            {currentParent
              ? `Add inside ${currentParent.name}`
              : 'New Category'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-urdu">نئی کیٹیگری</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      {visibleCategories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">
            Is mein koi sub-category nahi ·{' '}
            <span className="font-urdu">کوئی ذیلی کیٹیگری نہیں</span>
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[44px] px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold cursor-pointer"
          >
            + Add Sub-Category · ذیلی کیٹیگری شامل کریں
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleCategories.map((cat) => {
            const subCount = getDirectChildren(categories, cat.id).length;
            const descendantIds = new Set(getDescendantIds(categories, cat.id));
            const itemsCount = products.filter((p) =>
              descendantIds.has(p.categoryId)
            ).length;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Visual Banner (Clickable to drill down) */}
                <button
                  type="button"
                  onClick={() => setCurrentParentId(cat.id)}
                  style={{ backgroundColor: cat.colorHex }}
                  className="relative h-36 w-full text-left flex items-end p-4 overflow-hidden cursor-pointer group"
                >
                  {cat.imageUrl ? (
                    <>
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-white/15 to-black/25"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative z-10 w-full flex items-end justify-between gap-2 text-white">
                    <div>
                      <div className="font-urdu text-2xl font-bold leading-snug">
                        {cat.urduName}
                      </div>
                      <div className="text-sm font-semibold text-white/90">
                        {cat.name}
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/80 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Metadata + Actions */}
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="font-num text-xs font-semibold text-slate-600">
                    {subCount} sub · {itemsCount} items
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenPosWithCategory(cat.id)}
                      className="min-h-[40px] px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>POS</span>
                      <span className="font-urdu">بل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      title="Edit"
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      title="Delete"
                      className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCat ? 'Edit Category' : 'New Category'} ·{' '}
                <span className="font-urdu">کیٹیگری</span>
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  style={{ backgroundColor: colorDraft }}
                  className="w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center text-white overflow-hidden"
                >
                  {imageDraft ? (
                    <img
                      src={imageDraft}
                      alt="Category"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-urdu text-lg font-bold">
                      {urduDraft || 'نیا'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo · تصویر</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Color · رنگ
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColorDraft(hex)}
                      style={{ backgroundColor: hex }}
                      className={`w-9 h-9 rounded-xl cursor-pointer ${
                        colorDraft === hex
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-105'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
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
