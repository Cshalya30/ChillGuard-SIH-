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

  const unackCount = alerts.filter((a) => a.acknowledged === 0).length;

  return (
    <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-card flex flex-col h-[480px]">
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
            <BellRinging size={16} weight="fill" className="text-[#1D6FA4]" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Active Excursion Alerts</h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md ${
          unackCount > 0
            ? 'bg-red-50 text-red-600 border border-red-200/60'
            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
        }`}>
          {unackCount} UNACKNOWLEDGED
        </span>
      </div>

      {/* Internal Scrollable Content */}
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {sortedAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={28} weight="fill" className="text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-gray-600">All shipments in safe thermal range</p>
            <p className="text-xs text-gray-400">No active excursion alerts requiring acknowledgment.</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
};
