import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MKTDisplay } from '../components/compliance/MKTDisplay';
import { ReportGenerator } from '../components/compliance/ReportGenerator';
import { SkeletonLoader } from '../components/shared/SkeletonLoader';
import { Shipment, CustodyLogEntry } from '../types';
import { User, Clock, Thermometer, UserCheck } from '@phosphor-icons/react';
import { formatRelativeTime } from '../utils/formatting';

export const Compliance: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('SH-2047');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [custodyLogs, setCustodyLogs] = useState<CustodyLogEntry[]>([]);
  const [mktVal, setMktVal] = useState<number | null>(null);
  const [readingsCount, setReadingsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.get(`${backendUrl}/api/v1/shipments`);
        if (res.data.success) {
          setShipments(res.data.data);
          if (res.data.data.length > 0 && !selectedShipmentId) {
            setSelectedShipmentId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch shipments list:', err);
      }
    };
    fetchShipments();
  }, []);

  useEffect(() => {
    const fetchComplianceData = async () => {
      if (!selectedShipmentId) return;
      setLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const [shipmentRes, mktRes, auditRes] = await Promise.all([
          axios.get(`${backendUrl}/api/v1/shipments/${selectedShipmentId}`),
          axios.get(`${backendUrl}/api/v1/compliance/${selectedShipmentId}/mkt`),
          axios.get(`${backendUrl}/api/v1/compliance/${selectedShipmentId}/audit-log`)
        ]);

        if (shipmentRes.data.success) setSelectedShipment(shipmentRes.data.data);
        if (mktRes.data.success) {
          setMktVal(mktRes.data.data.mkt_value);
          setReadingsCount(mktRes.data.data.readings_count);
        }
        if (auditRes.data.success) {
          const custodyOnly = auditRes.data.data.filter((e: any) => e.entry_type === 'custody');
          setCustodyLogs(custodyOnly);
        }
      } catch (err) {
        console.error('Failed to fetch compliance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [selectedShipmentId]);

  return (
    <PageWrapper
      title="GDP Compliance & Audit Verification"
      subtitle="Mean Kinetic Temperature (MKT) verification, Chain of Custody logging & automated audit reports"
    >
      {/* Section 1: Shipment Selector Dropdown */}
      <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <label htmlFor="shipment-selector" className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            Select Target Shipment Profile for Compliance Audit:
          </label>
          <p className="text-xs text-gray-500 mt-0.5">Choose completed or active shipment (Demo Tip: Select SH-2047 for completed audit)</p>
        </div>

        <select
          id="shipment-selector"
          value={selectedShipmentId}
          onChange={(e) => setSelectedShipmentId(e.target.value)}
          className="w-full md:w-80 bg-slate-50 border border-gray-200/80 rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#1D6FA4] focus:outline-none focus:border-[#1D6FA4] transition-all"
        >
          {shipments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} - {s.product_name} ({s.status.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonLoader count={3} height="h-32" />
      ) : selectedShipment ? (
        <>
          {/* Section 2: MKT Display */}
          <MKTDisplay
            mktValue={mktVal}
            minTemp={selectedShipment.min_temp}
            maxTemp={selectedShipment.max_temp}
            readingsCount={readingsCount}
          />

          {/* Section 3: Vertical Custody Log Timeline */}
          <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
                  <UserCheck size={16} weight="fill" className="text-[#1D6FA4]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Chain of Custody Handover Timeline</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">VERTICAL AUDIT NODES</span>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {custodyLogs.length === 0 ? (
                <div className="text-xs text-gray-400 italic py-2">No custody handover events registered for this shipment.</div>
              ) : (
                custodyLogs.map((log, idx) => {
                  const isInRange =
                    log.temperature_at_handoff >= selectedShipment.min_temp &&
                    log.temperature_at_handoff <= selectedShipment.max_temp;

                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Node */}
                      <div
                        className={`absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isInRange ? 'bg-emerald-500 ring-4 ring-emerald-500/15' : 'bg-red-500 ring-4 ring-red-500/15'
                        }`}
                      />

                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-lg p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{log.action}</span>
                          <span className="text-[10px] text-gray-400 font-mono flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatRelativeTime(log.timestamp)}</span>
                          </span>
                        </div>

                        <p className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-500">Operator:</span> {log.operator_name}
                        </p>

                        <div className="flex items-center space-x-3 pt-1 text-xs font-mono">
                          <span className="flex items-center space-x-1 text-gray-700">
                            <Thermometer size={14} className="text-gray-400" />
                            <span>Handoff Temp: <strong>{log.temperature_at_handoff}°C</strong></span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isInRange ? 'bg-emerald-100/80 text-emerald-800' : 'bg-red-100/80 text-red-800'
                            }`}
                          >
                            {isInRange ? 'SAFE AT HANDOFF' : 'EXCURSION AT HANDOFF'}
                          </span>
                        </div>

                        {log.notes && <p className="text-xs text-gray-500 italic pt-0.5">"{log.notes}"</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 4: Report Generation */}
          <ReportGenerator shipmentId={selectedShipment.id} />
        </>
      ) : null}
    </PageWrapper>
  );
};
