import React, { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  MapPin,
  Phone,
  UserPlus,
  X,
} from 'lucide-react';
import { Client } from '../types';
import {
  COLOR_SWATCHES,
  formatRs,
  formatSerial,
  formatUdhaarElapsed,
  getInitials,
} from '../utils/format';

interface KhataViewProps {
  clients: Client[];
  onAdjustUdhaar: (clientId: string, delta: number) => void;
  onClearUdhaar: (clientId: string) => void;
  onAddClient: (client: Omit<Client, 'id' | 'serialNo'>) => void;
}

export const KhataView: React.FC<KhataViewProps> = ({
  clients,
  onAdjustUdhaar,
  onClearUdhaar,
  onAddClient,
}) => {
  const [filterMode, setFilterMode] = useState<'debtors' | 'all'>('debtors');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [nameDraft, setNameDraft] = useState('');
  const [urduDraft, setUrduDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [addressDraft, setAddressDraft] = useState('');
  const [udhaarDraft, setUdhaarDraft] = useState('500');

  const totalUdhaar = useMemo(
    () => clients.reduce((sum, c) => sum + c.udhaarBalance, 0),
    [clients]
  );

  const sortedClients = useMemo(() => {
    const base =
      filterMode === 'debtors'
        ? clients.filter((c) => c.udhaarBalance > 0)
        : clients;
    return [...base].sort((a, b) => a.serialNo - b.serialNo);
  }, [clients, filterMode]);

  const handleAddKhata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameDraft.trim() || !urduDraft.trim()) return;
    const balance = Math.max(0, Math.round(Number(udhaarDraft) || 0));
    onAddClient({
      name: nameDraft.trim(),
      urduName: urduDraft.trim(),
      phone: phoneDraft.trim() || '0300-0000000',
      address: addressDraft.trim() || 'Local Mohalla',
      udhaarBalance: balance,
      udhaarSince: balance > 0 ? new Date().toISOString() : null,
      colorHex: COLOR_SWATCHES[clients.length % COLOR_SWATCHES.length],
    });
    setNameDraft('');
    setUrduDraft('');
    setPhoneDraft('');
    setAddressDraft('');
    setUdhaarDraft('500');
    setAddModalOpen(false);
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-700">
            Kul Udhaar · <span className="font-urdu text-sm">کل ادھار لسٹ</span>
          </div>
          <div className="font-num text-3xl font-extrabold text-slate-900 mt-0.5">
            {formatRs(totalUdhaar)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilterMode('debtors')}
              className={`min-h-[40px] px-4 rounded-xl text-xs font-bold cursor-pointer ${
                filterMode === 'debtors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Udhaar Walay · <span className="font-urdu">ادھار والے</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`min-h-[40px] px-4 rounded-xl text-xs font-bold cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Sab · <span className="font-urdu">سب</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="min-h-[46px] px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add</span>
            <span aria-hidden="true">·</span>
            <span className="font-urdu">نیا کھاتہ</span>
          </button>
        </div>
      </div>

      {/* Serial-Numbered Udhaar Ledger */}
      {sortedClients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
          <p className="text-base font-bold text-slate-800">
            Koi Baqaya Udhaar Nahi ·{' '}
            <span className="font-urdu">کوئی بقایا ادھار نہیں</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedClients.map((client) => {
            const elapsed = formatUdhaarElapsed(client.udhaarSince);
            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Prominent Serial Number Badge */}
                  <div className="font-num w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {formatSerial(client.serialNo)}
                  </div>

                  {/* Avatar */}
                  <div
                    style={{ backgroundColor: client.colorHex }}
                    className="w-12 h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden"
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

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-urdu text-lg font-bold text-slate-900">
                        {client.urduName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {client.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-num inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {client.phone}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {client.address}
                      </span>
                      {client.udhaarBalance > 0 && elapsed && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {elapsed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Balance & Quick Controls */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right mr-2">
                    <div className="text-[11px] font-semibold text-slate-400">
                      Baqaya · بقایا
                    </div>
                    <div
                      className={`font-num text-xl font-extrabold ${
                        client.udhaarBalance > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {formatRs(client.udhaarBalance)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAdjustUdhaar(client.id, 100)}
                      className="font-num min-h-[44px] px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold cursor-pointer"
                    >
                      +100
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustUdhaar(client.id, 500)}
                      className="font-num min-h-[44px] px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold cursor-pointer"
                    >
                      +500
                    </button>
                    <button
                      type="button"
                      disabled={client.udhaarBalance <= 0}
                      onClick={() => onAdjustUdhaar(client.id, -500)}
                      className="font-num min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold cursor-pointer"
                    >
                      -500
                    </button>
                    <button
                      type="button"
                      disabled={client.udhaarBalance <= 0}
                      onClick={() => onClearUdhaar(client.id)}
                      className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span className="font-urdu text-sm">وصول</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Udhaar Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Naya Khata · <span className="font-urdu">نیا کھاتہ</span>
              </h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddKhata} className="p-6 space-y-4">
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
                    placeholder="Usman Raza"
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
                    placeholder="عثمان رضا"
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
                    placeholder="0300-1234567"
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
                  placeholder="Gali 5, Madina Colony"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="min-h-[44px] px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold cursor-pointer"
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
