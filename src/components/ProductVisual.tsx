import React, { useState } from 'react';
import { ProductVisualKey } from '../types';

interface ProductVisualProps {
  visualKey: ProductVisualKey;
  imageUrl?: string;
  alt?: string;
  className?: string;
}

const KEY_BG: Record<ProductVisualKey, string> = {
  atta: 'bg-amber-50 text-amber-800',
  rice: 'bg-yellow-50 text-yellow-800',
  daal: 'bg-orange-50 text-orange-800',
  oil: 'bg-lime-50 text-lime-800',
  sugar: 'bg-cyan-50 text-cyan-800',
  tea: 'bg-emerald-50 text-emerald-800',
  salt: 'bg-slate-100 text-slate-700',
  milk: 'bg-sky-50 text-sky-800',
  eggs: 'bg-amber-50 text-amber-700',
  butter: 'bg-yellow-50 text-yellow-700',
  biscuits: 'bg-rose-50 text-rose-800',
  soda: 'bg-red-50 text-red-700',
  chips: 'bg-orange-50 text-orange-700',
  detergent: 'bg-violet-50 text-violet-800',
  soap: 'bg-indigo-50 text-indigo-800',
  spices: 'bg-red-50 text-red-800',
};

function renderVectorArt(key: ProductVisualKey) {
  switch (key) {
    case 'atta':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <path d="M18 18 C18 12, 46 12, 46 18 L50 50 C50 54, 44 56, 32 56 C20 56, 14 54, 14 50 Z" fill="#D97706" opacity="0.2" />
          <path d="M19 20 L45 20 L48 50 C48 53, 41 55, 32 55 C23 55, 16 53, 16 50 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
          <path d="M23 14 L41 14 L39 20 L25 20 Z" fill="#B45309" />
          <circle cx="32" cy="36" r="8" fill="#FEF3C7" />
          <path d="M32 30 L32 42 M28 34 Q32 30 36 34 M28 38 Q32 34 36 38" stroke="#92400E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'rice':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <path d="M14 34 C14 48, 22 54, 32 54 C42 54, 50 48, 50 34 Z" fill="#CA8A04" stroke="#713F12" strokeWidth="2" />
          <path d="M16 34 C20 22, 44 22, 48 34 Z" fill="#FEF9C3" stroke="#A16207" strokeWidth="1.5" />
          <ellipse cx="26" cy="30" rx="3" ry="1.3" transform="rotate(-20 26 30)" fill="#FFFBEB" stroke="#A16207" strokeWidth="1" />
          <ellipse cx="33" cy="28" rx="3" ry="1.3" transform="rotate(15 33 28)" fill="#FFFBEB" stroke="#A16207" strokeWidth="1" />
          <ellipse cx="38" cy="31" rx="3" ry="1.3" transform="rotate(-10 38 31)" fill="#FFFBEB" stroke="#A16207" strokeWidth="1" />
        </svg>
      );
    case 'daal':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <path d="M16 20 L48 20 L44 52 C44 54, 20 54, 20 52 Z" fill="#FB923C" stroke="#9A3412" strokeWidth="2" />
          <rect x="22" y="28" width="20" height="16" rx="4" fill="#FFF7ED" />
          <circle cx="28" cy="34" r="2.2" fill="#EA580C" />
          <circle cx="36" cy="34" r="2.2" fill="#DC2626" />
          <circle cx="32" cy="39" r="2.2" fill="#CA8A04" />
          <circle cx="27" cy="40" r="1.8" fill="#EA580C" />
          <circle cx="37" cy="40" r="1.8" fill="#CA8A04" />
        </svg>
      );
    case 'oil':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="27" y="9" width="10" height="6" rx="2" fill="#059669" />
          <path d="M27 15 L37 15 L44 26 L44 52 C44 54, 42 55, 32 55 C22 55, 20 54, 20 52 L20 26 Z" fill="#FACC15" stroke="#854D0E" strokeWidth="2" />
          <rect x="24" y="31" width="16" height="14" rx="2" fill="#FEFCE8" />
          <path d="M32 34 C35 38, 35 42, 32 42 C29 42, 29 38, 32 34 Z" fill="#EAB308" />
        </svg>
      );
    case 'sugar':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="16" y="16" width="32" height="38" rx="6" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2" />
          <rect x="22" y="25" width="20" height="18" rx="3" fill="#FFFFFF" />
          <rect x="26" y="29" width="5" height="5" rx="1" fill="#38BDF8" />
          <rect x="33" y="29" width="5" height="5" rx="1" fill="#7DD3FC" />
          <rect x="29" y="35" width="5" height="5" rx="1" fill="#0284C7" />
        </svg>
      );
    case 'tea':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="16" y="16" width="32" height="38" rx="5" fill="#059669" stroke="#064E3B" strokeWidth="2" />
          <rect x="21" y="24" width="22" height="20" rx="3" fill="#ECFDF5" />
          <path d="M27 36 Q32 28 37 36 Q32 40 27 36 Z" fill="#10B981" stroke="#065F46" strokeWidth="1.5" />
          <path d="M32 28 L32 38" stroke="#065F46" strokeWidth="1.4" />
        </svg>
      );
    case 'salt':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="20" y="18" width="24" height="36" rx="5" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
          <rect x="23" y="12" width="18" height="6" rx="2" fill="#0284C7" />
          <rect x="20" y="30" width="24" height="14" fill="#E2E8F0" />
          <circle cx="28" cy="37" r="1.5" fill="#334155" />
          <circle cx="32" cy="37" r="1.5" fill="#334155" />
          <circle cx="36" cy="37" r="1.5" fill="#334155" />
        </svg>
      );
    case 'milk':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <path d="M22 14 L42 14 L46 24 L46 54 L18 54 L18 24 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
          <path d="M22 14 L42 14 L39 9 L25 9 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="18" y="30" width="28" height="16" fill="#0EA5E9" opacity="0.2" />
          <path d="M32 33 C36 38, 36 43, 32 43 C28 43, 28 38, 32 33 Z" fill="#0284C7" />
        </svg>
      );
    case 'eggs':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="12" y="36" width="40" height="14" rx="4" fill="#D97706" opacity="0.25" stroke="#92400E" strokeWidth="2" />
          <ellipse cx="22" cy="32" rx="7" ry="10" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="32" cy="30" rx="7" ry="10" fill="#FDE68A" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="42" cy="32" rx="7" ry="10" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
        </svg>
      );
    case 'butter':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="12" y="38" width="40" height="10" rx="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
          <path d="M18 24 L44 24 L48 38 L16 38 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          <path d="M18 24 L26 20 L48 20 L44 24 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
        </svg>
      );
    case 'biscuits':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="14" y="18" width="36" height="28" rx="6" fill="#E11D48" stroke="#881337" strokeWidth="2" />
          <circle cx="28" cy="32" r="8" fill="#FDE68A" stroke="#92400E" strokeWidth="1.5" />
          <circle cx="38" cy="34" r="7" fill="#FCD34D" stroke="#92400E" strokeWidth="1.5" />
          <circle cx="26" cy="30" r="1" fill="#92400E" />
          <circle cx="30" cy="34" r="1" fill="#92400E" />
        </svg>
      );
    case 'soda':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="28" y="8" width="8" height="5" rx="1.5" fill="#DC2626" />
          <path d="M27 13 L37 13 L41 25 L41 53 C41 55, 23 55, 23 53 L23 25 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
          <rect x="23" y="29" width="18" height="12" fill="#FFFFFF" />
          <path d="M26 35 Q32 31 38 35" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'chips':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <path d="M18 14 L46 14 L44 52 L20 52 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
          <circle cx="32" cy="33" r="9" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
          <path d="M26 33 Q32 28 38 33" stroke="#CA8A04" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'detergent':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="15" y="16" width="34" height="38" rx="6" fill="#7C3AED" stroke="#4C1D95" strokeWidth="2" />
          <circle cx="32" cy="35" r="10" fill="#EDE9FE" />
          <circle cx="28" cy="32" r="2.5" fill="#A78BFA" />
          <circle cx="35" cy="33" r="3" fill="#8B5CF6" />
          <circle cx="32" cy="39" r="2.2" fill="#C4B5FD" />
        </svg>
      );
    case 'soap':
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="14" y="22" width="36" height="22" rx="10" fill="#818CF8" stroke="#312E81" strokeWidth="2" />
          <rect x="20" y="27" width="24" height="12" rx="6" fill="#E0E7FF" />
          <circle cx="46" cy="18" r="3" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1.2" />
          <circle cx="51" cy="24" r="2" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1.2" />
        </svg>
      );
    case 'spices':
    default:
      return (
        <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
          <rect x="16" y="16" width="32" height="38" rx="5" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
          <rect x="21" y="24" width="22" height="20" rx="3" fill="#FEF2F2" />
          <circle cx="32" cy="34" r="6" fill="#EF4444" />
          <path d="M32 28 L32 40 M26 34 L38 34" stroke="#FEF2F2" strokeWidth="1.8" />
        </svg>
      );
  }
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  visualKey,
  imageUrl,
  alt = 'Product',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imageUrl && !imgFailed) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}
      >
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${KEY_BG[visualKey] || 'bg-slate-100'} ${className}`}
    >
      {renderVectorArt(visualKey)}
    </div>
  );
};
