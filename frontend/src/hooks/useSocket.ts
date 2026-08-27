import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

let socket: Socket | null = null;

export function useSocket() {
  const { updateShipment, addAlert, acknowledgeAlert } = useStore();

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        // console.log('[Socket] Connected to backend real-time stream');
      });

      socket.on('shipment:update', (data) => {
        updateShipment({
          id: data.shipment_id,
          latest_temperature: data.temperature,
          latest_humidity: data.humidity,
          latest_latitude: data.latitude,
          latest_longitude: data.longitude,
          risk_score: data.risk_score,
          time_to_breach_minutes: data.time_to_breach_minutes,
          status: data.status,
          latest_reading_time: data.timestamp
        });
      });

      socket.on('alert:new', (alertData) => {
        addAlert({
          id: alertData.alert_id,
          shipment_id: alertData.shipment_id,
          alert_type: alertData.alert_type,
          severity: alertData.severity,
          message: alertData.message,
          risk_score: alertData.risk_score,
          time_to_breach_minutes: alertData.time_to_breach_minutes,
          acknowledged: 0,
          created_at: new Date().toISOString()
        });
      });

      socket.on('alert:acknowledged', ({ alert_id, acknowledged_by }) => {
        acknowledgeAlert(alert_id, acknowledged_by);
      });
    }

    return () => {
      // Keep persistent connection across route transitions
    };
  }, [updateShipment, addAlert, acknowledgeAlert]);

  return socket;
}
