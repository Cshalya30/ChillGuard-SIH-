import React from 'react';
import { ShieldCheck } from '@phosphor-icons/react';

interface MKTDisplayProps {
  mktValue: number | null;
  minTemp: number;
  maxTemp: number;
  readingsCount: number;
  calculationMethod?: string;
}

export const MKTDisplay: React.FC<MKTDisplayProps> = ({
  mktValue,
  minTemp,
  maxTemp,
  readingsCount,
  calculationMethod = 'Arrhenius kinetics, Ea = 83,144 J/mol'
}) => {
  const isWithinRange = mktValue !== null && mktValue >= minTemp && mktValue <= maxTemp;

  return (
    <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
            <ShieldCheck size={16} weight="fill" className="text-[#1D6FA4]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Mean Kinetic Temperature (MKT) Audit</h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#1D6FA4] text-white px-2.5 py-1 rounded-md">
          GDP STANDARD
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MKT Main Value Display */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-lg">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Calculated MKT Value</p>
          <p className="text-3xl font-bold font-mono text-gray-900 mt-1">
            {mktValue !== null ? `${mktValue}°C` : 'N/A'}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">Specified Range: {minTemp}°C – {maxTemp}°C</p>
        </div>

        {/* Status Compliance Pill */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-lg flex flex-col justify-between">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Compliance Status</p>
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-md text-xs font-mono font-bold border ${
                isWithinRange
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300/60'
                  : 'bg-red-50 text-red-700 border-red-300/60'
              }`}
            >
              {isWithinRange ? 'WITHIN RANGE (PASS)' : 'EXCURSION NON-COMPLIANT'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-sans">FDA 21 CFR Part 211 / GDP Guidelines</p>
        </div>

        {/* Method & Readings Count */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-lg space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Calculation Audit</p>
          <p className="text-xs font-mono text-gray-700 pt-1">
            <span className="text-gray-400">Method:</span> {calculationMethod}
          </p>
          <p className="text-xs font-mono text-gray-700">
            <span className="text-gray-400">Readings Analyzed:</span> {readingsCount}
          </p>
        </div>
      </div>
    </div>
  );
};
