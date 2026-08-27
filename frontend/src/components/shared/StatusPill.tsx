import React from 'react';
import { getStatusColor } from '../../utils/formatting';

interface StatusPillProps {
  status: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const colors = getStatusColor(status);
  const formatted = status.toUpperCase().replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-mono font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatted}
    </span>
  );
};
