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
    <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
            <ShieldCheck size={16} weight="fill" className="text-[#1D6FA4]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Audit Trail & Chain of Custody</h3>
        </div>
        <span className="text-[11px] font-mono text-gray-400">{entries.length} Audit Records</span>
      </div>

      <div className="space-y-2.5 font-sans">
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
              <div key={idx} className="flex items-start space-x-3 text-xs p-3 rounded-lg bg-slate-50/80 border border-slate-200/60 transition-colors hover:bg-slate-100/60">
                <div className={`p-2 rounded-md ${iconColor} flex-shrink-0`}>
                  <Icon size={16} weight="fill" />
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 capitalize">
                      {entry.entry_type === 'custody' ? entry.action : (entry.message || 'Telemetry Event')}
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  {entry.operator_name && (
                    <p className="text-gray-600 font-medium text-[11px]">
                      Operator: {entry.operator_name} (Handoff Temp: {entry.temperature_at_handoff}°C)
                    </p>
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
