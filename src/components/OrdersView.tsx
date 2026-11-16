import React, { useState } from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  Wallet,
  X,
} from 'lucide-react';
import { Client, Order, PaymentMethod } from '../types';
import {
  PLATFORMS,
  formatRs,
  formatSerial,
  formatShortDateTime,
} from '../utils/format';
import { ProductVisual } from './ProductVisual';

interface OrdersViewProps {
  orders: Order[];
  clients: Client[];
}

function getPaymentIcon(method: PaymentMethod) {
  switch (method) {
    case 'cash':
      return <Banknote className="w-4 h-4 text-emerald-700" />;
    case 'card':
      return <CreditCard className="w-4 h-4 text-sky-700" />;
    case 'qr':
      return <QrCode className="w-4 h-4 text-indigo-700" />;
    case 'udhaar':
      return <Wallet className="w-4 h-4 text-amber-700" />;
  }
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, clients }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const selectedClient = selectedOrder?.clientId
    ? clientMap.get(selectedOrder.clientId)
    : undefined;

  return (
    <div className="w-full space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Bills History · <span className="font-urdu">پرانے بل</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            <span className="font-num font-bold text-slate-800">
              {orders.length}
            </span>{' '}
            Completed Bills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order) => {
          const client = order.clientId
            ? clientMap.get(order.clientId)
            : undefined;
          const platformMeta = PLATFORMS.find((p) => p.id === order.platform);
          const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="text-left bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-num text-base font-extrabold text-slate-900">
                      #{order.orderNo}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-500">
                      {formatShortDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {client ? (
                      <>
                        <span className="font-num font-bold">
                          {formatSerial(client.serialNo)}
                        </span>{' '}
                        ·{' '}
                        <span className="font-urdu font-semibold">
                          {client.urduName}
                        </span>
                      </>
                    ) : (
                      <span>Walk-in · عام گاہک</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-num text-lg font-extrabold text-slate-900">
                    {formatRs(order.total)}
                  </div>
                  {order.paymentMethod === 'udhaar' && (
                    <span className="font-urdu text-xs font-bold text-amber-700">
                      ادھار
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center -space-x-2">
                  {order.items.slice(0, 4).map((item) => (
                    <ProductVisual
                      key={item.productId}
                      visualKey={item.visualKey}
                      imageUrl={item.imageUrl}
                      alt={item.name}
                      className="w-9 h-9 rounded-xl border-2 border-white shadow-xs"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <span className="font-num w-9 h-9 rounded-xl bg-slate-100 border-2 border-white text-[11px] font-bold text-slate-700 flex items-center justify-center">
                      +{order.items.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="font-num">{itemCount} items</span>
                  <span>·</span>
                  <span>
                    {platformMeta?.urduName} {platformMeta?.name}
                  </span>
                  {getPaymentIcon(order.paymentMethod)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Itemized Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="font-num text-base font-bold text-slate-900">
                    Bill #{selectedOrder.orderNo}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {formatShortDateTime(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedClient && (
                <div className="rounded-2xl bg-slate-50 px-4 py-2.5 flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>
                    {formatSerial(selectedClient.serialNo)} {selectedClient.name}
                  </span>
                  <span className="font-urdu">{selectedClient.urduName}</span>
                </div>
              )}

              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ProductVisual
                        visualKey={item.visualKey}
                        imageUrl={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-urdu text-sm font-bold text-slate-900 truncate">
                          {item.urduName}
                        </div>
                        <div className="font-num text-xs text-slate-500">
                          {item.name} · {formatRs(item.price)} × {item.qty}
                        </div>
                      </div>
                    </div>
                    <div className="font-num text-sm font-bold text-slate-900 shrink-0">
                      {formatRs(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase">
                  {getPaymentIcon(selectedOrder.paymentMethod)}
                  <span>{selectedOrder.paymentMethod}</span>
                  <span>·</span>
                  <span>{selectedOrder.platform}</span>
                </div>
                <div className="font-num text-2xl font-extrabold text-emerald-700">
                  {formatRs(selectedOrder.total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
