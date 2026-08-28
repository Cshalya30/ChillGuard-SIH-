import React from 'react';
import { getStatusColor } from '../../utils/formatting';

interface StatusPillProps {
  status: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const colors = getStatusColor(status);
  const formatted = status.toUpperCase().replace('_', ' ');
  const isBreach = status === 'breach';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current mr-1.5 ${isBreach ? 'animate-pulse' : 'opacity-70'}`} />
      {formatted}
    </span>
  );
};
