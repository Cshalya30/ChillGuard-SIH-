import { initDatabase, db } from './schema';

export function seedDatabase() {
  initDatabase();

  // Clear existing data for clean demo state
  db.exec(`
    DELETE FROM compliance_reports;
    DELETE FROM custody_log;
    DELETE FROM alerts;
    DELETE FROM readings;
    DELETE FROM shipments;
  `);

  console.log('Seeding demo shipment profiles...');

  const shipments = [
    {
      id: 'SH-2041',
      product_name: 'Insulin (Biocon)',
      product_type: 'pharma',
      origin: 'Bengaluru',
      destination: 'Mysuru',
      setpoint_temp: 5.0,
      min_temp: 2.0,
      max_temp: 8.0,
      operator_name: 'ColdEx Logistics',
      status: 'active',
      risk_score: 78,
      time_to_breach_minutes: 18
    },
    {
      id: 'SH-2042',
      product_name: 'Alphonso Mangoes',
      product_type: 'food',
      origin: 'Ramanagara',
      destination: 'Chennai',
      setpoint_temp: 10.0,
      min_temp: 8.0,
      max_temp: 14.0,
      operator_name: 'Snowman Logistics',
      status: 'active',
      risk_score: 45,
      time_to_breach_minutes: 42
    },
    {
      id: 'SH-2043',
      product_name: 'Hepatitis B Vaccine',
      product_type: 'pharma',
      origin: 'Bengaluru',
      destination: 'Hubballi',
      setpoint_temp: 5.0,
      min_temp: 2.0,
      max_temp: 8.0,
      operator_name: 'Blue Dart ColdChain',
      status: 'active',
      risk_score: 12,
      time_to_breach_minutes: null
    },
    {
      id: 'SH-2044',
      product_name: 'Tilapia (Export)',
      product_type: 'seafood',
      origin: 'Mangaluru',
      destination: 'Bengaluru',
      setpoint_temp: 0.0,
      min_temp: -2.0,
      max_temp: 4.0,
      operator_name: 'Gati KWE Pharma',
      status: 'active',
      risk_score: 52,
      time_to_breach_minutes: 35
    },
    {
      id: 'SH-2045',
      product_name: 'Blood samples',
      product_type: 'pharma',
      origin: 'Bengaluru',
      destination: 'Kolar',
      setpoint_temp: 4.0,
      min_temp: 2.0,
      max_temp: 6.0,
      operator_name: 'ColdEx Logistics',
      status: 'offline',
      risk_score: 65,
      time_to_breach_minutes: 25
    },
    {
      id: 'SH-2046',
      product_name: 'mRNA Vaccine',
      product_type: 'pharma',
      origin: 'Bengaluru',
      destination: 'Delhi (air)',
      setpoint_temp: -20.0,
      min_temp: -25.0,
      max_temp: -15.0,
      operator_name: 'Blue Dart ColdChain',
      status: 'breach',
      risk_score: 95,
      time_to_breach_minutes: 0
    },
    {
      id: 'SH-2047',
      product_name: 'Dairy (Nandini)',
      product_type: 'dairy',
      origin: 'Tumkur',
      destination: 'Bengaluru',
      setpoint_temp: 4.0,
      min_temp: 2.0,
      max_temp: 6.0,
      operator_name: 'Snowman Logistics',
      status: 'completed',
      risk_score: 8,
      time_to_breach_minutes: null
    },
    {
      id: 'SH-2048',
      product_name: 'Chemotherapy drugs',
      product_type: 'pharma',
      origin: 'Mysuru',
      destination: 'Bengaluru',
      setpoint_temp: 4.0,
      min_temp: 2.0,
      max_temp: 8.0,
      operator_name: 'ColdEx Logistics',
      status: 'active',
      risk_score: 62,
      time_to_breach_minutes: 28
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO shipments (id, product_name, product_type, origin, destination, setpoint_temp, min_temp, max_temp, operator_name, status, risk_score, time_to_breach_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of shipments) {
    stmt.run(s.id, s.product_name, s.product_type, s.origin, s.destination, s.setpoint_temp, s.min_temp, s.max_temp, s.operator_name, s.status, s.risk_score, s.time_to_breach_minutes);
  }

  // Pre-seed readings (last 2 hours of readings every 5 minutes = ~24 readings per shipment)
  const now = Date.now();
  const readingStmt = db.prepare(`
    INSERT INTO readings (shipment_id, temperature, humidity, latitude, longitude, door_open, ambient_temp, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const routes: Record<string, { lat: number; lng: number }[]> = {
    'SH-2041': [{ lat: 12.9716, lng: 77.5946 }, { lat: 12.7, lng: 77.3 }, { lat: 12.3, lng: 76.6 }],
    'SH-2042': [{ lat: 12.72, lng: 77.28 }, { lat: 13.1, lng: 78.2 }, { lat: 13.08, lng: 80.27 }],
    'SH-2043': [{ lat: 12.9716, lng: 77.5946 }, { lat: 14.45, lng: 75.92 }, { lat: 15.36, lng: 75.12 }],
    'SH-2044': [{ lat: 12.9141, lng: 74.8560 }, { lat: 12.8, lng: 75.8 }, { lat: 12.97, lng: 77.59 }],
    'SH-2045': [{ lat: 12.9716, lng: 77.5946 }, { lat: 13.1, lng: 77.8 }, { lat: 13.13, lng: 78.13 }],
    'SH-2046': [{ lat: 12.9716, lng: 77.5946 }, { lat: 20.0, lng: 77.0 }, { lat: 28.61, lng: 77.20 }],
    'SH-2047': [{ lat: 13.34, lng: 77.10 }, { lat: 13.1, lng: 77.3 }, { lat: 12.97, lng: 77.59 }],
    'SH-2048': [{ lat: 12.30, lng: 76.64 }, { lat: 12.6, lng: 77.1 }, { lat: 12.97, lng: 77.59 }]
  };

  for (const s of shipments) {
    const route = routes[s.id] || [{ lat: 12.97, lng: 77.59 }];
    for (let i = 24; i >= 0; i--) {
      const ts = new Date(now - i * 5 * 60 * 1000).toISOString();
      const progress = (24 - i) / 24;
      const startPos = route[0];
      const endPos = route[route.length - 1];
      const lat = startPos.lat + (endPos.lat - startPos.lat) * progress + (Math.random() - 0.5) * 0.005;
      const lng = startPos.lng + (endPos.lng - startPos.lng) * progress + (Math.random() - 0.5) * 0.005;

      let temp = s.setpoint_temp + (Math.random() - 0.5) * 0.4;
      let door_open = 0;

      // Inject demo conditions for specific shipments
      if (s.id === 'SH-2041' && i <= 8) { // refrigeration fault starting ~40 mins ago
        temp = s.setpoint_temp + (9 - i) * 0.55;
      } else if (s.id === 'SH-2042' && i >= 10 && i <= 13) { // door open
        door_open = 1;
        temp += 2.2;
      } else if (s.id === 'SH-2046') { // breach
        temp = -12.5 + (24 - i) * 0.4;
      } else if (s.id === 'SH-2048' && i <= 12) { // slow degradation
        temp = s.setpoint_temp + (13 - i) * 0.28;
      }

      readingStmt.run(s.id, Math.round(temp * 100) / 100, Math.round(55 + Math.random() * 15), lat, lng, door_open, 29.5, ts);
    }
  }

  // Pre-seed initial alerts
  const alertStmt = db.prepare(`
    INSERT INTO alerts (shipment_id, alert_type, severity, risk_score, time_to_breach_minutes, predicted_temp, message, acknowledged, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  alertStmt.run(
    'SH-2041',
    'pre_excursion',
    'high',
    78,
    18,
    8.4,
    'PRE-EXCURSION WARNING: Temperature rising at 0.55°C/15m. Projected breach in 18 min.',
    0,
    new Date(now - 4 * 60 * 1000).toISOString()
  );

  alertStmt.run(
    'SH-2042',
    'door_open',
    'medium',
    45,
    42,
    12.8,
    'DOOR OPEN ALERT: Cargo door open for > 5 minutes. Ambient temperature heat ingress.',
    0,
    new Date(now - 12 * 60 * 1000).toISOString()
  );

  alertStmt.run(
    'SH-2046',
    'breach',
    'critical',
    95,
    0,
    -10.2,
    'CRITICAL BREACH EXCURSION: Temperature -12.5°C exceeds maximum threshold (-15.0°C)!',
    0,
    new Date(now - 15 * 60 * 1000).toISOString()
  );

  // Pre-seed custody log for SH-2047 (completed shipment for compliance demo) and SH-2041
  const custodyStmt = db.prepare(`
    INSERT INTO custody_log (shipment_id, operator_name, action, temperature_at_handoff, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  custodyStmt.run('SH-2047', 'Tumkur Dairy Depot', 'Origin Dispatch & Sensor Verification', 3.8, 'Sensor calibrated, seals intact.', new Date(now - 4 * 60 * 60 * 1000).toISOString());
  custodyStmt.run('SH-2047', 'Snowman Logistics Driver R. Kumar', 'Transit Midpoint Checkpoint', 4.1, 'Refrigeration unit operating normally.', new Date(now - 2 * 60 * 60 * 1000).toISOString());
  custodyStmt.run('SH-2047', 'Bengaluru Central Distribution Hub', 'Final Handoff & Acceptance', 4.0, 'Shipment delivered in optimal condition. Passed MKT audit.', new Date(now - 30 * 60 * 1000).toISOString());

  custodyStmt.run('SH-2041', 'Biocon Pharma Depot', 'Initial Loading', 4.9, 'Cold box pre-chilled to 5.0°C.', new Date(now - 2 * 60 * 60 * 1000).toISOString());

  console.log('Database pre-seeded successfully with 8 shipment profiles.');
}

if (require.main === module) {
  seedDatabase();
}
