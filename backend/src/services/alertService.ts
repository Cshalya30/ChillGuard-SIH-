import { createAlert, updateShipmentStatus, Shipment } from '../db/queries';
import { broadcastAlertNew, broadcastShipmentStatusChange } from './socketService';

export function evaluateThresholdsAndAlerts(
  shipment: Shipment,
  reading: { temperature: number; door_open: number; timestamp?: string },
  mlResult: { risk_score: number; time_to_breach_minutes: number | null; predicted_temps: number[] }
) {
  const alertsCreated = [];

  // Check temperature breach
  if (reading.temperature > shipment.max_temp || reading.temperature < shipment.min_temp) {
    if (shipment.status !== 'breach') {
      updateShipmentStatus(shipment.id, 'breach');
      broadcastShipmentStatusChange({
        shipment_id: shipment.id,
        old_status: shipment.status,
        new_status: 'breach'
      });
    }

    const alert = createAlert({
      shipment_id: shipment.id,
      alert_type: 'breach',
      severity: 'critical',
      risk_score: mlResult.risk_score,
      time_to_breach_minutes: 0,
      predicted_temp: mlResult.predicted_temps[0] || reading.temperature,
      message: `CRITICAL BREACH: Temperature ${reading.temperature}°C exceeded limit [${shipment.min_temp}°C - ${shipment.max_temp}°C]!`
    });

    broadcastAlertNew({
      alert_id: (alert as any).id,
      shipment_id: shipment.id,
      alert_type: 'breach',
      severity: 'critical',
      message: (alert as any).message,
      risk_score: mlResult.risk_score,
      time_to_breach_minutes: 0
    });
    alertsCreated.push(alert);
  }
  // Check pre-excursion risk alert
  else if (mlResult.risk_score >= 70) {
    const alert = createAlert({
      shipment_id: shipment.id,
      alert_type: 'pre_excursion',
      severity: mlResult.risk_score >= 85 ? 'critical' : 'high',
      risk_score: mlResult.risk_score,
      time_to_breach_minutes: mlResult.time_to_breach_minutes || 15,
      predicted_temp: mlResult.predicted_temps[0] || reading.temperature,
      message: `PRE-EXCURSION WARNING: High risk score (${mlResult.risk_score}/100). Projected breach in ${mlResult.time_to_breach_minutes || 15} min.`
    });

    broadcastAlertNew({
      alert_id: (alert as any).id,
      shipment_id: shipment.id,
      alert_type: 'pre_excursion',
      severity: (alert as any).severity,
      message: (alert as any).message,
      risk_score: mlResult.risk_score,
      time_to_breach_minutes: mlResult.time_to_breach_minutes || 15
    });
    alertsCreated.push(alert);
  }

  // Check door open alert
  if (reading.door_open === 1) {
    const alert = createAlert({
      shipment_id: shipment.id,
      alert_type: 'door_open',
      severity: 'medium',
      risk_score: mlResult.risk_score,
      message: `DOOR OPEN ALERT: Cargo enclosure door opened for shipment ${shipment.id}.`
    });

    broadcastAlertNew({
      alert_id: (alert as any).id,
      shipment_id: shipment.id,
      alert_type: 'door_open',
      severity: 'medium',
      message: (alert as any).message,
      risk_score: mlResult.risk_score
    });
    alertsCreated.push(alert);
  }

  return alertsCreated;
}
