import React from 'react';
import { ShieldCheck, Warning, Thermometer, UserCheck } from '@phosphor-icons/react';
import { formatRelativeTime } from '../../utils/formatting';

interface AuditLogEntry {
  id: number;
  timestamp: string;
  entry_type: 'alert' | 'custody' | 'reading_anomaly';
  alert_type?: string;
  severity?: string;
  message?: string;
  operator_name?: string;
  action?: string;
  temperature_at_handoff?: number;
  temperature?: number;
  door_open?: number;
}

interface AuditLogProps {
  entries: AuditLogEntry[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ entries }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-[8px] p-4 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Audit Trail & Chain of Custody</h3>
        <span className="text-xs font-mono text-gray-500">{entries.length} Audit Records</span>
      </div>

      <div className="space-y-3 font-sans">
        {entries.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">No audit trail entries recorded yet.</p>
        ) : (
          entries.map((entry, idx) => {
            let Icon = ShieldCheck;
            let iconColor = 'text-blue-600 bg-blue-50';

            if (entry.entry_type === 'alert') {
              Icon = Warning;
              iconColor = entry.severity === 'critical' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';
            } else if (entry.entry_type === 'custody') {
              Icon = UserCheck;
              iconColor = 'text-emerald-600 bg-emerald-50';
            } else if (entry.entry_type === 'reading_anomaly') {
              Icon = Thermometer;
              iconColor = 'text-purple-600 bg-purple-50';
            }

            return (
              <div key={idx} className="flex items-start space-x-3 text-xs p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
                <div className={`p-1.5 rounded-[4px] ${iconColor}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 capitalize">
                      {entry.entry_type === 'custody' ? entry.action : (entry.message || 'Telemetry Event')}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  {entry.operator_name && (
                    <p className="text-gray-600 font-medium">Operator: {entry.operator_name} (Handoff Temp: {entry.temperature_at_handoff}°C)</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
