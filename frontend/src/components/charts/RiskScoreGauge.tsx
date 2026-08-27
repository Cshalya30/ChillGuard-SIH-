import React from 'react';
import { Warning, Timer, Thermometer, Drop, ShieldAlert } from '@phosphor-icons/react';
import { formatRelativeTime } from '../../utils/formatting';

interface RiskScoreGaugeProps {
  riskScore: number;
  timeToBreachMinutes: number | null;
  currentTemp: number;
  humidity?: number;
  mktValue?: number | null;
  lastReadingTime?: string;
  setpointTemp: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  riskScore,
  timeToBreachMinutes,
  currentTemp,
  humidity = 55,
  mktValue,
  lastReadingTime,
  setpointTemp
}) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600' };
    if (score >= 31) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600' };
  };

  const riskStyle = getRiskColor(riskScore);

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-card space-y-5">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Risk Intelligence Engine</h3>
        <span className={`text-xs font-mono font-bold text-white px-2 py-0.5 rounded-[4px] ${riskStyle.badge}`}>
          ML MODEL ACTIVE
        </span>
      </div>

      {/* Main Risk Score Meter */}
      <div className={`p-4 rounded-[8px] border ${riskStyle.bg} ${riskStyle.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Breach Excursion Risk</p>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className={`text-4xl font-bold font-mono ${riskStyle.text}`}>{riskScore}</span>
            <span className="text-sm text-gray-500 font-mono">/ 100</span>
          </div>
        </div>

        {timeToBreachMinutes !== null && timeToBreachMinutes !== undefined && (
          <div className="text-right bg-white p-2.5 rounded-[6px] border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-1 text-xs text-red-600 font-medium">
              <Timer size={14} className="animate-pulse" />
              <span>TIME TO BREACH</span>
            </div>
            <p className="text-lg font-bold font-mono text-red-700 mt-0.5">
              {timeToBreachMinutes} <span className="text-xs font-normal">MIN</span>
            </p>
          </div>
        )}
      </div>

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Thermometer size={14} className="text-[#1D6FA4]" />
            <span>Current Temp</span>
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{currentTemp}°C</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Setpoint: {setpointTemp}°C</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Drop size={14} className="text-blue-500" />
            <span>Humidity</span>
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{humidity}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Relative Enclosure</p>
        </div>
      </div>

      {/* MKT & Timestamp */}
      <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>
          <span>MKT (Arrhenius): </span>
          <span className="font-bold text-gray-900">{mktValue !== undefined && mktValue !== null ? `${mktValue}°C` : 'Calculating...'}</span>
        </div>
        <div>
          <span>Updated: </span>
          <span className="text-gray-700">{formatRelativeTime(lastReadingTime || '')}</span>
        </div>
      </div>
    </div>
  );
};
