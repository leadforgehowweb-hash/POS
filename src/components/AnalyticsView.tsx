import React, { useMemo, useState } from 'react';
import { Plus, Trophy } from 'lucide-react';
import { CategoryNode, Client, Order, PlatformId, Product } from '../types';
import {
  PLATFORMS,
  formatRs,
  formatSerial,
  getInitials,
  getRootCategory,
} from '../utils/format';
import { ProductVisual } from './ProductVisual';

interface AnalyticsViewProps {
  categories: CategoryNode[];
  products: Product[];
  orders: Order[];
  clients: Client[];
  onQuickRestock: (productId: string, amount: number) => void;
}

type LeaderPeriod = 'week' | 'month' | 'total';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  categories,
  products,
  orders,
  clients,
  onQuickRestock,
}) => {
  const [leaderPeriod, setLeaderPeriod] = useState<LeaderPeriod>('total');

  const kpis = useMemo(() => {
    const totalSale = orders.reduce((s, o) => s + o.total, 0);
    const billsCount = orders.length;
    const unitsSold = orders.reduce(
      (s, o) => s + o.items.reduce((is, item) => is + item.qty, 0),
      0
    );
    const stockValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    return { totalSale, billsCount, unitsSold, stockValue };
  }, [orders, products]);

  // Top Customers Leaderboard
  const topCustomers = useMemo(() => {
    const now = Date.now();
    const cutoff =
      leaderPeriod === 'week'
        ? now - 7 * 24 * 3600 * 1000
        : leaderPeriod === 'month'
        ? now - 30 * 24 * 3600 * 1000
        : 0;

    const map = new Map<
      string,
      { spent: number; itemsCount: number; billsCount: number }
    >();
    for (const order of orders) {
      if (!order.clientId) continue;
      if (cutoff > 0 && new Date(order.createdAt).getTime() < cutoff) continue;
      const entry = map.get(order.clientId) || {
        spent: 0,
        itemsCount: 0,
        billsCount: 0,
      };
      entry.spent += order.total;
      entry.billsCount += 1;
      entry.itemsCount += order.items.reduce((s, i) => s + i.qty, 0);
      map.set(order.clientId, entry);
    }

    return clients
      .map((client) => ({
        client,
        ...(map.get(client.id) || { spent: 0, itemsCount: 0, billsCount: 0 }),
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [clients, orders, leaderPeriod]);

  // Category Breakdown Donut Data
  const categoryBreakdown = useMemo(() => {
    const productMap = new Map(products.map((p) => [p.id, p]));
    const totals = new Map<string, { cat: CategoryNode; revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const prod = productMap.get(item.productId);
        const root = prod
          ? getRootCategory(categories, prod.categoryId)
          : undefined;
        if (!root) continue;
        const cur = totals.get(root.id) || { cat: root, revenue: 0 };
        cur.revenue += item.price * item.qty;
        totals.set(root.id, cur);
      }
    }

    const list = Array.from(totals.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
    const totalRev = list.reduce((s, x) => s + x.revenue, 0);
    return { list, totalRev };
  }, [orders, products, categories]);

  // Recent Orders Vertical Bar Chart
  const recentBars = useMemo(() => {
    const slice = [...orders].slice(0, 7).reverse();
    const maxTotal = Math.max(1, ...slice.map((o) => o.total));
    return { slice, maxTotal };
  }, [orders]);

  // Platform Progress Bars
  const platformStats = useMemo(() => {
    const stats = new Map<PlatformId, { revenue: number; count: number }>();
    for (const p of PLATFORMS) stats.set(p.id, { revenue: 0, count: 0 });
    for (const order of orders) {
      const cur = stats.get(order.platform) || { revenue: 0, count: 0 };
      cur.revenue += order.total;
      cur.count += 1;
      stats.set(order.platform, cur);
    }
    const maxRev = Math.max(
      1,
      ...Array.from(stats.values()).map((x) => x.revenue)
    );
    return { stats, maxRev };
  }, [orders]);

  // Top Selling Items
  const topItems = useMemo(() => {
    const productMap = new Map(products.map((p) => [p.id, p]));
    const map = new Map<
      string,
      {
        productId: string;
        name: string;
        urduName: string;
        visualKey: Product['visualKey'];
        imageUrl?: string;
        units: number;
        revenue: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const live = productMap.get(item.productId);
        const cur = map.get(item.productId) || {
          productId: item.productId,
          name: live?.name || item.name,
          urduName: live?.urduName || item.urduName,
          visualKey: live?.visualKey || item.visualKey,
          imageUrl: live?.imageUrl || item.imageUrl,
          units: 0,
          revenue: 0,
        };
        cur.units += item.qty;
        cur.revenue += item.price * item.qty;
        map.set(item.productId, cur);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [orders, products]);

  // Low Stock Items (<= 10)
  const lowStockItems = useMemo(
    () =>
      products
        .filter((p) => p.stock <= 10)
        .sort((a, b) => a.stock - b.stock),
    [products]
  );

  // SVG Donut Stroke Dash Calculation
  const donutRadius = 56;
  const donutCirc = 2 * Math.PI * donutRadius;
  let runningOffset = 0;

  return (
    <div className="w-full space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">
            Kul Sale · <span className="font-urdu text-emerald-700">کل سیل</span>
          </div>
          <div className="font-num text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            {formatRs(kpis.totalSale)}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">
            Bills · <span className="font-urdu text-sky-700">بل</span>
          </div>
          <div className="font-num text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            {kpis.billsCount}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">
            Sold · <span className="font-urdu text-amber-700">بکا مال</span>
          </div>
          <div className="font-num text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            {kpis.unitsSold}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">
            Stock · <span className="font-urdu text-violet-700">مال قیمت</span>
          </div>
          <div className="font-num text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            {formatRs(kpis.stockValue)}
          </div>
        </div>
      </div>

      {/* Top Customers Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">
              Top Customers ·{' '}
              <span className="font-urdu">زیادہ خریداری کرنے والے گاہک</span>
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start">
            {(
              [
                { id: 'week', label: 'Week', urdu: 'ہفتہ' },
                { id: 'month', label: 'Month', urdu: 'مہینہ' },
                { id: 'total', label: 'Total', urdu: 'کل' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeaderPeriod(tab.id)}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold cursor-pointer ${
                  leaderPeriod === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                {tab.label} · <span className="font-urdu">{tab.urdu}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {topCustomers.map(({ client, spent, itemsCount, billsCount }, idx) => (
            <div
              key={client.id}
              className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: client.colorHex }}
                  className="w-10 h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden"
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
                <div className="min-w-0">
                  <div className="font-num text-[11px] font-bold text-amber-700">
                    #{idx + 1} · {formatSerial(client.serialNo)}
                  </div>
                  <div className="font-urdu text-sm font-bold text-slate-900 truncate">
                    {client.urduName}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                <span className="font-num text-xs text-slate-500">
                  {itemsCount} items · {billsCount}b
                </span>
                <span className="font-num text-sm font-extrabold text-emerald-700">
                  {formatRs(spent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Category Breakdown Donut */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Categories · <span className="font-urdu">کیٹیگری سیل</span>
          </h3>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5 my-auto">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={donutRadius}
                  stroke="#F1F5F9"
                  strokeWidth="20"
                  fill="none"
                />
                {categoryBreakdown.list.map(({ cat, revenue }) => {
                  const pct =
                    categoryBreakdown.totalRev > 0
                      ? revenue / categoryBreakdown.totalRev
                      : 0;
                  const segLen = pct * donutCirc;
                  const dashOffset = -runningOffset;
                  runningOffset += segLen;
                  return (
                    <circle
                      key={cat.id}
                      cx="72"
                      cy="72"
                      r={donutRadius}
                      stroke={cat.colorHex}
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={`${segLen} ${donutCirc}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold text-slate-400">
                  Total
                </span>
                <span className="font-num text-sm font-extrabold text-slate-900">
                  {formatRs(categoryBreakdown.totalRev)}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              {categoryBreakdown.list.map(({ cat, revenue }) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      style={{ backgroundColor: cat.colorHex }}
                      className="w-3 h-3 rounded-sm shrink-0"
                    />
                    <span className="font-urdu font-semibold text-slate-800 truncate">
                      {cat.urduName}
                    </span>
                  </div>
                  <span className="font-num font-bold text-slate-900 shrink-0">
                    {formatRs(revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Taza Bills Vertical Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Taza Bills · <span className="font-urdu">تازہ بل</span>
          </h3>

          <div className="h-48 flex items-end justify-between gap-2.5 pt-6">
            {recentBars.slice.map((order) => {
              const heightPct = Math.max(
                14,
                Math.round((order.total / recentBars.maxTotal) * 100)
              );
              return (
                <div
                  key={order.id}
                  className="group flex-1 h-full flex flex-col items-center justify-end gap-1.5"
                >
                  <div className="font-num text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatRs(order.total)}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-700 group-hover:to-teal-500 transition-all"
                  />
                  <span className="font-num text-[11px] font-semibold text-slate-500">
                    #{order.orderNo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Platforms Horizontal Progress Bars */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Platforms · <span className="font-urdu">پلیٹ فارم</span>
          </h3>

          <div className="space-y-4 my-auto">
            {PLATFORMS.map((plat) => {
              const st = platformStats.stats.get(plat.id) || {
                revenue: 0,
                count: 0,
              };
              const pct = Math.round(
                (st.revenue / platformStats.maxRev) * 100
              );
              return (
                <div key={plat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      <span className="font-urdu mr-1.5">{plat.urduName}</span>
                      {plat.name}
                      <span className="font-num text-slate-400 ml-1.5">
                        ({st.count})
                      </span>
                    </span>
                    <span className="font-num font-bold text-slate-900">
                      {formatRs(st.revenue)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{
                        width: `${pct}%`,
                        backgroundColor: plat.colorHex,
                      }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Items & Kam Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Items */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Top Items · <span className="font-urdu">زیادہ بکنے والا</span>
          </h3>

          <div className="space-y-3">
            {topItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProductVisual
                    visualKey={item.visualKey}
                    imageUrl={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-urdu text-sm font-bold text-slate-900 truncate">
                      {item.urduName}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {item.name} ·{' '}
                      <span className="font-num font-semibold">
                        {item.units} sold
                      </span>
                    </div>
                  </div>
                </div>

                <div className="font-num text-sm font-extrabold text-emerald-700 shrink-0">
                  {formatRs(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kam Stock */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Kam Stock · <span className="font-urdu">کم اسٹاک</span>
          </h3>

          {lowStockItems.length === 0 ? (
            <div className="py-10 text-center text-sm font-semibold text-emerald-700">
              Tamam Samaan Stock Mein Hai · تمام سامان اسٹاک میں ہے
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductVisual
                      visualKey={prod.visualKey}
                      imageUrl={prod.imageUrl}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-urdu text-sm font-bold text-slate-900 truncate">
                        {prod.urduName}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {prod.name} ·{' '}
                        <span className="font-num font-bold text-rose-600">
                          {prod.stock} باقی
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onQuickRestock(prod.id, 10)}
                    className="font-num min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>10</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
