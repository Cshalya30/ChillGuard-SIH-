import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layout, Truck, ChartLineUp, ShieldCheck, BellRinging, Snowflake } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';

export const Sidebar: React.FC = () => {
  const alerts = useStore((state) => state.alerts);
  const unacknowledgedCount = alerts.filter((a) => a.acknowledged === 0).length;
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Layout },
    { label: 'Shipments', path: '/shipments', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: ChartLineUp },
    { label: 'Compliance', path: '/compliance', icon: ShieldCheck }
  ];

  return (
    <aside className="w-[240px] fixed top-0 left-0 bottom-0 bg-[#0D1B2A] text-[#94A3B8] flex flex-col justify-between z-30 shadow-[2px_0_8px_rgba(0,0,0,0.15)]">
      <div>
        {/* Logo Section */}
        <div className="h-16 px-5 flex items-center border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1D6FA4] rounded-lg flex items-center justify-center">
              <Snowflake size={18} weight="bold" className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white font-mono leading-none block">
                CHILLGUARD
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-[0.2em] text-[#1D6FA4] leading-none">
                OPS PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Navigation</p>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#1D6FA4]/15 text-white nav-item-active'
                    : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <Icon 
                  size={20} 
                  weight={isActive ? 'fill' : 'regular'}
                  className={`transition-colors ${isActive ? 'text-[#1D6FA4]' : 'text-slate-500 group-hover:text-slate-400'}`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1D6FA4]" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-2">
        {/* System Status */}
        <div className="px-3 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.04]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 live-dot" />
            <span className="text-[11px] text-slate-400 font-medium">System Online</span>
          </div>
        </div>

        {/* Alert Summary Badge */}
        <div className="px-3 py-3 bg-white/[0.03] rounded-lg border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRinging 
                size={16} 
                weight="fill"
                className={unacknowledgedCount > 0 ? 'text-red-400' : 'text-slate-500'} 
              />
              <span className="text-[11px] text-slate-400 font-medium">Active Alerts</span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                unacknowledgedCount > 0
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {unacknowledgedCount}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
