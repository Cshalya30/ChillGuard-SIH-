import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: ' + errors.array().map(e => `${e.type === 'field' ? e.path : ''} ${e.msg}`).join(', '),
      details: errors.array()
    });
  }
  next();
};

export const validateCreateShipment = [
  body('id').isString().notEmpty().withMessage('id is required'),
  body('product_name').isString().notEmpty().withMessage('product_name is required'),
  body('product_type').isIn(['pharma', 'food', 'dairy', 'seafood']).withMessage('product_type must be pharma, food, dairy, or seafood'),
  body('origin').isString().notEmpty().withMessage('origin is required'),
  body('destination').isString().notEmpty().withMessage('destination is required'),
  body('setpoint_temp').isNumeric().withMessage('setpoint_temp must be numeric'),
  body('min_temp').isNumeric().withMessage('min_temp must be numeric'),
  body('max_temp').isNumeric().withMessage('max_temp must be numeric'),
  body('operator_name').isString().notEmpty().withMessage('operator_name is required'),
  handleValidationErrors
];

export const validateReading = [
  body('shipment_id').isString().notEmpty().withMessage('shipment_id is required'),
  body('temperature').isNumeric().withMessage('temperature must be numeric'),
  body('humidity').isNumeric().withMessage('humidity must be numeric'),
  body('latitude').isNumeric().withMessage('latitude must be numeric'),
  body('longitude').isNumeric().withMessage('longitude must be numeric'),
  body('door_open').isBoolean().withMessage('door_open must be boolean'),
  handleValidationErrors
];

export const validateAcknowledgeAlert = [
  param('id').isInt().withMessage('Alert ID must be an integer'),
  body('acknowledged_by').isString().notEmpty().withMessage('acknowledged_by is required'),
  handleValidationErrors
];
