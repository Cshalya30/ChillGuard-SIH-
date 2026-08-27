import { Router, Request, Response, NextFunction } from 'express';
import { validateReading } from '../middleware/validate';
import { insertReading, getShipmentById, updateShipmentRisk, getReadingsByShipment } from '../db/queries';
import { getMLPrediction } from '../services/mlService';
import { evaluateThresholdsAndAlerts } from '../services/alertService';
import { broadcastShipmentUpdate } from '../services/socketService';

const router = Router();

// POST /api/v1/readings
router.post('/', validateReading, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shipment_id, temperature, humidity, latitude, longitude, door_open, ambient_temp } = req.body;

    const shipment = getShipmentById(shipment_id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    // 1. Store reading in DB
    const reading_id = insertReading({
      shipment_id,
      temperature,
      humidity,
      latitude,
      longitude,
      door_open: door_open ? 1 : 0,
      ambient_temp
    });

    // Fetch updated historical readings for ML context
    const readingsHistory = getReadingsByShipment(shipment_id, 30);

    // 2. Call ML service for risk score + trajectory prediction
    const mlPrediction = await getMLPrediction({
      shipment_id,
      readings: readingsHistory,
      setpoint_temp: shipment.setpoint_temp,
      min_temp: shipment.min_temp,
      max_temp: shipment.max_temp,
      product_type: shipment.product_type
    });

    // 3. Update shipment risk_score & time_to_breach in DB
    updateShipmentRisk(shipment_id, mlPrediction.risk_score, mlPrediction.time_to_breach_minutes);

    // 4. Check thresholds and emit alerts if needed
    evaluateThresholdsAndAlerts(
      shipment,
      { temperature, door_open: door_open ? 1 : 0 },
      mlPrediction
    );

    const timestamp = new Date().toISOString();

    // 5. Emit Socket.io event to connected clients
    broadcastShipmentUpdate({
      shipment_id,
      temperature,
      humidity,
      latitude,
      longitude,
      risk_score: mlPrediction.risk_score,
      time_to_breach_minutes: mlPrediction.time_to_breach_minutes,
      status: shipment.status,
      timestamp
    });

    res.status(201).json({
      success: true,
      data: {
        reading_id,
        risk_score: mlPrediction.risk_score,
        time_to_breach_minutes: mlPrediction.time_to_breach_minutes,
        predicted_temps: mlPrediction.predicted_temps
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
