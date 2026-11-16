import React, { useMemo, useState } from 'react';
import {
  Clock,
  Edit3,
  MapPin,
  Phone,
  Search,
  Trophy,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { Client, Order } from '../types';
import {
  COLOR_SWATCHES,
  formatRs,
  formatSerial,
  formatUdhaarElapsed,
  getInitials,
  readAndResizeImage,
} from '../utils/format';

interface ClientsViewProps {
  clients: Client[];
  orders: Order[];
  onAddClient: (client: Omit<Client, 'id' | 'serialNo'>) => void;
  onUpdateClient: (client: Client) => void;
}

type PeriodFilter = 'all' | 'week' | 'month';

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  onAddClient,
  onUpdateClient,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [topBuyersSort, setTopBuyersSort] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [nameDraft, setNameDraft] = useState('');
  const [urduDraft, setUrduDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [addressDraft, setAddressDraft] = useState('');
  const [udhaarDraft, setUdhaarDraft] = useState('0');
  const [imageDraft, setImageDraft] = useState<string | undefined>(undefined);

  const openAddModal = () => {
    setEditingClient(null);
    setNameDraft('');
    setUrduDraft('');
    setPhoneDraft('');
    setAddressDraft('');
    setUdhaarDraft('0');
    setImageDraft(undefined);
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setNameDraft(client.name);
    setUrduDraft(client.urduName);
    setPhoneDraft(client.phone);
    setAddressDraft(client.address);
    setUdhaarDraft(String(client.udhaarBalance));
    setImageDraft(client.imageUrl);
    setModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndResizeImage(file, 260);
      setImageDraft(dataUrl);
    } catch {
      // ignore invalid image
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameDraft.trim() || !urduDraft.trim()) return;
    const balance = Math.max(0, Math.round(Number(udhaarDraft) || 0));

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: nameDraft.trim(),
        urduName: urduDraft.trim(),
        phone: phoneDraft.trim() || '0300-0000000',
        address: addressDraft.trim() || 'Local Mohalla',
        udhaarBalance: balance,
        udhaarSince:
          balance > 0
            ? editingClient.udhaarSince || new Date().toISOString()
            : null,
        imageUrl: imageDraft,
      });
    } else {
      onAddClient({
        name: nameDraft.trim(),
        urduName: urduDraft.trim(),
        phone: phoneDraft.trim() || '0300-0000000',
        address: addressDraft.trim() || 'Local Mohalla',
        udhaarBalance: balance,
        udhaarSince: balance > 0 ? new Date().toISOString() : null,
        colorHex: COLOR_SWATCHES[clients.length % COLOR_SWATCHES.length],
        imageUrl: imageDraft,
      });
    }
    setModalOpen(false);
  };

  const clientStats = useMemo(() => {
    const now = Date.now();
    const cutoff =
      period === 'week'
        ? now - 7 * 24 * 3600 * 1000
        : period === 'month'
        ? now - 30 * 24 * 3600 * 1000
        : 0;

    const map = new Map<
      string,
      { spent: number; itemsQty: number; billsCount: number }
    >();

    for (const order of orders) {
      if (!order.clientId) continue;
      if (cutoff > 0 && new Date(order.createdAt).getTime() < cutoff) continue;
      const cur = map.get(order.clientId) || {
        spent: 0,
        itemsQty: 0,
        billsCount: 0,
      };
      cur.spent += order.total;
      cur.billsCount += 1;
      cur.itemsQty += order.items.reduce((s, i) => s + i.qty, 0);
      map.set(order.clientId, cur);
    }
    return map;
  }, [orders, period]);

  const displayedClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = clients.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.urduName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    });

    if (topBuyersSort) {
      return [...filtered].sort((a, b) => {
        const spentA = clientStats.get(a.id)?.spent || 0;
        const spentB = clientStats.get(b.id)?.spent || 0;
        return spentB - spentA || a.serialNo - b.serialNo;
      });
    }
    return [...filtered].sort((a, b) => a.serialNo - b.serialNo);
  }, [clients, searchQuery, topBuyersSort, clientStats]);

  const topThreeIds = useMemo(() => {
    const ranked = [...clients]
      .map((c) => ({ id: c.id, spent: clientStats.get(c.id)?.spent || 0 }))
      .filter((x) => x.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3);
    return new Map(ranked.map((r, idx) => [r.id, idx + 1]));
  }, [clients, clientStats]);

  const periodLabel =
    period === 'week'
      ? 'Hafta · ہفتہ'
      : period === 'month'
      ? 'Mahina · مہینہ'
      : 'Kul · کل';

  return (
    <div className="w-full space-y-5">
      {/* Top Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Clients · <span className="font-urdu">گاہک ڈائریکٹری</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              <span className="font-num font-bold text-slate-800">
                {clients.length}
              </span>{' '}
              Clients · Top Buyers Ranking
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[46px] px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Client</span>
            <span aria-hidden="true">·</span>
            <span className="font-urdu">نیا گاہک</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Period Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold cursor-pointer ${
                  period === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Sab · <span className="font-urdu">کل</span>
              </button>
              <button
                type="button"
                onClick={() => setPeriod('week')}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold cursor-pointer ${
                  period === 'week'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Is Hafte · <span className="font-urdu">اس ہفتے</span>
              </button>
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold cursor-pointer ${
                  period === 'month'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Is Mahine · <span className="font-urdu">اس مہینے</span>
              </button>
            </div>

            {/* Top Buyers Sort Toggle */}
            <button
              type="button"
              onClick={() => setTopBuyersSort((s) => !s)}
              className={`min-h-[44px] px-4 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                topBuyersSort
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Top Buyers</span>
              <span className="font-urdu">زیادہ خریداری</span>
            </button>
          </div>

          <div className="relative flex-1 lg:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, phone, address..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedClients.map((client) => {
          const stats = clientStats.get(client.id) || {
            spent: 0,
            itemsQty: 0,
            billsCount: 0,
          };
          const rank = topThreeIds.get(client.id);
          const elapsed = formatUdhaarElapsed(client.udhaarSince);

          return (
            <div
              key={client.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      style={{ backgroundColor: client.colorHex }}
                      className="w-14 h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center shrink-0 overflow-hidden shadow-xs"
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
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-num font-bold text-slate-500">
                          {formatSerial(client.serialNo)}
                        </span>
                        {rank && (
                          <span className="inline-flex items-center gap-1 font-num font-bold text-amber-700">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            Top #{rank}
                          </span>
                        )}
                      </div>
                      <div className="font-urdu text-lg font-bold text-slate-900 truncate">
                        {client.urduName}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 truncate">
                        {client.name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(client)}
                    title="Edit Client"
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="font-num flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>
              </div>

              {/* 3 Stat Boxes */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-2xl p-2.5">
                    <div className="text-[10px] font-semibold text-slate-500 truncate">
                      {periodLabel}
                    </div>
                    <div className="font-num text-sm font-extrabold text-slate-900 mt-0.5">
                      {formatRs(stats.spent)}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-2.5">
                    <div className="text-[10px] font-semibold text-slate-500 truncate">
                      Items · <span className="font-urdu">سامان</span>
                    </div>
                    <div className="font-num text-sm font-extrabold text-slate-900 mt-0.5">
                      {stats.itemsQty}
                      <span className="text-[10px] font-medium text-slate-500 ml-1">
                        ({stats.billsCount}b)
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl p-2.5 ${
                      client.udhaarBalance > 0 ? 'bg-amber-50' : 'bg-emerald-50'
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-slate-600 truncate">
                      Udhaar · <span className="font-urdu">ادھار</span>
                    </div>
                    <div
                      className={`font-num text-sm font-extrabold mt-0.5 ${
                        client.udhaarBalance > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {formatRs(client.udhaarBalance)}
                    </div>
                  </div>
                </div>

                {client.udhaarBalance > 0 && elapsed && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 px-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingClient ? 'Edit Client' : 'New Client'} ·{' '}
                <span className="font-urdu">گاہک</span>
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
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {imageDraft ? (
                    <img
                      src={imageDraft}
                      alt="Client"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(nameDraft || 'ND')
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo · تصویر</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {imageDraft && (
                    <button
                      type="button"
                      onClick={() => setImageDraft(undefined)}
                      className="block text-xs font-semibold text-rose-600 cursor-pointer"
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
                    placeholder="Tariq Mehmood"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
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
                    placeholder="طارق محمود"
                    className="font-urdu w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone · فون
                  </label>
                  <input
                    type="text"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    placeholder="0300-4128891"
                    className="font-num w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Udhaar (Rs) · ادھار
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={udhaarDraft}
                    onChange={(e) => setUdhaarDraft(e.target.value)}
                    className="font-num w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Address · پتہ
                </label>
                <input
                  type="text"
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  placeholder="Gali 4, Madina Colony"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                />
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
