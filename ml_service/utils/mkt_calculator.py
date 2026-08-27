import numpy as np

R = 8.314  # J/mol/K
DEFAULT_EA = 83144  # J/mol (pharmaceutical standard)

def calculate_mkt(readings, activation_energy=DEFAULT_EA):
    """
    Calculates Mean Kinetic Temperature (MKT) in Celsius using the Arrhenius Equation.
    """
    n = len(readings)
    if n < 2:
        return None

    temps_kelvin = [r['temperature'] + 273.15 for r in readings]
    sum_exp = sum(np.exp(-activation_energy / (R * T)) for T in temps_kelvin)
    mkt_kelvin = -activation_energy / (R * np.log(sum_exp / n))
    mkt_celsius = mkt_kelvin - 273.15
    return round(float(mkt_celsius), 2)
