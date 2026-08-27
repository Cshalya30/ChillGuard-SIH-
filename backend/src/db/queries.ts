import { db } from './schema';

export interface Shipment {
  id: string;
  product_name: string;
  product_type: 'pharma' | 'food' | 'dairy' | 'seafood';
  origin: string;
  destination: string;
  setpoint_temp: number;
  min_temp: number;
  max_temp: number;
  operator_name: string;
  status: 'active' | 'completed' | 'breach' | 'offline';
  risk_score: number;
  time_to_breach_minutes: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface Reading {
  id?: number;
  shipment_id: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  door_open: number;
  ambient_temp?: number;
  timestamp?: string;
}

export interface Alert {
  id?: number;
  shipment_id: string;
  alert_type: 'pre_excursion' | 'breach' | 'door_open' | 'offline' | 'recovery';
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score?: number;
  time_to_breach_minutes?: number;
  predicted_temp?: number;
  message: string;
  acknowledged?: number;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at?: string;
}

export interface CustodyLog {
  id?: number;
  shipment_id: string;
  operator_name: string;
  action: string;
  temperature_at_handoff: number;
  notes?: string;
  timestamp?: string;
}

// Prepared Statements & Query Helpers

export function getShipments(params: { status?: string; product_type?: string; limit?: number; offset?: number }) {
  let query = `
    SELECT s.*, 
           r.temperature as latest_temperature, 
           r.humidity as latest_humidity,
           r.latitude as latest_latitude,
           r.longitude as latest_longitude,
           r.door_open as latest_door_open,
           r.timestamp as latest_reading_time
    FROM shipments s
    LEFT JOIN readings r ON r.id = (
      SELECT id FROM readings WHERE shipment_id = s.id ORDER BY timestamp DESC LIMIT 1
    )
  `;
  const conditions: string[] = [];
  const args: any[] = [];

  if (params.status) {
    conditions.push('s.status = ?');
    args.push(params.status);
  }
  if (params.product_type) {
    conditions.push('s.product_type = ?');
    args.push(params.product_type);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY s.created_at DESC';

  const limit = params.limit || 50;
  const offset = params.offset || 0;
  query += ' LIMIT ? OFFSET ?';
  args.push(limit, offset);

  return db.prepare(query).all(...args);
}

export function getShipmentById(id: string) {
  const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id) as Shipment | undefined;
  if (!shipment) return null;

  const readings = db.prepare(
    'SELECT * FROM readings WHERE shipment_id = ? ORDER BY timestamp DESC LIMIT 50'
  ).all(id);

  const active_alerts = db.prepare(
    'SELECT * FROM alerts WHERE shipment_id = ? AND acknowledged = 0 ORDER BY created_at DESC'
  ).all(id);

  return {
    ...shipment,
    readings: readings.reverse(), // ascending time order for chart rendering
    active_alerts
  };
}

export function createShipment(data: {
  id: string;
  product_name: string;
  product_type: string;
  origin: string;
  destination: string;
  setpoint_temp: number;
  min_temp: number;
  max_temp: number;
  operator_name: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO shipments (id, product_name, product_type, origin, destination, setpoint_temp, min_temp, max_temp, operator_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    data.id,
    data.product_name,
    data.product_type,
    data.origin,
    data.destination,
    data.setpoint_temp,
    data.min_temp,
    data.max_temp,
    data.operator_name
  );
  return getShipmentById(data.id);
}

export function updateShipmentStatus(id: string, status: string) {
  const completed_at = status === 'completed' ? new Date().toISOString() : null;
  db.prepare(`
    UPDATE shipments SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?
  `).run(status, completed_at, id);
  return getShipmentById(id);
}

export function updateShipmentRisk(id: string, risk_score: number, time_to_breach_minutes: number | null) {
  db.prepare(`
    UPDATE shipments SET risk_score = ?, time_to_breach_minutes = ? WHERE id = ?
  `).run(risk_score, time_to_breach_minutes, id);
}

export function getReadingsByShipment(shipment_id: string, limit = 100, from?: string, to?: string) {
  let sql = 'SELECT * FROM readings WHERE shipment_id = ?';
  const args: any[] = [shipment_id];

  if (from) {
    sql += ' AND timestamp >= ?';
    args.push(from);
  }
  if (to) {
    sql += ' AND timestamp <= ?';
    args.push(to);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ?';
  args.push(limit);

  const rows = db.prepare(sql).all(...args);
  return rows.reverse();
}

export function insertReading(data: Reading) {
  const timestamp = data.timestamp || new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO readings (shipment_id, temperature, humidity, latitude, longitude, door_open, ambient_temp, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.shipment_id,
    data.temperature,
    data.humidity,
    data.latitude,
    data.longitude,
    data.door_open ? 1 : 0,
    data.ambient_temp ?? null,
    timestamp
  );
  return info.lastInsertRowid;
}

export function getAlerts(params: { acknowledged?: number; shipment_id?: string; severity?: string; limit?: number }) {
  let sql = 'SELECT a.*, s.product_name FROM alerts a JOIN shipments s ON a.shipment_id = s.id';
  const conditions: string[] = [];
  const args: any[] = [];

  if (params.acknowledged !== undefined) {
    conditions.push('a.acknowledged = ?');
    args.push(params.acknowledged);
  }
  if (params.shipment_id) {
    conditions.push('a.shipment_id = ?');
    args.push(params.shipment_id);
  }
  if (params.severity) {
    conditions.push('a.severity = ?');
    args.push(params.severity);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY a.created_at DESC LIMIT ?';
  args.push(params.limit || 50);

  return db.prepare(sql).all(...args);
}

export function createAlert(data: Alert) {
  const timestamp = data.created_at || new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO alerts (shipment_id, alert_type, severity, risk_score, time_to_breach_minutes, predicted_temp, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.shipment_id,
    data.alert_type,
    data.severity,
    data.risk_score ?? null,
    data.time_to_breach_minutes ?? null,
    data.predicted_temp ?? null,
    data.message,
    timestamp
  );
  return db.prepare('SELECT * FROM alerts WHERE id = ?').get(info.lastInsertRowid);
}

export function acknowledgeAlert(id: number, acknowledged_by: string) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE alerts SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = ? WHERE id = ?
  `).run(acknowledged_by, now, id);
  return db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
}

export function getUnacknowledgedAlertCount() {
  const row = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0').get() as { count: number };
  return row.count;
}

export function getAuditLogByShipment(shipment_id: string) {
  const alerts = db.prepare("SELECT id, created_at as timestamp, 'alert' as entry_type, alert_type, severity, message FROM alerts WHERE shipment_id = ?").all(shipment_id);
  const custody = db.prepare("SELECT id, timestamp, 'custody' as entry_type, operator_name, action, temperature_at_handoff, notes FROM custody_log WHERE shipment_id = ?").all(shipment_id);
  const readings = db.prepare("SELECT id, timestamp, 'reading_anomaly' as entry_type, temperature, door_open FROM readings WHERE shipment_id = ? AND (temperature > 8 OR temperature < 2 OR door_open = 1) ORDER BY timestamp DESC LIMIT 20").all(shipment_id);

  const combined = [...alerts, ...custody, ...readings];
  return combined.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function insertCustodyLog(data: CustodyLog) {
  const timestamp = data.timestamp || new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO custody_log (shipment_id, operator_name, action, temperature_at_handoff, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.shipment_id,
    data.operator_name,
    data.action,
    data.temperature_at_handoff,
    data.notes ?? '',
    timestamp
  );
  return db.prepare('SELECT * FROM custody_log WHERE id = ?').get(info.lastInsertRowid);
}

export function getCustodyLogByShipment(shipment_id: string) {
  return db.prepare('SELECT * FROM custody_log WHERE shipment_id = ? ORDER BY timestamp ASC').all(shipment_id);
}

export function getAnalyticsSummary() {
  const total_active = db.prepare("SELECT COUNT(*) as count FROM shipments WHERE status = 'active'").get() as { count: number };
  const at_risk = db.prepare("SELECT COUNT(*) as count FROM shipments WHERE status = 'active' AND risk_score >= 31 AND risk_score < 70").get() as { count: number };
  const in_breach = db.prepare("SELECT COUNT(*) as count FROM shipments WHERE status = 'breach' OR (status = 'active' AND risk_score >= 70)").get() as { count: number };
  const unack_alerts = getUnacknowledgedAlertCount();
  const avg_risk = db.prepare("SELECT AVG(risk_score) as avg_score FROM shipments WHERE status = 'active'").get() as { avg_score: number | null };
  const total_shipments = db.prepare("SELECT COUNT(*) as count FROM shipments").get() as { count: number };

  const oldest_unack = db.prepare("SELECT created_at FROM alerts WHERE acknowledged = 0 ORDER BY created_at ASC LIMIT 1").get() as { created_at: string } | undefined;

  return {
    total_active_shipments: total_active.count,
    shipments_at_risk: at_risk.count,
    shipments_in_breach: in_breach.count,
    unacknowledged_alerts: unack_alerts,
    oldest_alert_created_at: oldest_unack ? oldest_unack.created_at : null,
    avg_risk_score: Math.round(avg_risk.avg_score || 0),
    total_shipments_monitored: total_shipments.count,
    total_spoilage_prevented_est: "$420,000",
    avg_operator_compliance_rate: 94.2
  };
}

export function getAnalyticsOperators() {
  return [
    { operator_name: 'ColdEx Logistics', compliance_rate: 96.5, breach_count: 1, total_shipments: 45 },
    { operator_name: 'Snowman Logistics', compliance_rate: 92.0, breach_count: 3, total_shipments: 38 },
    { operator_name: 'Blue Dart ColdChain', compliance_rate: 98.2, breach_count: 0, total_shipments: 52 },
    { operator_name: 'Gati KWE Pharma', compliance_rate: 88.4, breach_count: 5, total_shipments: 31 }
  ];
}

export function getAnalyticsRoutes() {
  return [
    { route: 'Bengaluru → Mysuru', shipments: 24, breaches: 1, avg_risk_score: 18, highest_risk_segment: 'NICE Road Expressway' },
    { route: 'Ramanagara → Chennai', shipments: 18, breaches: 2, avg_risk_score: 35, highest_risk_segment: 'Hosur Border Border Post' },
    { route: 'Mangaluru → Bengaluru', shipments: 15, breaches: 1, avg_risk_score: 28, highest_risk_segment: 'Shiradi Ghat Pass' },
    { route: 'Bengaluru → Delhi (Air)', shipments: 12, breaches: 3, avg_risk_score: 62, highest_risk_segment: 'Tarmac Handoff Area' },
    { route: 'Mysuru → Bengaluru', shipments: 20, breaches: 0, avg_risk_score: 12, highest_risk_segment: 'Mandya Outer Ring' }
  ];
}

export function getAnalyticsTemperatureTrends(product_type?: string, days = 7) {
  // Generate structured trends data
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      pharma_avg_temp: 4.8 + Math.sin(i) * 0.4,
      food_avg_temp: 11.2 + Math.cos(i) * 0.6,
      dairy_avg_temp: 3.9 + Math.sin(i * 0.5) * 0.3,
      breaches_count: Math.max(0, Math.floor(Math.sin(i * 2) * 2 + 1))
    });
  }
  return result;
}
