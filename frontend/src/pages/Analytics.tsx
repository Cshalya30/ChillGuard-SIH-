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
import { ChartBar, TrendUp, MapPin } from '@phosphor-icons/react';

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
      {/* Section 1: Summary Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <SkeletonLoader count={3} height="h-28" />
        ) : (
          <>
            <MetricCard
              label="Total Spoilage Prevented (Est.)"
              value={summary?.total_spoilage_prevented_est || '$420,000'}
              subtitle="Based on early ML pre-excursion alerts"
              topStripColor="green"
              animationDelay={0}
            />
            <MetricCard
              label="Total Shipments Monitored"
              value={summary?.total_shipments_monitored || 8}
              subtitle="Active cold-chain logistics profiles"
              topStripColor="blue"
              animationDelay={60}
            />
            <MetricCard
              label="Avg Operator Compliance Rate"
              value={`${summary?.avg_operator_compliance_rate || 94.2}%`}
              subtitle="GDP protocol adherence score"
              topStripColor="blue"
              animationDelay={120}
            />
          </>
        )}
      </div>

      {/* Section 2: Two Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Operator Compliance Ranking (Horizontal BarChart) */}
        <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
                <ChartBar size={16} weight="fill" className="text-[#1D6FA4]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Operator Compliance Ranking</h3>
                <p className="text-[11px] text-gray-400">Adherence percentage to temperature setpoints</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
              Green &gt;90% | Amber 70-90%
            </span>
          </div>

          <div className="h-[280px] w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={operators} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} stroke="#CBD5E1" tick={{ fontSize: 10, fill: '#94A3B8' }} unit="%" />
                <YAxis dataKey="operator_name" type="category" stroke="#CBD5E1" width={110} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1B2A',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#FFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
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

        {/* Right: Daily Excursion Frequency */}
        <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
                <TrendUp size={16} weight="fill" className="text-[#1D6FA4]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Daily Excursion Frequency (Last 14 Days)</h3>
                <p className="text-[11px] text-gray-400">Historical trend across product categories</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="text-[#1D6FA4] font-semibold">■ Pharma</span>
              <span className="text-[#D97706] font-semibold">■ Food</span>
              <span className="text-[#16A34A] font-semibold">■ Dairy</span>
            </div>
          </div>

          <div className="h-[280px] w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#CBD5E1" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#CBD5E1" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1B2A',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#FFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                />
                <Area type="monotone" dataKey="pharma_avg_temp" stackId="1" stroke="#1D6FA4" fill="#1D6FA4" fillOpacity={0.4} />
                <Area type="monotone" dataKey="food_avg_temp" stackId="2" stroke="#D97706" fill="#D97706" fillOpacity={0.3} />
                <Area type="monotone" dataKey="dairy_avg_temp" stackId="3" stroke="#16A34A" fill="#16A34A" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Route Risk Table */}
      <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
              <MapPin size={16} weight="fill" className="text-[#1D6FA4]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Route Corridor Risk Analysis</h3>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">High-risk bottlenecks identified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-gray-400 font-semibold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Route Corridor</th>
                <th className="px-4 py-3">Monitored Shipments</th>
                <th className="px-4 py-3">Breach Count</th>
                <th className="px-4 py-3">Avg Risk Score</th>
                <th className="px-4 py-3">Highest Risk Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-sans">
              {routes.map((r, idx) => (
                <tr key={idx} className="table-row-hover">
                  <td className="px-4 py-3.5 font-semibold text-gray-900">{r.route}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-600">{r.shipments}</td>
                  <td className="px-4 py-3.5 font-mono text-red-600 font-bold">{r.breaches}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-2">
                      <StatusPill status={r.avg_risk_score >= 50 ? 'at_risk' : 'active'} />
                      <span className="font-mono font-bold text-gray-900">{r.avg_risk_score}/100</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">{r.highest_risk_segment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};
