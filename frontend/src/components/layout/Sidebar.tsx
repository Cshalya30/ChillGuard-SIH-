import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Truck, ChartLineUp, ShieldCheck, BellRinging } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';

export const Sidebar: React.FC = () => {
  const alerts = useStore((state) => state.alerts);
  const unacknowledgedCount = alerts.filter((a) => a.acknowledged === 0).length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Layout },
    { label: 'Shipments', path: '/shipments', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: ChartLineUp },
    { label: 'Compliance', path: '/compliance', icon: ShieldCheck }
  ];

  return (
    <aside className="w-[240px] fixed top-0 left-0 bottom-0 bg-[#0D1B2A] text-[#94A3B8] flex flex-col justify-between z-30 shadow-[2px_0_8px_rgba(0,0,0,0.12)]">
      <div>
        {/* Logo Section - Text-based per PRD */}
        <div className="h-16 px-6 flex items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white font-mono">CHILLGUARD</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-[#1D6FA4] text-white rounded-[4px]">
              OPS
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#1D6FA4] text-white'
                      : 'text-[#94A3B8] hover:bg-[#14253B] hover:text-white'
                  }`
                }
              >
                <Icon size={20} weight="regular" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Alert Summary Badge */}
      <div className="p-4 border-t border-slate-800 bg-[#0A1521]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellRinging size={18} className={unacknowledgedCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'} />
            <span className="text-xs text-slate-300 font-medium">Active Alerts</span>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-[4px] ${
              unacknowledgedCount > 0
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {unacknowledgedCount}
          </span>
        </div>
      </div>
    </aside>
  );
};
