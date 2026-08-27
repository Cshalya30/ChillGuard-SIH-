import { Router, Request, Response, NextFunction } from 'express';
import {
  getAnalyticsSummary,
  getAnalyticsOperators,
  getAnalyticsRoutes,
  getAnalyticsTemperatureTrends
} from '../db/queries';

const router = Router();

// GET /api/v1/analytics/summary
router.get('/summary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = getAnalyticsSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/operators
router.get('/operators', (req: Request, res: Response, next: NextFunction) => {
  try {
    const operators = getAnalyticsOperators();
    res.json({ success: true, data: operators });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/routes
router.get('/routes', (req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = getAnalyticsRoutes();
    res.json({ success: true, data: routes });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/temperature-trends
router.get('/temperature-trends', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_type, days } = req.query;
    const trends = getAnalyticsTemperatureTrends(
      product_type as string,
      days ? parseInt(days as string, 10) : 7
    );
    res.json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
});

export default router;
