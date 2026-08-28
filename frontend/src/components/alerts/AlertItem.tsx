import React, { useState } from 'react';
import { Warning, CheckCircle } from '@phosphor-icons/react';
import { Alert } from '../../types';
import { formatRelativeTime } from '../../utils/formatting';
import { useStore } from '../../store/useStore';
import axios from 'axios';

interface AlertItemProps {
  alert: Alert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const acknowledgeAlertInStore = useStore((state) => state.acknowledgeAlert);
  const [loading, setLoading] = useState(false);

  const severityConfig: Record<string, { strip: string; badge: string; badgeText: string }> = {
    critical: { strip: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200/60', badgeText: 'CRITICAL' },
    high: { strip: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200/60', badgeText: 'HIGH' },
    medium: { strip: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200/60', badgeText: 'MEDIUM' },
    low: { strip: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200/60', badgeText: 'LOW' }
  };

  const config = severityConfig[alert.severity] || severityConfig.low;

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/alerts/${alert.id}/acknowledge`,
        { acknowledged_by: 'Duty Operator (Demo)' }
      );
      acknowledgeAlertInStore(alert.id, 'Duty Operator (Demo)');
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border rounded-lg overflow-hidden relative p-3 transition-all duration-150 flex justify-between items-start space-x-3 ${
      alert.acknowledged === 1 ? 'border-gray-100 opacity-60' : 'border-gray-200/60 hover:border-gray-300'
    }`}>
      {/* Left edge severity color strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-[3px] ${config.strip}`} />

      <div className="pl-2.5 flex-1 space-y-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-mono font-bold text-xs text-[#1D6FA4] flex-shrink-0">{alert.shipment_id}</span>
            {alert.product_name && (
              <span className="text-xs text-gray-500 font-medium truncate">
                {alert.product_name}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
            {formatRelativeTime(alert.created_at)}
          </span>
        </div>

        <p className="text-[11px] text-gray-600 font-sans leading-snug">{alert.message}</p>

        {alert.acknowledged === 1 && (
          <div className="text-[10px] text-emerald-600 flex items-center space-x-1 font-mono pt-0.5">
            <CheckCircle size={12} weight="fill" />
            <span>Acknowledged by {alert.acknowledged_by || 'Operator'}</span>
          </div>
        )}
      </div>

      {alert.acknowledged === 0 && (
        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-all duration-150 disabled:opacity-50 whitespace-nowrap self-center flex-shrink-0 active:scale-95"
        >
          {loading ? 'Acking...' : 'Acknowledge'}
        </button>
      )}
    </div>
  );
};
