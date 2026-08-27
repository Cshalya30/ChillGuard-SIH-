export type ProductType = 'pharma' | 'food' | 'dairy' | 'seafood';
export type ShipmentStatus = 'active' | 'completed' | 'breach' | 'offline';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'pre_excursion' | 'breach' | 'door_open' | 'offline' | 'recovery';

export interface Shipment {
  id: string;
  product_name: string;
  product_type: ProductType;
  origin: string;
  destination: string;
  setpoint_temp: number;
  min_temp: number;
  max_temp: number;
  operator_name: string;
  status: ShipmentStatus;
  risk_score: number;
  time_to_breach_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  latest_temperature?: number;
  latest_humidity?: number;
  latest_latitude?: number;
  latest_longitude?: number;
  latest_door_open?: number;
  latest_reading_time?: string;
  readings?: TelemetryReading[];
  active_alerts?: Alert[];
}

export interface TelemetryReading {
  id?: number;
  shipment_id: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  door_open: number;
  ambient_temp?: number;
  timestamp: string;
}

export interface Alert {
  id: number;
  shipment_id: string;
  product_name?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  risk_score?: number;
  time_to_breach_minutes?: number;
  predicted_temp?: number;
  message: string;
  acknowledged: number;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface CustodyLogEntry {
  id: number;
  shipment_id: string;
  operator_name: string;
  action: string;
  temperature_at_handoff: number;
  notes?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  total_active_shipments: number;
  shipments_at_risk: number;
  shipments_in_breach: number;
  unacknowledged_alerts: number;
  oldest_alert_created_at: string | null;
  avg_risk_score: number;
  total_shipments_monitored: number;
  total_spoilage_prevented_est: string;
  avg_operator_compliance_rate: number;
}
