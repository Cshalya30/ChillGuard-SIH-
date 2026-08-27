import time
import math
import random
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:5000/api/v1/readings"

SHIPMENTS_CONFIG = [
    {
        "id": "SH-2041",
        "product_name": "Insulin (Biocon)",
        "product_type": "pharma",
        "origin": "Bengaluru",
        "destination": "Mysuru",
        "setpoint_temp": 5.0,
        "min_temp": 2.0,
        "max_temp": 8.0,
        "operator_name": "ColdEx Logistics",
        "route": [(12.9716, 77.5946), (12.7000, 77.3000), (12.3000, 76.6000)],
        "failure_event": {"type": "refrigeration_fault", "at_reading": 12}
    },
    {
        "id": "SH-2042",
        "product_name": "Alphonso Mangoes",
        "product_type": "food",
        "origin": "Ramanagara",
        "destination": "Chennai",
        "setpoint_temp": 10.0,
        "min_temp": 8.0,
        "max_temp": 14.0,
        "operator_name": "Snowman Logistics",
        "route": [(12.7200, 77.2800), (13.1000, 78.2000), (13.0800, 80.2700)],
        "failure_event": {"type": "door_open", "at_reading": 10}
    },
    {
        "id": "SH-2043",
        "product_name": "Hepatitis B Vaccine",
        "product_type": "pharma",
        "origin": "Bengaluru",
        "destination": "Hubballi",
        "setpoint_temp": 5.0,
        "min_temp": 2.0,
        "max_temp": 8.0,
        "operator_name": "Blue Dart ColdChain",
        "route": [(12.9716, 77.5946), (14.4500, 75.9200), (15.3600, 75.1200)],
        "failure_event": None
    },
    {
        "id": "SH-2044",
        "product_name": "Tilapia (Export)",
        "product_type": "seafood",
        "origin": "Mangaluru",
        "destination": "Bengaluru",
        "setpoint_temp": 0.0,
        "min_temp": -2.0,
        "max_temp": 4.0,
        "operator_name": "Gati KWE Pharma",
        "route": [(12.9141, 74.8560), (12.8000, 75.8000), (12.9700, 77.5900)],
        "failure_event": {"type": "slow_rise", "at_reading": 15}
    },
    {
        "id": "SH-2045",
        "product_name": "Blood samples",
        "product_type": "pharma",
        "origin": "Bengaluru",
        "destination": "Kolar",
        "setpoint_temp": 4.0,
        "min_temp": 2.0,
        "max_temp": 6.0,
        "operator_name": "ColdEx Logistics",
        "route": [(12.9716, 77.5946), (13.1000, 77.8000), (13.1300, 78.1300)],
        "failure_event": {"type": "offline_sensor", "at_reading": 20}
    },
    {
        "id": "SH-2046",
        "product_name": "mRNA Vaccine",
        "product_type": "pharma",
        "origin": "Bengaluru",
        "destination": "Delhi (air)",
        "setpoint_temp": -20.0,
        "min_temp": -25.0,
        "max_temp": -15.0,
        "operator_name": "Blue Dart ColdChain",
        "route": [(12.9716, 77.5946), (20.0000, 77.0000), (28.6100, 77.2000)],
        "failure_event": {"type": "rapid_breach", "at_reading": 8}
    },
    {
        "id": "SH-2047",
        "product_name": "Dairy (Nandini)",
        "product_type": "dairy",
        "origin": "Tumkur",
        "destination": "Bengaluru",
        "setpoint_temp": 4.0,
        "min_temp": 2.0,
        "max_temp": 6.0,
        "operator_name": "Snowman Logistics",
        "route": [(13.3400, 77.1000), (13.1000, 77.3000), (12.9700, 77.5900)],
        "failure_event": None
    },
    {
        "id": "SH-2048",
        "product_name": "Chemotherapy drugs",
        "product_type": "pharma",
        "origin": "Mysuru",
        "destination": "Bengaluru",
        "setpoint_temp": 4.0,
        "min_temp": 2.0,
        "max_temp": 8.0,
        "operator_name": "ColdEx Logistics",
        "route": [(12.3000, 76.6400), (12.6000, 77.1000), (12.9700, 77.5900)],
        "failure_event": {"type": "slow_degradation", "at_reading": 10}
    }
]


class ShipmentSimulator:
    def __init__(self, config):
        self.config = config
        self.reading_count = 0
        self.current_temp = config["setpoint_temp"] + random.uniform(-0.3, 0.3)
        self.route = config["route"]
        self.pos_index = 0
        self.progress = 0.0
        self.tau = 3600  # Normal thermal time constant (seconds)
        self.door_open = False

    def get_ambient_temp(self):
        hour = datetime.now().hour
        base = 28.0  # Karnataka average
        variation = 6.0 * math.sin(math.pi * (hour - 6) / 12.0)
        return round(base + variation, 1)

    def next_reading(self):
        self.reading_count += 1
        fe = self.config.get("failure_event")

        if fe and fe["at_reading"] == self.reading_count:
            event_type = fe["type"]
            if event_type == "refrigeration_fault":
                self.tau = 300  # rapid temperature rise
            elif event_type == "door_open":
                self.door_open = True
            elif event_type == "rapid_breach":
                self.tau = 180
            elif event_type == "slow_degradation":
                self.tau = 900

        # Reset door open after 3 readings if open
        if self.door_open and fe and fe.get("at_reading") and self.reading_count > fe["at_reading"] + 3:
            self.door_open = False

        ambient = self.get_ambient_temp()
        dt = 30  # seconds per reading interval
        dT = (ambient - self.current_temp) / self.tau * dt
        noise = random.gauss(0, 0.04)
        self.current_temp += dT + noise

        # Calculate position along route polyline
        self.progress += 0.03
        if self.progress > 1.0:
            self.progress = 0.0

        num_segments = len(self.route) - 1
        seg_idx = int(self.progress * num_segments)
        seg_idx = min(seg_idx, num_segments - 1)
        sub_p = (self.progress * num_segments) - seg_idx

        start_lat, start_lng = self.route[seg_idx]
        end_lat, end_lng = self.route[seg_idx + 1]

        lat = start_lat + (end_lat - start_lat) * sub_p + random.uniform(-0.001, 0.001)
        lng = start_lng + (end_lng - start_lng) * sub_p + random.uniform(-0.001, 0.001)

        return {
            "shipment_id": self.config["id"],
            "temperature": round(self.current_temp, 2),
            "humidity": round(random.uniform(45, 75), 1),
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "door_open": self.door_open,
            "ambient_temp": ambient
        }


def main():
    simulators = [ShipmentSimulator(cfg) for cfg in SHIPMENTS_CONFIG]
    print(f"[Telemetry Generator] Starting simulation for {len(simulators)} shipments...")
    print(f"[Telemetry Generator] Target Backend: {BACKEND_URL}")

    while True:
        for sim in simulators:
            # Skip completed shipment SH-2047 from telemetry updates
            if sim.config["id"] == "SH-2047":
                continue

            reading = sim.next_reading()
            try:
                res = requests.post(BACKEND_URL, json=reading, timeout=3)
                if res.status_code == 201:
                    data = res.json().get("data", {})
                    print(f"[{reading['shipment_id']}] Reading #{sim.reading_count}: Temp={reading['temperature']}°C, Risk={data.get('risk_score')}")
                else:
                    print(f"[{reading['shipment_id']}] Error: HTTP {res.status_code}")
            except Exception as e:
                print(f"[{reading['shipment_id']}] Failed to send reading: {e}")

        time.sleep(15)


if __name__ == "__main__":
    main()
