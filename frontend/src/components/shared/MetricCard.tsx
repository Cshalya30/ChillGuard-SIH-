import React from 'react';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  topStripColor?: 'blue' | 'amber' | 'red' | 'slate' | 'green';
  trend?: 'up' | 'down' | 'flat';
  animationDelay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  topStripColor = 'blue',
  trend,
  animationDelay = 0
}) => {
  const stripColors = {
    blue: 'bg-gradient-to-r from-[#1D6FA4] to-[#2E8BC0]',
    amber: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]',
    red: 'bg-gradient-to-r from-[#DC2626] to-[#EF4444]',
    green: 'bg-gradient-to-r from-[#16A34A] to-[#22C55E]',
    slate: 'bg-gradient-to-r from-[#6B7280] to-[#9CA3AF]'
  };

  const stripGlowColors = {
    blue: 'shadow-[0_1px_8px_rgba(29,111,164,0.15)]',
    amber: 'shadow-[0_1px_8px_rgba(217,119,6,0.15)]',
    red: 'shadow-[0_1px_8px_rgba(220,38,38,0.15)]',
    green: 'shadow-[0_1px_8px_rgba(22,163,74,0.15)]',
    slate: ''
  };

  return (
    <div 
      className={`bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-card card-interactive p-5 relative flex flex-col justify-between animate-slide-up ${stripGlowColors[topStripColor]}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Top 3px gradient status strip */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${stripColors[topStripColor]}`} />

      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-2">
          {label}
        </p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-gray-900 font-mono tracking-tight leading-none">
            {value}
          </p>
          {trend && (
            <span className={`flex items-center ${
              trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-400'
            }`}>
              {trend === 'up' ? <TrendUp size={16} weight="bold" /> : 
               trend === 'down' ? <TrendDown size={16} weight="bold" /> : 
               <Minus size={16} weight="bold" />}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-[11px] text-gray-400 mt-3 font-sans leading-tight">{subtitle}</p>
      )}
    </div>
  );
};
