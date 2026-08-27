from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from models.breach_classifier import predict_breach_risk
from models.trajectory_forecaster import forecast_trajectory
from utils.mkt_calculator import calculate_mkt
from utils.pdf_generator import generate_gdp_pdf

app = FastAPI(title="ChillGuard ML Service", version="1.0.0")

class ReadingItem(BaseModel):
    temperature: float
    humidity: Optional[float] = 50.0
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    door_open: Optional[int] = 0
    ambient_temp: Optional[float] = 29.5
    timestamp: Optional[str] = None

class PredictRequest(BaseModel):
    shipment_id: str
    readings: List[ReadingItem]
    setpoint_temp: float
    min_temp: float
    max_temp: float
    product_type: str

class PredictResponse(BaseModel):
    risk_score: int
    time_to_breach_minutes: Optional[int] = None
    predicted_temps: List[float]
    anomaly_detected: bool
    anomaly_reason: Optional[str] = None

class MKTRequest(BaseModel):
    readings: List[ReadingItem]
    activation_energy: Optional[float] = 83144.0

class MKTResponse(BaseModel):
    mkt_celsius: Optional[float]
    interpretation: str

class ReportRequest(BaseModel):
    shipment: dict
    readings: List[dict]
    alerts: List[dict]
    custody_log: List[dict]
    mkt_value: Optional[float] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": True}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        readings_dict = [r.model_dump() for r in req.readings]

        # Predict breach risk & score
        risk_result = predict_breach_risk(
            readings=readings_dict,
            setpoint_temp=req.setpoint_temp,
            min_temp=req.min_temp,
            max_temp=req.max_temp,
            product_type=req.product_type
        )

        # Forecast future trajectory
        temps = [r.temperature for r in req.readings]
        predicted_temps = forecast_trajectory(
            temps=temps,
            setpoint=req.setpoint_temp,
            ambient=readings_dict[-1].get('ambient_temp', 29.5) if readings_dict else 29.5,
            n_steps=8
        )

        return PredictResponse(
            risk_score=risk_result["risk_score"],
            time_to_breach_minutes=risk_result["time_to_breach_minutes"],
            predicted_temps=predicted_temps,
            anomaly_detected=risk_result["anomaly_detected"],
            anomaly_reason=risk_result["anomaly_reason"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mkt", response_model=MKTResponse)
def compute_mkt(req: MKTRequest):
    try:
        readings_dict = [r.model_dump() for r in req.readings]
        mkt_val = calculate_mkt(readings_dict, req.activation_energy)
        return MKTResponse(
            mkt_celsius=mkt_val,
            interpretation=f"Arrhenius MKT computed for {len(readings_dict)} readings (Ea={req.activation_energy} J/mol)"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
def generate_report(req: ReportRequest):
    try:
        pdf_bytes = generate_gdp_pdf(
            shipment=req.shipment,
            readings=req.readings,
            alerts=req.alerts,
            custody_log=req.custody_log,
            mkt_value=req.mkt_value
        )
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
