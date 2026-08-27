import React from 'react';
import { BellRinging, CheckCircle } from '@phosphor-icons/react';
import { Alert } from '../../types';
import { AlertItem } from './AlertItem';

interface AlertPanelProps {
  alerts: Alert[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  // Sort severity priority order: critical > high > medium > low
  const severityOrder: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    // Unacknowledged first
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged - b.acknowledged;
    }
    // Then severity
    const sevDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;
    // Then timestamp
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden shadow-card flex flex-col h-[480px]">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-2">
          <BellRinging size={18} className="text-[#1D6FA4]" />
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Active Excursion Alerts</h2>
        </div>
        <span className="text-xs font-mono font-bold bg-[#1D6FA4] text-white px-2 py-0.5 rounded-[4px]">
          {alerts.filter((a) => a.acknowledged === 0).length} UNACKNOWLEDGED
        </span>
      </div>

      {/* Internal Scrollable Content (Max height 480px) */}
      <div className="p-3 space-y-2.5 overflow-y-auto flex-1 bg-slate-50/50">
        {sortedAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
            <CheckCircle size={32} className="text-emerald-500" />
            <p className="text-sm font-medium text-gray-600">All shipments in safe thermal range</p>
            <p className="text-xs">No active excursion alerts requiring acknowledgment.</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
};
