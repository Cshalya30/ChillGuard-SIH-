import React from 'react';
import { Timer, Thermometer, Drop, Brain } from '@phosphor-icons/react';
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
  const getRiskConfig = (score: number) => {
    if (score >= 70) return { 
      text: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200/60',
      badge: 'bg-red-600',
      ring: 'ring-red-500',
      label: 'CRITICAL',
      gradient: 'from-red-500 to-red-400'
    };
    if (score >= 31) return { 
      text: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200/60',
      badge: 'bg-amber-600',
      ring: 'ring-amber-500',
      label: 'ELEVATED',
      gradient: 'from-amber-500 to-amber-400'
    };
    return { 
      text: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200/60',
      badge: 'bg-emerald-600',
      ring: 'ring-emerald-500',
      label: 'NOMINAL',
      gradient: 'from-emerald-500 to-emerald-400'
    };
  };

  const riskConfig = getRiskConfig(riskScore);

  // SVG semi-circular gauge
  const radius = 60;
  const circumference = Math.PI * radius;
  const fillPercentage = riskScore / 100;
  const strokeDashoffset = circumference * (1 - fillPercentage);

  return (
    <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
            <Brain size={16} weight="fill" className="text-[#1D6FA4]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Risk Intelligence Engine</h3>
        </div>
        <span className={`text-[10px] font-mono font-bold text-white px-2.5 py-1 rounded-md ${riskConfig.badge}`}>
          ML MODEL ACTIVE
        </span>
      </div>

      {/* Semi-circular Gauge */}
      <div className="flex flex-col items-center pt-2">
        <svg width="160" height="90" viewBox="0 0 160 90" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 10 80 A 60 60 0 0 1 150 80"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 10 80 A 60 60 0 0 1 150 80"
            fill="none"
            stroke={riskScore >= 70 ? '#EF4444' : riskScore >= 31 ? '#F59E0B' : '#22C55E'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Center text */}
          <text x="80" y="72" textAnchor="middle" className="font-mono font-bold" fontSize="32" fill={riskScore >= 70 ? '#DC2626' : riskScore >= 31 ? '#D97706' : '#16A34A'}>
            {riskScore}
          </text>
          <text x="80" y="88" textAnchor="middle" className="font-mono" fontSize="11" fill="#94A3B8">
            / 100
          </text>
        </svg>
        <span className={`text-[10px] font-mono font-bold tracking-wider mt-1 px-3 py-0.5 rounded-md ${riskConfig.bg} ${riskConfig.text} border ${riskConfig.border}`}>
          {riskConfig.label} RISK
        </span>
      </div>

      {/* Time to Breach */}
      {timeToBreachMinutes !== null && timeToBreachMinutes !== undefined && (
        <div className="bg-red-50 border border-red-200/60 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer size={16} weight="fill" className="text-red-500 animate-pulse" />
            <span className="text-[11px] text-red-700 font-semibold uppercase tracking-wide">Time to Breach</span>
          </div>
          <span className="text-xl font-bold font-mono text-red-600">
            {timeToBreachMinutes} <span className="text-xs font-medium text-red-400">MIN</span>
          </span>
        </div>
      )}

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-lg">
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            <Thermometer size={12} className="text-[#1D6FA4]" />
            <span>Current Temp</span>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 mt-1.5">{currentTemp}°C</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Setpoint: {setpointTemp}°C</p>
        </div>

        <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-lg">
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            <Drop size={12} className="text-blue-500" />
            <span>Humidity</span>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 mt-1.5">{humidity}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Relative Enclosure</p>
        </div>
      </div>

      {/* MKT & Timestamp */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div>
          <span>MKT (Arrhenius): </span>
          <span className="font-bold text-gray-800">{mktValue !== undefined && mktValue !== null ? `${mktValue}°C` : 'Calculating...'}</span>
        </div>
        <div>
          <span>Updated: </span>
          <span className="text-gray-600">{formatRelativeTime(lastReadingTime || '')}</span>
        </div>
      </div>
    </div>
  );
};
