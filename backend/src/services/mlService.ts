import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export interface PredictResponse {
  risk_score: number;
  time_to_breach_minutes: number | null;
  predicted_temps: number[];
  anomaly_detected: boolean;
  anomaly_reason: string | null;
}

export async function getMLPrediction(payload: {
  shipment_id: string;
  readings: any[];
  setpoint_temp: number;
  min_temp: number;
  max_temp: number;
  product_type: string;
}): Promise<PredictResponse> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, payload, { timeout: 3000 });
    return response.data;
  } catch (err: any) {
    // Fallback TS heuristic calculation if ML service is unreachable
    console.warn('[ML Service Fallback] ML endpoint unreachable, applying heuristic algorithm:', err.message);

    const latest = payload.readings[payload.readings.length - 1];
    const currentTemp = latest ? latest.temperature : payload.setpoint_temp;
    const doorOpen = latest ? latest.door_open : 0;

    let risk_score = 10;
    let time_to_breach_minutes: number | null = null;
    const predicted_temps: number[] = [];

    // Calculate rate of change over recent readings
    let rateOfChange = 0;
    if (payload.readings.length >= 3) {
      const prev = payload.readings[payload.readings.length - 3];
      rateOfChange = (currentTemp - prev.temperature) / 2; // temp change per step
    }

    if (currentTemp > payload.max_temp || currentTemp < payload.min_temp) {
      risk_score = 95;
      time_to_breach_minutes = 0;
    } else {
      const dev = Math.abs(currentTemp - payload.setpoint_temp);
      risk_score = Math.min(90, Math.round(dev * 15 + (doorOpen ? 25 : 0) + Math.max(0, rateOfChange * 40)));
      if (risk_score > 70 && rateOfChange > 0) {
        const remainingTemp = payload.max_temp - currentTemp;
        time_to_breach_minutes = Math.max(5, Math.round((remainingTemp / Math.max(0.1, rateOfChange)) * 5));
      }
    }

    // Predict next 8 readings (40 mins into future)
    for (let i = 1; i <= 8; i++) {
      const nextT = currentTemp + rateOfChange * i * 0.8;
      // physics decay cap towards ambient (assume 30C)
      const capped = Math.min(30, Math.max(-25, nextT));
      predicted_temps.push(Math.round(capped * 100) / 100);
    }

    return {
      risk_score,
      time_to_breach_minutes,
      predicted_temps,
      anomaly_detected: doorOpen === 1 || risk_score >= 70,
      anomaly_reason: doorOpen === 1 ? 'Cargo door opened' : (risk_score >= 70 ? 'Rapid temperature rise detected' : null)
    };
  }
}

export async function getMKTCalculation(readings: { temperature: number; timestamp?: string }[], activationEnergy = 83144) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/mkt`, {
      readings,
      activation_energy: activationEnergy
    }, { timeout: 3000 });
    return response.data;
  } catch (err: any) {
    // Fallback TS MKT calculation (Arrhenius Equation)
    const R = 8.314;
    if (!readings || readings.length < 2) {
      return { mkt_celsius: null, interpretation: 'Insufficient readings for MKT calculation' };
    }
    const tempsKelvin = readings.map(r => r.temperature + 273.15);
    const sumExp = tempsKelvin.reduce((acc, T) => acc + Math.exp(-activationEnergy / (R * T)), 0);
    const mktKelvin = -activationEnergy / (R * Math.log(sumExp / readings.length));
    const mktCelsius = Math.round((mktKelvin - 273.15) * 100) / 100;

    return {
      mkt_celsius: mktCelsius,
      interpretation: 'Arrhenius weighted kinetic temperature (TS Fallback)'
    };
  }
}

export async function generatePDFReport(payload: {
  shipment: any;
  readings: any[];
  alerts: any[];
  custody_log: any[];
  mkt_value: number | null;
}): Promise<Buffer> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/generate-report`, payload, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    return Buffer.from(response.data);
  } catch (err: any) {
    throw new Error('Failed to generate PDF report from ML service: ' + err.message);
  }
}
