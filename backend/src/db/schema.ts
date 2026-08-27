import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../chillguard.db');
export const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      product_type TEXT NOT NULL CHECK(product_type IN ('pharma','food','dairy','seafood')),
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      setpoint_temp REAL NOT NULL,
      min_temp REAL NOT NULL,
      max_temp REAL NOT NULL,
      operator_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','breach','offline')),
      risk_score INTEGER DEFAULT 0,
      time_to_breach_minutes INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id TEXT NOT NULL REFERENCES shipments(id),
      temperature REAL NOT NULL,
      humidity REAL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      door_open INTEGER NOT NULL DEFAULT 0,
      ambient_temp REAL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id TEXT NOT NULL REFERENCES shipments(id),
      alert_type TEXT NOT NULL CHECK(alert_type IN ('pre_excursion','breach','door_open','offline','recovery')),
      severity TEXT NOT NULL CHECK(severity IN ('low','medium','high','critical')),
      risk_score INTEGER,
      time_to_breach_minutes INTEGER,
      predicted_temp REAL,
      message TEXT NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0,
      acknowledged_by TEXT,
      acknowledged_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custody_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id TEXT NOT NULL REFERENCES shipments(id),
      operator_name TEXT NOT NULL,
      action TEXT NOT NULL,
      temperature_at_handoff REAL,
      notes TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS compliance_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id TEXT NOT NULL REFERENCES shipments(id),
      mkt_value REAL,
      total_excursion_minutes INTEGER DEFAULT 0,
      max_deviation REAL DEFAULT 0,
      report_pdf_path TEXT,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_readings_shipment_time ON readings(shipment_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_shipment ON alerts(shipment_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_unacknowledged ON alerts(acknowledged) WHERE acknowledged = 0;
  `);
}
