import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ShipmentTable } from '../components/shipments/ShipmentTable';
import { SkeletonLoader } from '../components/shared/SkeletonLoader';
import { Shipment } from '../types';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';

export const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.get(`${backendUrl}/api/v1/shipments`);
        if (res.data.success) {
          setShipments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch shipments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.product_name.toLowerCase().includes(search.toLowerCase()) ||
      s.operator_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesType = typeFilter === 'all' || s.product_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <PageWrapper
      title="Shipment Registry & Logistics Directory"
      subtitle="Complete list of cold-chain shipments, status indicators, and operational metrics"
    >
      {/* Search and Filters Bar */}
      <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlass size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Product, or Operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200/80 rounded-lg text-xs font-sans focus:outline-none focus:border-[#1D6FA4] focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
            <Funnel size={14} className="text-[#1D6FA4]" />
            <span>Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-gray-200/80 rounded-lg px-3 py-2 text-xs text-gray-700 font-sans focus:outline-none focus:border-[#1D6FA4] transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="at_risk">At Risk</option>
            <option value="breach">Breach</option>
            <option value="completed">Completed</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-gray-200/80 rounded-lg px-3 py-2 text-xs text-gray-700 font-sans focus:outline-none focus:border-[#1D6FA4] transition-all"
          >
            <option value="all">All Categories</option>
            <option value="pharma">Pharmaceuticals</option>
            <option value="food">Food & Produce</option>
            <option value="dairy">Dairy</option>
            <option value="seafood">Seafood</option>
          </select>
        </div>
      </div>

      {/* Shipment Table */}
      {loading ? <SkeletonLoader count={3} height="h-32" /> : <ShipmentTable shipments={filteredShipments} />}
    </PageWrapper>
  );
};
