import React from 'react';
import { ShieldCheck, Pulse } from '@phosphor-icons/react';

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
    <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck size={20} className="text-[#1D6FA4]" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Mean Kinetic Temperature (MKT) Audit</h3>
        </div>
        <span className="text-xs font-mono font-bold bg-[#1D6FA4] text-white px-2 py-0.5 rounded-[4px]">
          GDP STANDARD
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MKT Main Value Display */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px]">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Calculated MKT Value</p>
          <p className="text-4xl font-bold font-mono text-gray-900 mt-1">
            {mktValue !== null ? `${mktValue}°C` : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono">Specified Range: {minTemp}°C – {maxTemp}°C</p>
        </div>

        {/* Status Compliance Pill */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] flex flex-col justify-between">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compliance Status</p>
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-[4px] text-sm font-mono font-bold border ${
                isWithinRange
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-red-50 text-red-700 border-red-300'
              }`}
            >
              {isWithinRange ? 'WITHIN RANGE (PASS)' : 'EXCURSION NON-COMPLIANT'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-sans">FDA 21 CFR Part 211 / GDP Guidelines</p>
        </div>

        {/* Method & Readings Count */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Calculation Audit</p>
          <p className="text-xs font-mono text-gray-700 pt-1">
            <span className="text-gray-500">Method:</span> {calculationMethod}
          </p>
          <p className="text-xs font-mono text-gray-700">
            <span className="text-gray-500">Readings Analyzed:</span> {readingsCount}
          </p>
        </div>
      </div>
    </div>
  );
};
