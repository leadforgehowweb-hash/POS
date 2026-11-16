import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Edit3,
  Minus,
  Plus,
  QrCode,
  Receipt,
  ScanBarcode,
  Search,
  ShoppingCart,
  Trash2,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import {
  CategoryNode,
  Client,
  Order,
  OrderItem,
  PaymentMethod,
  PlatformId,
  Product,
} from '../types';
import {
  PLATFORMS,
  formatRs,
  formatSerial,
  getCategoryTrail,
  getDescendantIds,
  getDirectChildren,
} from '../utils/format';
import { ProductVisual } from './ProductVisual';

interface PosViewProps {
  categories: CategoryNode[];
  products: Product[];
  clients: Client[];
  initialCategoryId: string | null;
  scanTriggerNonce: number;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onCompleteOrder: (payload: {
    platform: PlatformId;
    paymentMethod: PaymentMethod;
    clientId: string | null;
    items: OrderItem[];
    total: number;
  }) => Order;
}

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  urdu: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'cash',
    label: 'Cash',
    urdu: 'نقد',
    icon: <Banknote className="w-4 h-4" />,
  },
  {
    id: 'card',
    label: 'Card',
    urdu: 'کارڈ',
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: 'qr',
    label: 'QR',
    urdu: 'کیو آر',
    icon: <QrCode className="w-4 h-4" />,
  },
  {
    id: 'udhaar',
    label: 'Udhaar',
    urdu: 'ادھار',
    icon: <Wallet className="w-4 h-4" />,
  },
];

export const PosView: React.FC<PosViewProps> = ({
  categories,
  products,
  clients,
  initialCategoryId,
  scanTriggerNonce,
  onUpdateProductPrice,
  onCompleteOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategoryId
  );
  const [platform, setPlatform] = useState<PlatformId>('dukaan');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cart, setCart] = useState<{ productId: string; qty: number }[]>([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const [scanBanner, setScanBanner] = useState<string | null>(null);
  const scanCursorRef = useRef(0);

  const [editingPriceProduct, setEditingPriceProduct] = useState<Product | null>(
    null
  );
  const [priceDraft, setPriceDraft] = useState('');

  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  const addProductToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });
  };

  const triggerBarcodeScan = () => {
    const inStock = products.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      setScanBanner('Koi item stock mein mojood nahi · اسٹاک خالی ہے');
      return;
    }
    const target = inStock[scanCursorRef.current % inStock.length];
    scanCursorRef.current += 1;
    addProductToCart(target);
    setScanBanner(`Scanned ${target.sku}: ${target.name} · ${target.urduName}`);
    setTimeout(() => {
      setScanBanner((current) =>
        current?.includes(target.sku) ? null : current
      );
    }, 2600);
  };

  useEffect(() => {
    if (scanTriggerNonce > 0) {
      triggerBarcodeScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanTriggerNonce]);

  const categoryTrail = useMemo(
    () =>
      selectedCategoryId
        ? getCategoryTrail(categories, selectedCategoryId)
        : [],
    [categories, selectedCategoryId]
  );

  const childCategories = useMemo(
    () => getDirectChildren(categories, selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const rootCategories = useMemo(
    () => getDirectChildren(categories, null),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allowedCatIds = selectedCategoryId
      ? new Set(getDescendantIds(categories, selectedCategoryId))
      : null;

    return products.filter((p) => {
      if (allowedCatIds && !allowedCatIds.has(p.categoryId)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.urduName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, categories, selectedCategoryId, searchQuery]);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const cartLines = useMemo(() => {
    return cart
      .map((line) => {
        const product = productMap.get(line.productId);
        if (!product) return null;
        return {
          ...line,
          product,
          subtotal: product.price * line.qty,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, productMap]);

  const cartTotal = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.subtotal, 0),
    [cartLines]
  );

  const cartUnitsCount = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.qty, 0),
    [cartLines]
  );

  const adjustCartQty = (productId: string, delta: number) => {
    const product = productMap.get(productId);
    if (!product) return;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = Math.min(product.stock, item.qty + delta);
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleCheckout = () => {
    if (cartLines.length === 0) return;
    const effectiveClientId =
      paymentMethod === 'udhaar' && !selectedClientId
        ? clients[0]?.id || null
        : selectedClientId || null;

    const orderItems: OrderItem[] = cartLines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      urduName: l.product.urduName,
      unit: l.product.unit,
      price: l.product.price,
      qty: l.qty,
      visualKey: l.product.visualKey,
      imageUrl: l.product.imageUrl,
    }));

    const created = onCompleteOrder({
      platform,
      paymentMethod,
      clientId: effectiveClientId,
      items: orderItems,
      total: cartTotal,
    });

    setCart([]);
    setMobileCartOpen(false);
    setReceiptOrder(created);
  };

  const openPriceEditor = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEditingPriceProduct(product);
    setPriceDraft(String(product.price));
  };

  const saveQuickPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceProduct) return;
    const parsed = Number(priceDraft);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onUpdateProductPrice(editingPriceProduct.id, Math.round(parsed));
    setEditingPriceProduct(null);
  };

  const receiptClient = receiptOrder?.clientId
    ? clients.find((c) => c.id === receiptOrder.clientId)
    : undefined;

  const renderRegisterContent = () => (
    <div className="flex flex-col h-full">
      {/* Platform Selector */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Platform · <span className="font-urdu">پلیٹ فارم</span>
          </span>
          <span className="font-num text-xs font-semibold text-slate-600">
            {cartUnitsCount} items
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {PLATFORMS.map((p) => {
            const active = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`min-h-[44px] px-2 py-1.5 rounded-xl text-center transition-all border cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-urdu text-xs font-semibold leading-tight">
                  {p.urduName}
                </div>
                <div className="text-[10px] opacity-80 truncate">{p.name}</div>
              </button>
            );
          })}
        </div>

        {/* Client Picker */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Client · گاہک</span>
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Walk-in · عام گاہک</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {formatSerial(c.serialNo)} {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[200px]">
        {cartLines.length === 0 ? (
          <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center text-slate-400 px-4">
            <ShoppingCart className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">
              Bill Khali Hai · <span className="font-urdu">بل خالی ہے</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Samaan par tap karein · سامان پر کلک کریں
            </p>
          </div>
        ) : (
          cartLines.map(({ product, qty, subtotal }) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70"
            >
              <ProductVisual
                visualKey={product.visualKey}
                imageUrl={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-xl shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-urdu text-sm font-bold text-slate-900 truncate">
                  {product.urduName}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {product.name} ·{' '}
                  <span className="font-num">{formatRs(product.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => adjustCartQty(product.id, -1)}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  {qty === 1 ? (
                    <Trash2 className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </button>
                <span className="font-num w-6 text-center text-sm font-bold text-slate-900">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => adjustCartQty(product.id, 1)}
                  disabled={qty >= product.stock}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="font-num text-sm font-bold text-slate-900 w-20 text-right shrink-0">
                {formatRs(subtotal)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment & Total Checkout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          {PAYMENT_OPTIONS.map((opt) => {
            const active = paymentMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentMethod(opt.id)}
                className={`min-h-[48px] px-2 py-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  active
                    ? opt.id === 'udhaar'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.icon}
                <span className="text-[11px] font-bold leading-none mt-0.5">
                  {opt.label}
                </span>
                <span className="font-urdu text-[10px] leading-none opacity-90">
                  {opt.urdu}
                </span>
              </button>
            );
          })}
        </div>

        {paymentMethod === 'udhaar' && !selectedClientId && clients[0] && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-medium">
            Udhaar default: {formatSerial(clients[0].serialNo)} {clients[0].name}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Kul Raqam · <span className="font-urdu">کل رقم</span>
            </div>
          </div>
          <div className="font-num text-2xl font-extrabold text-slate-900">
            {formatRs(cartTotal)}
          </div>
        </div>

        <button
          type="button"
          disabled={cartLines.length === 0}
          onClick={handleCheckout}
          className="w-full min-h-[50px] px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-bold text-base shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
        >
          <span>Bill Complete</span>
          <span aria-hidden="true">·</span>
          <span className="font-urdu text-lg">بل مکمل کریں</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left/Main Catalog Area */}
      <div className="lg:col-span-8 space-y-4">
        {/* Search & Barcode Scan Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Talash · تلاش (Atta, آٹا, ND-101)..."
              className="w-full min-h-[48px] pl-11 pr-10 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={triggerBarcodeScan}
            className="min-h-[48px] px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ScanBarcode className="w-5 h-5 text-sky-400" />
            <span>Scan</span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span className="font-urdu">اسکین</span>
          </button>
        </div>

        {/* Scan Pulse Feedback Banner */}
        {scanBanner && (
          <div className="rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3 flex items-center justify-between gap-3 text-sky-900">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <ScanBarcode className="w-5 h-5 text-sky-600 shrink-0" />
              <span>{scanBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setScanBanner(null)}
              className="text-sky-600 hover:text-sky-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Multi-level Category Filter Strip & Breadcrumbs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5">
          {/* Root level / active trail */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategoryId === null
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sab · <span className="font-urdu">سب</span>
            </button>

            {rootCategories.map((cat) => {
              const isInTrail =
                categoryTrail[0]?.id === cat.id ||
                selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isInTrail
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="font-urdu mr-1.5">{cat.urduName}</span>
                  <span className="text-xs opacity-80">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Drill-down Breadcrumb + Child Sub-category Chips */}
          {selectedCategoryId && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              {categoryTrail.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {idx > 0 && (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(node.id)}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      node.id === selectedCategoryId
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {node.name} · <span className="font-urdu">{node.urduName}</span>
                  </button>
                </React.Fragment>
              ))}

              {childCategories.length > 0 && (
                <>
                  <span className="h-4 w-px bg-slate-200 mx-1" aria-hidden="true" />
                  {childCategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(sub.id)}
                      className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + {sub.name}{' '}
                      <span className="font-urdu ml-1">{sub.urduName}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Visual Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
            <p className="text-base font-bold text-slate-800">
              Koi Item Nahi Mila · <span className="font-urdu">کوئی سامان نہیں ملا</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
              className="mt-4 min-h-[44px] px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold cursor-pointer"
            >
              Sab Dikhayein · سب دیکھیں
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => {
              const inCart = cart.find((c) => c.productId === product.id)?.qty || 0;
              const outOfStock = product.stock <= 0;
              return (
                <div
                  key={product.id}
                  onClick={() => addProductToCart(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      addProductToCart(product);
                    }
                  }}
                  className={`group relative bg-white rounded-2xl border transition-all p-3 flex flex-col justify-between text-left select-none ${
                    outOfStock
                      ? 'opacity-55 border-slate-200 cursor-not-allowed'
                      : inCart > 0
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm cursor-pointer active:scale-[0.98]'
                      : 'border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-2.5">
                      <ProductVisual
                        visualKey={product.visualKey}
                        imageUrl={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full"
                      />
                      {/* Quick Price Edit Pencil Button */}
                      <button
                        type="button"
                        onClick={(e) => openPriceEditor(e, product)}
                        title="Edit Price · قیمت بدلیں"
                        className="absolute top-2 left-2 w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 shadow-sm border border-slate-200/80 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Cart Qty Indicator */}
                      {inCart > 0 && (
                        <span className="font-num absolute top-2 right-2 min-w-[28px] h-7 px-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow">
                          {inCart}×
                        </span>
                      )}
                    </div>

                    <div className="font-urdu text-base font-bold text-slate-900 leading-snug truncate">
                      {product.urduName}
                    </div>
                    <div className="flex items-center justify-between gap-1 text-xs text-slate-500 mt-0.5">
                      <span className="truncate font-medium">{product.name}</span>
                      <span className="font-num shrink-0">{product.unit}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-num text-base font-extrabold text-slate-900">
                        {formatRs(product.price)}
                      </div>
                      <div
                        className={`font-num text-[11px] font-semibold ${
                          product.stock <= 0
                            ? 'text-rose-600'
                            : product.stock <= 10
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {product.stock} <span className="font-urdu">باقی</span>
                      </div>
                    </div>

                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        outOfStock
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Right Register Panel */}
      <div className="hidden lg:block lg:col-span-4 sticky top-20 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-h-[calc(100vh-6.5rem)] flex flex-col">
        {renderRegisterContent()}
      </div>

      {/* Mobile Sticky Cart Bar */}
      {cartLines.length > 0 && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="w-full min-h-[54px] px-5 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="font-num w-8 h-8 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">
                {cartUnitsCount}
              </span>
              <span className="font-semibold text-sm">
                Bill Dekhein · <span className="font-urdu">بل دیکھیں</span>
              </span>
            </div>
            <span className="font-num text-lg font-extrabold text-emerald-300">
              {formatRs(cartTotal)}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Cart Drawer Sheet */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <div className="font-bold text-slate-900">
                Bill Register · <span className="font-urdu">بل رجسٹر</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileCartOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderRegisterContent()}</div>
          </div>
        </div>
      )}

      {/* Quick Price Edit Modal */}
      {editingPriceProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Price Edit · <span className="font-urdu">قیمت بدلیں</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPriceProduct(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveQuickPrice} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <ProductVisual
                  visualKey={editingPriceProduct.visualKey}
                  imageUrl={editingPriceProduct.imageUrl}
                  alt={editingPriceProduct.name}
                  className="w-14 h-14 rounded-xl shrink-0"
                />
                <div>
                  <div className="font-urdu text-base font-bold text-slate-900">
                    {editingPriceProduct.urduName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {editingPriceProduct.name} ({editingPriceProduct.unit})
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nayi Qeemat (Rs) · <span className="font-urdu">نئی قیمت</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  autoFocus
                  value={priceDraft}
                  onChange={(e) => setPriceDraft(e.target.value)}
                  className="font-num w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPriceProduct(null)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Save · محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Confirmation Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-100 shrink-0" />
                <div>
                  <div className="text-lg font-bold">
                    Bill Mukammal · <span className="font-urdu">بل مکمل</span>
                  </div>
                  <div className="font-num text-xs text-emerald-100">
                    Bill #{receiptOrder.orderNo} · Nazim Dukan
                  </div>
                </div>
              </div>
              <Receipt className="w-6 h-6 text-emerald-200" />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span>
                  Platform:{' '}
                  <strong className="text-slate-800 uppercase">
                    {receiptOrder.platform}
                  </strong>
                </span>
                <span>
                  Payment:{' '}
                  <strong className="text-slate-800 uppercase">
                    {receiptOrder.paymentMethod}
                  </strong>
                </span>
              </div>

              {receiptClient && (
                <div className="text-sm font-semibold text-slate-800 bg-slate-50 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                  <span>
                    {formatSerial(receiptClient.serialNo)} {receiptClient.name}
                  </span>
                  <span className="font-urdu">{receiptClient.urduName}</span>
                </div>
              )}

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {receiptOrder.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <span className="font-medium text-slate-900">
                        {item.name}
                      </span>{' '}
                      <span className="font-urdu text-slate-600 text-xs">
                        ({item.urduName})
                      </span>
                      <span className="font-num text-xs text-slate-500 ml-1.5">
                        × {item.qty}
                      </span>
                    </div>
                    <span className="font-num font-bold text-slate-900">
                      {formatRs(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">
                  Kul Total · <span className="font-urdu">کل</span>
                </span>
                <span className="font-num text-2xl font-extrabold text-emerald-700">
                  {formatRs(receiptOrder.total)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="w-full min-h-[48px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm cursor-pointer"
              >
                Naya Bill Banayein · نیا بل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
