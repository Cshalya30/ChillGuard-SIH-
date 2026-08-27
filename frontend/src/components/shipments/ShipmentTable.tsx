import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, CaretRight } from '@phosphor-icons/react';
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

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden shadow-card">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">Monitored Cold-Chain Shipments</h2>
        <span className="text-xs text-gray-500 font-mono">Total: {shipments.length} Active Profiles</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-gray-500 font-medium uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('id')}>
                <div className="flex items-center space-x-1">
                  <span>Shipment ID</span>
                  {sortField === 'id' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('product_name')}>
                <div className="flex items-center space-x-1">
                  <span>Product</span>
                  {sortField === 'product_name' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Setpoint / Safe Range</th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('latest_temperature')}>
                <div className="flex items-center space-x-1">
                  <span>Current Temp</span>
                  {sortField === 'latest_temperature' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('risk_score')}>
                <div className="flex items-center space-x-1">
                  <span>Risk Score</span>
                  {sortField === 'risk_score' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === 'status' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-sans">
            {sortedShipments.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate(`/shipments/${s.id}`)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono font-bold text-[#1D6FA4]">{s.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{s.product_name}</div>
                  <div className="text-[11px] text-gray-400 capitalize">{s.product_type}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 font-medium">
                  {s.origin} → {s.destination}
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">
                  {s.setpoint_temp}°C ({s.min_temp}°C to {s.max_temp}°C)
                </td>
                <td className="px-4 py-3 font-mono font-bold text-gray-900">
                  {s.latest_temperature ?? s.setpoint_temp}°C
                </td>
                <td className="px-4 py-3 font-mono">
                  <span
                    className={`px-2 py-0.5 rounded-[4px] text-xs font-bold ${
                      s.risk_score >= 70
                        ? 'bg-red-100 text-red-700'
                        : s.risk_score >= 31
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {s.risk_score}/100
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 text-gray-400 hover:text-[#1D6FA4]">
                    <CaretRight size={16} />
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
