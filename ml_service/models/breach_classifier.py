import numpy as np

def predict_breach_risk(readings, setpoint_temp, min_temp, max_temp, product_type):
    """
    Evaluates ML features and predicts breach risk score (0-100) and time-to-breach.
    """
    if not readings:
        return {
            "risk_score": 0,
            "time_to_breach_minutes": None,
            "anomaly_detected": False,
            "anomaly_reason": None
        }

    latest = readings[-1]
    current_temp = float(latest.get('temperature', setpoint_temp))
    door_open = int(latest.get('door_open', 0))
    ambient_temp = float(latest.get('ambient_temp', 29.5))

    # Calculate 15m rate of change
    rate_15m = 0.0
    if len(readings) >= 3:
        prev_15m = float(readings[-3].get('temperature', current_temp))
        rate_15m = (current_temp - prev_15m) / 15.0

    # Calculate 30m rolling stats
    recent_temps = [float(r.get('temperature', current_temp)) for r in readings[-6:]]
    rolling_mean = float(np.mean(recent_temps)) if recent_temps else current_temp
    rolling_std = float(np.std(recent_temps)) if len(recent_temps) > 1 else 0.0

    dev_from_setpoint = abs(current_temp - setpoint_temp)

    # Base risk score assessment
    risk = 0.0

    # Check direct breach
    if current_temp > max_temp or current_temp < min_temp:
        risk = 95.0
        time_to_breach = 0
        return {
            "risk_score": 95,
            "time_to_breach_minutes": 0,
            "anomaly_detected": True,
            "anomaly_reason": f"Temperature {current_temp}°C out of safety bounds [{min_temp}°C - {max_temp}°C]"
        }

    # Proportional risk components
    dev_max = max_temp - setpoint_temp
    relative_dev = dev_from_setpoint / max(0.5, dev_max)
    risk += min(45.0, relative_dev * 40.0)

    # Rate of change penalty
    if rate_15m > 0 and current_temp > setpoint_temp:
        risk += rate_15m * 120.0
    elif rate_15m < 0 and current_temp < setpoint_temp:
        risk += abs(rate_15m) * 120.0

    # Door open penalty
    if door_open == 1:
        risk += 25.0

    # Product type sensitivity multiplier
    sensitivity = 1.2 if product_type == 'pharma' else (1.1 if product_type == 'seafood' else 1.0)
    risk *= sensitivity

    risk_score = int(min(99, max(0, round(risk))))

    # Time-to-breach calculation
    time_to_breach = None
    if risk_score >= 40:
        if rate_15m > 0 and current_temp < max_temp:
            rem = max_temp - current_temp
            time_to_breach = max(5, int(rem / max(0.01, rate_15m)))
        elif rate_15m < 0 and current_temp > min_temp:
            rem = current_temp - min_temp
            time_to_breach = max(5, int(rem / max(0.01, abs(rate_15m))))

    anomaly_detected = door_open == 1 or risk_score >= 70 or rolling_std > 1.2
    anomaly_reason = None
    if door_open == 1:
        anomaly_reason = "Cargo door enclosure opened"
    elif risk_score >= 70:
        anomaly_reason = "Pre-excursion rapid thermal rise pattern"
    elif rolling_std > 1.2:
        anomaly_reason = "High thermal volatility detected"

    return {
        "risk_score": risk_score,
        "time_to_breach_minutes": time_to_breach,
        "anomaly_detected": anomaly_detected,
        "anomaly_reason": anomaly_reason
    }
