import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, CaretRight, Truck } from '@phosphor-icons/react';
import { Shipment } from '../../types';
import { StatusPill } from '../shared/StatusPill';

interface ShipmentTableProps {
  shipments: Shipment[];
}

type SortField = 'id' | 'product_name' | 'risk_score' | 'latest_temperature' | 'status';

export const ShipmentTable: React.FC<ShipmentTableProps> = ({ shipments }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('risk_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedShipments = [...shipments].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'latest_temperature') {
      aVal = a.latest_temperature ?? a.setpoint_temp;
      bVal = b.latest_temperature ?? b.setpoint_temp;
    }

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const getRiskBarColor = (score: number) => {
    if (score >= 70) return 'bg-gradient-to-r from-red-500 to-red-400';
    if (score >= 31) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 cursor-pointer hover:text-gray-700 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field && (
          <span className="text-[#1D6FA4]">
            {sortDir === 'asc' ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
            <Truck size={16} weight="fill" className="text-[#1D6FA4]" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Monitored Cold-Chain Shipments</h2>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          Total: {shipments.length} Active Profiles
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-gray-400 font-semibold uppercase tracking-wider text-[10px] border-b border-gray-100">
            <tr>
              <SortHeader field="id" label="Shipment ID" />
              <SortHeader field="product_name" label="Product" />
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Setpoint / Safe Range</th>
              <SortHeader field="latest_temperature" label="Current Temp" />
              <SortHeader field="risk_score" label="Risk Score" />
              <SortHeader field="status" label="Status" />
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-sans">
            {sortedShipments.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate(`/shipments/${s.id}`)}
                className="table-row-hover cursor-pointer group"
              >
                <td className="px-4 py-3.5 font-mono font-bold text-[#1D6FA4]">{s.id}</td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-gray-900">{s.product_name}</div>
                  <div className="text-[10px] text-gray-400 capitalize mt-0.5">{s.product_type}</div>
                </td>
                <td className="px-4 py-3.5 text-gray-600 font-medium">
                  {s.origin} → {s.destination}
                </td>
                <td className="px-4 py-3.5 font-mono text-gray-500">
                  {s.setpoint_temp}°C ({s.min_temp}°C to {s.max_temp}°C)
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-gray-900">
                  {s.latest_temperature ?? s.setpoint_temp}°C
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full risk-bar-animated ${getRiskBarColor(s.risk_score)}`}
                        style={{ width: `${s.risk_score}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold text-[11px] ${
                      s.risk_score >= 70 ? 'text-red-600' : s.risk_score >= 31 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {s.risk_score}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button className="p-1.5 text-gray-300 group-hover:text-[#1D6FA4] transition-colors rounded-md group-hover:bg-[#1D6FA4]/5">
                    <CaretRight size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
