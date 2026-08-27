import numpy as np

def forecast_trajectory(temps, setpoint, ambient=29.5, n_steps=8):
    """
    Polynomial extrapolation + physics thermal decay trajectory forecaster.
    Predicts next n_steps readings (40 mins forward).
    """
    if not temps:
        return [setpoint] * n_steps

    if len(temps) < 3:
        return [temps[-1]] * n_steps

    last_temps = temps[-20:]
    x = np.arange(len(last_temps))

    # Fit quadratic polynomial
    deg = 2 if len(last_temps) >= 3 else 1
    coeffs = np.polyfit(x, last_temps, deg=deg)

    future_x = np.arange(len(last_temps), len(last_temps) + n_steps)
    predicted_poly = np.polyval(coeffs, future_x)

    output = []
    last_val = last_temps[-1]

    for p in predicted_poly:
        # Thermal decay toward ambient
        decay_val = last_val + 0.08 * (ambient - last_val)
        val = 0.75 * p + 0.25 * decay_val
        val = max(-35.0, min(50.0, val))
        output.append(round(float(val), 2))
        last_val = val

    return output
