import React from 'react';
import { Lock, Crown } from 'lucide-react';

const ProBadge = ({ locked = true, size = 'sm', className = '' }) => {
  if (!locked) return null;

  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[9px] gap-0.5'
      : 'px-2 py-0.5 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0 ${sizeClasses} ${className}`}
    >
      <Lock size={size === 'xs' ? 9 : 10} className="shrink-0" />
      <span>PRO</span>
    </span>
  );
};

export const ProActiveTag = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-400/20 text-amber-200 border border-amber-300/30 whitespace-nowrap shrink-0 ${className}`}
  >
    <Crown size={11} className="shrink-0" />
    <span>Pro</span>
  </span>
);

export default ProBadge;
