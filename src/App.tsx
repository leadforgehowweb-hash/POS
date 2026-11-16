import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Home,
  Package,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { AnalyticsView } from './components/AnalyticsView';
import { AppHome } from './components/AppHome';
import { CategoriesView } from './components/CategoriesView';
import { ClientsView } from './components/ClientsView';
import { InventoryView } from './components/InventoryView';
import { KhataView } from './components/KhataView';
import { OrdersView } from './components/OrdersView';
import { PosView } from './components/PosView';
import {
  SEED_CATEGORIES,
  SEED_CLIENTS,
  SEED_ORDERS,
  SEED_PRODUCTS,
} from './data/seedData';
import {
  CategoryNode,
  Client,
  CustomShortcut,
  Order,
  OrderItem,
  PaymentMethod,
  PlatformId,
  Product,
  ScreenId,
} from './types';
import { getDescendantIds } from './utils/format';

const STORAGE_KEYS = {
  categories: 'nazim_dukan_categories_v1',
  products: 'nazim_dukan_products_v1',
  orders: 'nazim_dukan_orders_v1',
  clients: 'nazim_dukan_clients_v1',
  shortcuts: 'nazim_dukan_shortcuts_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

const NAV_TABS: { id: ScreenId; label: string; urdu: string }[] = [
  { id: 'home', label: 'Home', urdu: 'ہوم' },
  { id: 'pos', label: 'Bill', urdu: 'بل' },
  { id: 'categories', label: 'Categories', urdu: 'کیٹیگری' },
  { id: 'inventory', label: 'Stock', urdu: 'اسٹاک' },
  { id: 'clients', label: 'Clients', urdu: 'گاہک' },
  { id: 'khata', label: 'Khata', urdu: 'کھاتہ' },
  { id: 'charts', label: 'Report', urdu: 'رپورٹ' },
];

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [posCategoryId, setPosCategoryId] = useState<string | null>(null);
  const [scanTriggerNonce, setScanTriggerNonce] = useState(0);
  const [addProductTriggerNonce, setAddProductTriggerNonce] = useState(0);

  const [categories, setCategories] = useState<CategoryNode[]>(() =>
    loadFromStorage(STORAGE_KEYS.categories, SEED_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage(STORAGE_KEYS.products, SEED_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage(STORAGE_KEYS.orders, SEED_ORDERS)
  );
  const [clients, setClients] = useState<Client[]>(() =>
    loadFromStorage(STORAGE_KEYS.clients, SEED_CLIENTS)
  );
  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>(() =>
    loadFromStorage(STORAGE_KEYS.shortcuts, [])
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    } catch {
      // ignore quota error
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch {
      // ignore quota error
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch {
      // ignore quota error
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
    } catch {
      // ignore quota error
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.shortcuts,
        JSON.stringify(customShortcuts)
      );
    } catch {
      // ignore quota error
    }
  }, [customShortcuts]);

  const handleNavigate = (
    nextScreen: ScreenId,
    options?: {
      categoryId?: string | null;
      triggerScan?: boolean;
      openAddProduct?: boolean;
    }
  ) => {
    setScreen(nextScreen);
    if (options && 'categoryId' in options) {
      setPosCategoryId(options.categoryId ?? null);
    } else if (nextScreen === 'pos') {
      setPosCategoryId(null);
    }
    if (options?.triggerScan) {
      setScanTriggerNonce((n) => n + 1);
    }
    if (options?.openAddProduct) {
      setAddProductTriggerNonce((n) => n + 1);
    }
  };

  // POS Actions
  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  };

  const handleCompleteOrder = (payload: {
    platform: PlatformId;
    paymentMethod: PaymentMethod;
    clientId: string | null;
    items: OrderItem[];
    total: number;
  }): Order => {
    const nextOrderNo =
      orders.reduce((max, o) => Math.max(max, o.orderNo), 400) + 1;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo: nextOrderNo,
      createdAt: new Date().toISOString(),
      platform: payload.platform,
      paymentMethod: payload.paymentMethod,
      clientId: payload.clientId,
      items: payload.items,
      total: payload.total,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Decrement stock
    const qtyMap = new Map(payload.items.map((i) => [i.productId, i.qty]));
    setProducts((prev) =>
      prev.map((p) => {
        const sold = qtyMap.get(p.id);
        if (!sold) return p;
        return { ...p, stock: Math.max(0, p.stock - sold) };
      })
    );

    // Update Udhaar if paymentMethod === 'udhaar'
    if (payload.paymentMethod === 'udhaar' && payload.clientId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== payload.clientId) return c;
          return {
            ...c,
            udhaarBalance: c.udhaarBalance + payload.total,
            udhaarSince: c.udhaarSince || new Date().toISOString(),
          };
        })
      );
    }

    return newOrder;
  };

  // Category Actions
  const handleAddCategory = (cat: CategoryNode) => {
    setCategories((prev) => [...prev, cat]);
  };

  const handleUpdateCategory = (cat: CategoryNode) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const handleDeleteCategory = (categoryId: string) => {
    const target = categories.find((c) => c.id === categoryId);
    if (!target) return;
    const toRemove = new Set(getDescendantIds(categories, categoryId));
    const remaining = categories.filter((c) => !toRemove.has(c.id));
    const fallbackCategoryId =
      (target.parentId && !toRemove.has(target.parentId)
        ? target.parentId
        : remaining[0]?.id) || '';

    setCategories(remaining);
    if (fallbackCategoryId) {
      setProducts((prev) =>
        prev.map((p) =>
          toRemove.has(p.categoryId)
            ? { ...p, categoryId: fallbackCategoryId }
            : p
        )
      );
    }
  };

  // Inventory Actions
  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleTogglePlatform = (productId: string, platform: PlatformId) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const exists = p.platforms.includes(platform);
        const nextPlatforms = exists
          ? p.platforms.filter((x) => x !== platform)
          : [...p.platforms, platform];
        return {
          ...p,
          platforms: nextPlatforms.length > 0 ? nextPlatforms : [platform],
        };
      })
    );
  };

  // Client & Khata Actions
  const handleAddClient = (clientData: Omit<Client, 'id' | 'serialNo'>) => {
    const nextSerial =
      clients.reduce((max, c) => Math.max(max, c.serialNo), 0) + 1;
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      serialNo: nextSerial,
    };
    setClients((prev) => [...prev, newClient]);
  };

  const handleUpdateClient = (updated: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleAdjustUdhaar = (clientId: string, delta: number) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const nextBal = Math.max(0, c.udhaarBalance + delta);
        return {
          ...c,
          udhaarBalance: nextBal,
          udhaarSince:
            nextBal === 0
              ? null
              : c.udhaarSince || new Date().toISOString(),
        };
      })
    );
  };

  const handleClearUdhaar = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, udhaarBalance: 0, udhaarSince: null }
          : c
      )
    );
  };

  // Home Shortcut Actions
  const handleAddShortcut = (shortcut: CustomShortcut) => {
    setCustomShortcuts((prev) => [...prev, shortcut]);
  };

  const handleDeleteShortcut = (id: string) => {
    setCustomShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Sticky Full-Width 3-Zone Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Nazim Dukan
          </button>

          {/* Zone 2: Desktop Single-Line Horizontal Nav Tabs */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-5 lg:gap-7 overflow-x-auto no-scrollbar"
          >
            {NAV_TABS.map((tab) => {
              const active = screen === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleNavigate(tab.id)}
                  className={`relative h-16 px-1 text-sm font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? 'text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span className="font-urdu text-sm">{tab.urdu}</span>
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleNavigate('pos', { categoryId: null })}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Naya Bill</span>
              <span aria-hidden="true" className="opacity-65">
                ·
              </span>
              <span className="font-urdu text-sm">نیا بل</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Width Viewport */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8">
        {screen === 'home' && (
          <AppHome
            categories={categories}
            products={products}
            orders={orders}
            clients={clients}
            customShortcuts={customShortcuts}
            onNavigate={handleNavigate}
            onAddShortcut={handleAddShortcut}
            onDeleteShortcut={handleDeleteShortcut}
          />
        )}

        {screen === 'pos' && (
          <PosView
            categories={categories}
            products={products}
            clients={clients}
            initialCategoryId={posCategoryId}
            scanTriggerNonce={scanTriggerNonce}
            onUpdateProductPrice={handleUpdateProductPrice}
            onCompleteOrder={handleCompleteOrder}
          />
        )}

        {screen === 'categories' && (
          <CategoriesView
            categories={categories}
            products={products}
            onOpenPosWithCategory={(catId) =>
              handleNavigate('pos', { categoryId: catId })
            }
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {screen === 'inventory' && (
          <InventoryView
            categories={categories}
            products={products}
            openAddTriggerNonce={addProductTriggerNonce}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
            onTogglePlatform={handleTogglePlatform}
          />
        )}

        {screen === 'clients' && (
          <ClientsView
            clients={clients}
            orders={orders}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {screen === 'khata' && (
          <KhataView
            clients={clients}
            onAdjustUdhaar={handleAdjustUdhaar}
            onClearUdhaar={handleClearUdhaar}
            onAddClient={handleAddClient}
          />
        )}

        {screen === 'charts' && (
          <AnalyticsView
            categories={categories}
            products={products}
            orders={orders}
            clients={clients}
            onQuickRestock={handleAdjustStock}
          />
        )}

        {screen === 'orders' && (
          <OrdersView orders={orders} clients={clients} />
        )}
      </main>

      {/* Mobile Bottom 5-Column Dock */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center"
      >
        {(
          [
            {
              id: 'home' as ScreenId,
              label: 'ہوم',
              icon: <Home className="w-5 h-5" />,
            },
            {
              id: 'pos' as ScreenId,
              label: 'بل POS',
              icon: <ShoppingBag className="w-5 h-5" />,
            },
            {
              id: 'inventory' as ScreenId,
              label: 'اسٹاک',
              icon: <Package className="w-5 h-5" />,
            },
            {
              id: 'khata' as ScreenId,
              label: 'کھاتہ',
              icon: <BookOpen className="w-5 h-5" />,
            },
            {
              id: 'charts' as ScreenId,
              label: 'رپورٹ',
              icon: <BarChart3 className="w-5 h-5" />,
            },
          ] as const
        ).map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                active ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="font-urdu text-[11px] leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
