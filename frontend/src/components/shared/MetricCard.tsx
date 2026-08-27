import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  topStripColor?: 'blue' | 'amber' | 'red' | 'slate' | 'green';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  topStripColor = 'blue'
}) => {
  const stripColors = {
    blue: 'bg-[#1D6FA4]',
    amber: 'bg-[#D97706]',
    red: 'bg-[#DC2626]',
    green: 'bg-[#16A34A]',
    slate: 'bg-[#6B7280]'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden shadow-card p-4 relative flex flex-col justify-between">
      {/* Top 3px status color strip per PRD specification */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${stripColors[topStripColor]}`} />

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-1 font-mono tracking-tight">
          {value}
        </p>
      </div>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-2 font-sans">{subtitle}</p>
      )}
    </div>
  );
};
