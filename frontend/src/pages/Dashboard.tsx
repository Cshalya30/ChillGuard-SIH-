import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MetricCard } from '../components/shared/MetricCard';
import { ShipmentMap } from '../components/map/ShipmentMap';
import { AlertPanel } from '../components/alerts/AlertPanel';
import { ShipmentTable } from '../components/shipments/ShipmentTable';
import { SkeletonLoader } from '../components/shared/SkeletonLoader';
import { useStore } from '../store/useStore';
import { formatRelativeTime } from '../utils/formatting';

export const Dashboard: React.FC = () => {
  const { shipments, alerts, summary, selectedShipmentId, setShipments, setAlerts, setSummary } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const [shipmentsRes, alertsRes, summaryRes] = await Promise.all([
          axios.get(`${backendUrl}/api/v1/shipments`),
          axios.get(`${backendUrl}/api/v1/alerts`),
          axios.get(`${backendUrl}/api/v1/analytics/summary`)
        ]);

        if (shipmentsRes.data.success) setShipments(shipmentsRes.data.data);
        if (alertsRes.data.success) setAlerts(alertsRes.data.data);
        if (summaryRes.data.success) setSummary(summaryRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [setShipments, setAlerts, setSummary]);

  const activeCount = shipments.filter((s) => s.status === 'active').length;
  const atRiskCount = shipments.filter((s) => s.risk_score >= 31 && s.risk_score < 70).length;
  const breachCount = shipments.filter((s) => s.status === 'breach' || s.risk_score >= 70).length;
  const unacknowledgedAlerts = alerts.filter((a) => a.acknowledged === 0);

  const oldestAlertAge = summary?.oldest_alert_created_at
    ? formatRelativeTime(summary.oldest_alert_created_at)
    : (unacknowledgedAlerts.length > 0 ? formatRelativeTime(unacknowledgedAlerts[0].created_at) : 'None');

  return (
    <PageWrapper
      title="Operational Intelligence Dashboard"
      subtitle="Real-time telemetry, predictive risk modeling & cold-chain compliance monitoring"
    >
      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <SkeletonLoader count={4} height="h-28" />
        ) : (
          <>
            <MetricCard
              label="Active Shipments"
              value={activeCount}
              subtitle={`${shipments.length} total monitored profiles`}
              topStripColor="blue"
              animationDelay={0}
            />
            <MetricCard
              label="At-Risk Shipments"
              value={atRiskCount}
              subtitle="Moderate temperature volatility"
              topStripColor="amber"
              animationDelay={60}
            />
            <MetricCard
              label="Breach Events Today"
              value={breachCount}
              subtitle="Requires immediate intervention"
              topStripColor="red"
              animationDelay={120}
            />
            <MetricCard
              label="Unacknowledged Alerts"
              value={unacknowledgedAlerts.length}
              subtitle={`Oldest alert age: ${oldestAlertAge}`}
              topStripColor={unacknowledgedAlerts.length > 0 ? 'red' : 'slate'}
              animationDelay={180}
            />
          </>
        )}
      </div>

      {/* Row 2: 60/40 Map & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          {loading ? (
            <SkeletonLoader height="h-[480px]" />
          ) : (
            <ShipmentMap shipments={shipments} selectedShipmentId={selectedShipmentId} height="480px" />
          )}
        </div>

        <div className="lg:col-span-5">
          {loading ? (
            <SkeletonLoader height="h-[480px]" />
          ) : (
            <AlertPanel alerts={alerts} />
          )}
        </div>
      </div>

      {/* Row 3: Shipment Table */}
      <div>
        {loading ? (
          <SkeletonLoader height="h-64" />
        ) : (
          <ShipmentTable shipments={shipments} />
        )}
      </div>
    </PageWrapper>
  );
};
