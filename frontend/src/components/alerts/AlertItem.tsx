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

  const severityStrips = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500'
  };

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
    <div className="bg-white border border-gray-200 rounded-[6px] overflow-hidden relative p-3 transition-all flex justify-between items-start space-x-3">
      {/* Left edge severity color strip per PRD specification */}
      <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${severityStrips[alert.severity] || 'bg-slate-400'}`} />

      <div className="pl-2 flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs text-[#1D6FA4]">{alert.shipment_id}</span>
            {alert.product_name && (
              <span className="text-xs text-gray-600 font-medium font-sans">
                {alert.product_name}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-sans">
            {formatRelativeTime(alert.created_at)}
          </span>
        </div>

        <p className="text-xs text-gray-800 font-sans leading-tight">{alert.message}</p>

        {alert.acknowledged === 1 && (
          <div className="text-[11px] text-emerald-600 flex items-center space-x-1 font-mono pt-1">
            <CheckCircle size={12} weight="bold" />
            <span>Acknowledged by {alert.acknowledged_by || 'Operator'}</span>
          </div>
        )}
      </div>

      {alert.acknowledged === 0 && (
        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className="px-2.5 py-1 text-xs font-medium rounded-[4px] bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap self-center"
        >
          {loading ? 'Acking...' : 'Acknowledge'}
        </button>
      )}
    </div>
  );
};
