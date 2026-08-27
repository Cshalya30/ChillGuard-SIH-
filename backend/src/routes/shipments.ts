import { Router, Request, Response, NextFunction } from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  getReadingsByShipment
} from '../db/queries';
import { validateCreateShipment } from '../middleware/validate';

const router = Router();

// GET /api/v1/shipments
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, product_type, limit, offset } = req.query;
    const shipments = getShipments({
      status: status as string,
      product_type: product_type as string,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0
    });
    res.json({ success: true, data: shipments });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/shipments/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipment = getShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/shipments
router.post('/', validateCreateShipment, (req: Request, res: Response, next: NextFunction) => {
  try {
    const newShipment = createShipment(req.body);
    res.status(201).json({ success: true, data: newShipment });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/shipments/:id/status
router.patch('/:id/status', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['active', 'completed', 'breach', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid shipment status' });
    }
    const updated = updateShipmentStatus(req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/shipments/:id/readings
router.get('/:id/readings', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, from, to } = req.query;
    const readings = getReadingsByShipment(
      req.params.id,
      limit ? parseInt(limit as string, 10) : 100,
      from as string,
      to as string
    );
    res.json({ success: true, data: readings });
  } catch (err) {
    next(err);
  }
});

export default router;
