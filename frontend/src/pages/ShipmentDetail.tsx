import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusPill } from '../components/shared/StatusPill';
import { TemperatureGraph } from '../components/charts/TemperatureGraph';
import { RiskScoreGauge } from '../components/charts/RiskScoreGauge';
import { ShipmentMap } from '../components/map/ShipmentMap';
import { AuditLog } from '../components/compliance/AuditLog';
import { SkeletonLoader } from '../components/shared/SkeletonLoader';
import { Shipment } from '../types';
import { ArrowLeft, MapPin, User, Clock } from '@phosphor-icons/react';
import { formatRelativeTime } from '../utils/formatting';

export const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const [mktVal, setMktVal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const [shipmentRes, auditRes, mktRes] = await Promise.all([
          axios.get(`${backendUrl}/api/v1/shipments/${id}`),
          axios.get(`${backendUrl}/api/v1/compliance/${id}/audit-log`),
          axios.get(`${backendUrl}/api/v1/compliance/${id}/mkt`)
        ]);

        if (shipmentRes.data.success) setShipment(shipmentRes.data.data);
        if (auditRes.data.success) setAuditEntries(auditRes.data.data);
        if (mktRes.data.success) setMktVal(mktRes.data.data.mkt_value);
      } catch (err) {
        console.error('Failed to fetch shipment detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    const interval = setInterval(fetchDetail, 8000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <PageWrapper title="Shipment Intelligence Detail">
        <SkeletonLoader count={4} height="h-32" />
      </PageWrapper>
    );
  }

  if (!shipment) {
    return (
      <PageWrapper title="Shipment Not Found">
        <div className="bg-white p-8 rounded-[8px] border text-center space-y-3">
          <p className="text-gray-600 font-medium">No shipment record found matching ID: {id}</p>
          <button
            onClick={() => navigate('/shipments')}
            className="px-4 py-2 bg-[#1D6FA4] text-white rounded-[6px] text-xs font-medium"
          >
            Back to Shipments Directory
          </button>
        </div>
      </PageWrapper>
    );
  }

  const readings = shipment.readings || [];
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <PageWrapper
      title={`Shipment Detail: ${shipment.id}`}
      subtitle={`${shipment.product_name} (${shipment.product_type.toUpperCase()})`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/shipments')}
        className="flex items-center space-x-1 text-xs text-slate-600 hover:text-[#1D6FA4] transition-colors font-medium mb-2"
      >
        <ArrowLeft size={14} />
        <span>Back to Shipments</span>
      </button>

      {/* Section 1: Header Bar per PRD */}
      <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold font-mono text-[#1D6FA4]">{shipment.id}</span>
            <h2 className="text-lg font-bold text-gray-900">{shipment.product_name}</h2>
            <StatusPill status={shipment.status} />
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-600 font-medium">
            <div className="flex items-center space-x-1">
              <MapPin size={16} className="text-gray-400" />
              <span>{shipment.origin} → {shipment.destination}</span>
            </div>

            <div className="flex items-center space-x-1">
              <User size={16} className="text-gray-400" />
              <span>{shipment.operator_name}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock size={16} className="text-gray-400" />
              <span>Started {formatRelativeTime(shipment.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Two Columns (65/35 split) per PRD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TemperatureGraph
            readings={readings}
            setpointTemp={shipment.setpoint_temp}
            minTemp={shipment.min_temp}
            maxTemp={shipment.max_temp}
          />
        </div>

        <div className="lg:col-span-4">
          <RiskScoreGauge
            riskScore={shipment.risk_score}
            timeToBreachMinutes={shipment.time_to_breach_minutes}
            currentTemp={latestReading ? latestReading.temperature : shipment.setpoint_temp}
            humidity={latestReading ? latestReading.humidity : 55}
            mktValue={mktVal}
            lastReadingTime={latestReading ? latestReading.timestamp : shipment.created_at}
            setpointTemp={shipment.setpoint_temp}
          />
        </div>
      </div>

      {/* Section 3: Map (300px height) per PRD */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Active Telemetry Route Trace</h3>
        <ShipmentMap shipments={[shipment]} selectedShipmentId={shipment.id} height="300px" />
      </div>

      {/* Section 4: Audit Trail per PRD */}
      <div>
        <AuditLog entries={auditEntries} />
      </div>
    </PageWrapper>
  );
};
