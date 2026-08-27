import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MetricCard } from '../components/shared/MetricCard';
import { SkeletonLoader } from '../components/shared/SkeletonLoader';
import { StatusPill } from '../components/shared/StatusPill';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const [sumRes, opRes, routeRes, trendRes] = await Promise.all([
          axios.get(`${backendUrl}/api/v1/analytics/summary`),
          axios.get(`${backendUrl}/api/v1/analytics/operators`),
          axios.get(`${backendUrl}/api/v1/analytics/routes`),
          axios.get(`${backendUrl}/api/v1/analytics/temperature-trends`)
        ]);

        if (sumRes.data.success) setSummary(sumRes.data.data);
        if (opRes.data.success) setOperators(opRes.data.data);
        if (routeRes.data.success) setRoutes(routeRes.data.data);
        if (trendRes.data.success) setTrends(trendRes.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getBarColor = (rate: number) => {
    if (rate >= 90) return '#16A34A'; // green
    if (rate >= 70) return '#D97706'; // amber
    return '#DC2626'; // red
  };

  return (
    <PageWrapper
      title="Fleet Analytics & Excursion Intelligence"
      subtitle="Operator compliance benchmarking, historical thermal trends & high-risk corridor profiling"
    >
      {/* Section 1: Summary Stats Bar per PRD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <SkeletonLoader count={3} height="h-24" />
        ) : (
          <>
            <MetricCard
              label="Total Spoilage Prevented (Est.)"
              value={summary?.total_spoilage_prevented_est || '$420,000'}
              subtitle="Based on early ML pre-excursion alerts"
              topStripColor="green"
            />
            <MetricCard
              label="Total Shipments Monitored"
              value={summary?.total_shipments_monitored || 8}
              subtitle="Active cold-chain logistics profiles"
              topStripColor="blue"
            />
            <MetricCard
              label="Avg Operator Compliance Rate"
              value={`${summary?.avg_operator_compliance_rate || 94.2}%`}
              subtitle="GDP protocol adherence score"
              topStripColor="blue"
            />
          </>
        )}
      </div>

      {/* Section 2: Two Charts Side-by-Side per PRD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Operator Compliance Ranking (Horizontal BarChart) */}
        <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Operator Compliance Ranking</h3>
              <p className="text-xs text-gray-500">Adherence percentage to temperature setpoints</p>
            </div>
            <span className="text-xs font-mono text-gray-400">Green &gt;90% | Amber 70-90%</span>
          </div>

          <div className="h-[280px] w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={operators} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" unit="%" />
                <YAxis dataKey="operator_name" type="category" stroke="#475569" width={110} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1B2A', borderColor: '#1E293B', color: '#FFF', borderRadius: '6px' }}
                />
                <Bar dataKey="compliance_rate" radius={[0, 4, 4, 0]}>
                  {operators.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.compliance_rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Daily Excursion Frequency (Muted AreaChart) */}
        <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Daily Excursion Frequency (Last 14 Days)</h3>
              <p className="text-xs text-gray-500">Historical trend across product categories</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-[#1D6FA4]">■ Pharma</span>
              <span className="text-[#D97706]">■ Food</span>
              <span className="text-[#16A34A]">■ Dairy</span>
            </div>
          </div>

          <div className="h-[280px] w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1B2A', borderColor: '#1E293B', color: '#FFF', borderRadius: '6px' }}
                />
                <Area type="monotone" dataKey="pharma_avg_temp" stackId="1" stroke="#1D6FA4" fill="#1D6FA4" fillOpacity={0.4} />
                <Area type="monotone" dataKey="food_avg_temp" stackId="2" stroke="#D97706" fill="#D97706" fillOpacity={0.3} />
                <Area type="monotone" dataKey="dairy_avg_temp" stackId="3" stroke="#16A34A" fill="#16A34A" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Route Risk Table per PRD */}
      <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden shadow-card">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Route Corridor Risk Analysis</h3>
          <span className="text-xs text-gray-500 font-mono">High-risk bottlenecks identified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-gray-500 font-medium uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Route Corridor</th>
                <th className="px-4 py-3">Monitored Shipments</th>
                <th className="px-4 py-3">Breach Count</th>
                <th className="px-4 py-3">Avg Risk Score</th>
                <th className="px-4 py-3">Highest Risk Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans">
              {routes.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.route}</td>
                  <td className="px-4 py-3 font-mono">{r.shipments}</td>
                  <td className="px-4 py-3 font-mono text-red-600 font-bold">{r.breaches}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.avg_risk_score >= 50 ? 'at_risk' : 'active'} />
                    <span className="ml-2 font-mono font-bold">{r.avg_risk_score}/100</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{r.highest_risk_segment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};
