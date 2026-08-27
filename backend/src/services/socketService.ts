import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export function initSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`Client connected: ${socket.id}`);

    socket.on('subscribe:shipment', ({ shipment_id }: { shipment_id: string }) => {
      socket.join(`shipment:${shipment_id}`);
    });

    socket.on('unsubscribe:shipment', ({ shipment_id }: { shipment_id: string }) => {
      socket.leave(`shipment:${shipment_id}`);
    });

    socket.on('disconnect', () => {
      // console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
}

export function broadcastShipmentUpdate(data: {
  shipment_id: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  risk_score: number;
  time_to_breach_minutes: number | null;
  status: string;
  timestamp: string;
}) {
  if (io) {
    io.emit('shipment:update', data);
    io.to(`shipment:${data.shipment_id}`).emit('shipment:update', data);
  }
}

export function broadcastAlertNew(data: {
  alert_id: number;
  shipment_id: string;
  alert_type: string;
  severity: string;
  message: string;
  risk_score?: number;
  time_to_breach_minutes?: number;
}) {
  if (io) {
    io.emit('alert:new', data);
    io.to(`shipment:${data.shipment_id}`).emit('alert:new', data);
  }
}

export function broadcastAlertAcknowledged(data: { alert_id: number; acknowledged_by: string }) {
  if (io) {
    io.emit('alert:acknowledged', data);
  }
}

export function broadcastShipmentStatusChange(data: { shipment_id: string; old_status: string; new_status: string }) {
  if (io) {
    io.emit('shipment:status_change', data);
    io.to(`shipment:${data.shipment_id}`).emit('shipment:status_change', data);
  }
}
