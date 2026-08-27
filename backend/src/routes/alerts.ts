import { Router, Request, Response, NextFunction } from 'express';
import { getAlerts, acknowledgeAlert, getUnacknowledgedAlertCount } from '../db/queries';
import { validateAcknowledgeAlert } from '../middleware/validate';
import { broadcastAlertAcknowledged } from '../services/socketService';

const router = Router();

// GET /api/v1/alerts
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { acknowledged, shipment_id, severity, limit } = req.query;
    const alerts = getAlerts({
      acknowledged: acknowledged !== undefined ? parseInt(acknowledged as string, 10) : undefined,
      shipment_id: shipment_id as string,
      severity: severity as string,
      limit: limit ? parseInt(limit as string, 10) : 50
    });
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/alerts/active/count
router.get('/active/count', (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = getUnacknowledgedAlertCount();
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/alerts/:id/acknowledge
router.patch('/:id/acknowledge', validateAcknowledgeAlert, (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = parseInt(req.params.id, 10);
    const { acknowledged_by } = req.body;
    const updated = acknowledgeAlert(alertId, acknowledged_by);

    broadcastAlertAcknowledged({
      alert_id: alertId,
      acknowledged_by
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
