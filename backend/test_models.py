import joblib
import pandas as pd
import json

print("Testing model loading...")
temp_model = joblib.load("backend/models/temperature_model.joblib")
anomaly_model = joblib.load("backend/models/anomaly_model.joblib")

print("Temperature model loaded:", type(temp_model))
print("Anomaly model loaded:", type(anomaly_model))

df = pd.read_csv("backend/data/synthetic_datacenter_telemetry.csv")
print(f"Loaded telemetry dataset with {len(df)} rows.")
print("Workload categories:", df["workload_type"].unique().tolist())
print("Cooling level categories:", df["cooling_level"].unique().tolist())

# Test inference with first row
sample = df.iloc[0]
temp_features = [
    "cpu_util_pct", "gpu_util_pct", "ram_util_pct", "active_servers",
    "workload_type", "ambient_temp_c", "it_power_kw", "cooling_level",
    "fan_speed_pct", "inlet_temp_c", "outlet_temp_c", "cooling_power_kw"
]
temp_input = pd.DataFrame([sample[temp_features].to_dict()], columns=temp_features)
pred_temp = float(temp_model.predict(temp_input)[0])
print(f"Sample 0 -> Actual rack_temp_c: {sample['rack_temp_c']:.3f}, Predicted: {pred_temp:.3f}")

anomaly_features = [
    "cpu_util_pct", "gpu_util_pct", "ram_util_pct", "it_power_kw",
    "ambient_temp_c", "inlet_temp_c", "outlet_temp_c", "rack_temp_c",
    "cooling_power_kw"
]
anomaly_payload = {
    "cpu_util_pct": sample["cpu_util_pct"],
    "gpu_util_pct": sample["gpu_util_pct"],
    "ram_util_pct": sample["ram_util_pct"],
    "it_power_kw": sample["it_power_kw"],
    "ambient_temp_c": sample["ambient_temp_c"],
    "inlet_temp_c": sample["inlet_temp_c"],
    "outlet_temp_c": sample["outlet_temp_c"],
    "rack_temp_c": pred_temp,
    "cooling_power_kw": sample["cooling_power_kw"]
}
anomaly_input = pd.DataFrame([anomaly_payload], columns=anomaly_features)
pred_anomaly = int(anomaly_model.predict(anomaly_input)[0])
print(f"Sample 0 -> Raw anomaly prediction: {pred_anomaly} (Anomaly flag: {pred_anomaly == -1})")

with open("backend/data/model_metrics.json") as f:
    metrics = json.load(f)
print("Metrics loaded successfully:", metrics)
