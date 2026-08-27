import { Router, Request, Response, NextFunction } from 'express';
import {
  getShipmentById,
  getReadingsByShipment,
  getAuditLogByShipment,
  getCustodyLogByShipment,
  insertCustodyLog,
  getAlerts
} from '../db/queries';
import { getMKTCalculation, generatePDFReport } from '../services/mlService';

const router = Router();

// GET /api/v1/compliance/:shipment_id/mkt
router.get('/:shipment_id/mkt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shipment_id } = req.params;
    const readings = getReadingsByShipment(shipment_id, 500);

    if (!readings || readings.length === 0) {
      return res.status(404).json({ success: false, error: 'No readings found for shipment' });
    }

    const mktResult = await getMKTCalculation(readings as any);

    res.json({
      success: true,
      data: {
        mkt_value: mktResult.mkt_celsius,
        calculation_method: 'Arrhenius Kinetics (Ea = 83,144 J/mol)',
        readings_count: readings.length,
        interpretation: mktResult.interpretation
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/compliance/:shipment_id/audit-log
router.get('/:shipment_id/audit-log', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shipment_id } = req.params;
    const auditTrail = getAuditLogByShipment(shipment_id);
    res.json({ success: true, data: auditTrail });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/compliance/:shipment_id/custody
router.post('/:shipment_id/custody', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shipment_id } = req.params;
    const { operator_name, action, temperature_at_handoff, notes } = req.body;

    if (!operator_name || !action || temperature_at_handoff === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required custody log fields' });
    }

    const entry = insertCustodyLog({
      shipment_id,
      operator_name,
      action,
      temperature_at_handoff: parseFloat(temperature_at_handoff),
      notes
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/compliance/:shipment_id/report
router.get('/:shipment_id/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shipment_id } = req.params;
    const shipment = getShipmentById(shipment_id);

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const readings = getReadingsByShipment(shipment_id, 200);
    const alerts = getAlerts({ shipment_id, limit: 50 });
    const custody_log = getCustodyLogByShipment(shipment_id);
    const mktResult = await getMKTCalculation(readings as any);

    try {
      const pdfBuffer = await generatePDFReport({
        shipment,
        readings,
        alerts,
        custody_log,
        mkt_value: mktResult.mkt_celsius
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=chillguard-gdp-report-${shipment_id}.pdf`);
      res.send(pdfBuffer);
    } catch (pdfErr) {
      // If Python ReportLab endpoint fails, send mock text/pdf or structured report fallback
      console.warn('[PDF Report Fallback]', pdfErr);
      const fallbackDoc = Buffer.from(
        `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 200 >>\nstream\nBT /F1 18 Tf 50 750 TD (CHILLGUARD GDP COMPLIANCE AUDIT REPORT) Tj 0 -30 TD /F1 12 Tf (Shipment ID: ${shipment.id}) Tj 0 -20 TD (Product: ${shipment.product_name}) Tj 0 -20 TD (Operator: ${shipment.operator_name}) Tj 0 -20 TD (Status: ${shipment.status.toUpperCase()}) Tj 0 -20 TD (MKT Value: ${mktResult.mkt_celsius}°C) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000215 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n470\n%%EOF`
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=chillguard-report-${shipment_id}.pdf`);
      res.send(fallbackDoc);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
