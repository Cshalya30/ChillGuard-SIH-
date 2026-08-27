import React from 'react';
import { Pulse, ShieldCheck } from '@phosphor-icons/react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-gray-900 font-sans tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 font-normal">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* System Status Indicator */}
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-[4px] border border-emerald-200 text-xs font-medium">
          <Pulse size={14} className="animate-spin text-emerald-600" />
          <span className="font-mono">STREAMING LIVE</span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-[4px] text-xs font-mono">
          <ShieldCheck size={14} className="text-[#1D6FA4]" />
          <span>GDP VALIDATED</span>
        </div>
      </div>
    </header>
  );
};
