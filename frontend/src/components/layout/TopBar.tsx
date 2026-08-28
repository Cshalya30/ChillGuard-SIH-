import React from 'react';
import { Pulse, ShieldCheck } from '@phosphor-icons/react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-gray-900 font-sans tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Live Streaming Status */}
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200/60 text-[11px] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono font-semibold tracking-wide">STREAMING LIVE</span>
        </div>

        {/* GDP Validated Badge */}
        <div className="flex items-center space-x-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/60 text-[11px] font-mono font-medium">
          <ShieldCheck size={14} weight="fill" className="text-[#1D6FA4]" />
          <span>GDP VALIDATED</span>
        </div>
      </div>
    </header>
  );
};
