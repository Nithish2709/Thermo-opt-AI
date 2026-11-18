"""Inference engine managing trained model loading, feature preparation, and prediction.

Follows exact feature definitions and ordering specified in ANTIGRAVITY_PROJECT_SPEC.md.
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
import joblib
import pandas as pd

TEMPERATURE_FEATURES: List[str] = [
    "cpu_util_pct",
    "gpu_util_pct",
    "ram_util_pct",
    "active_servers",
    "workload_type",
    "ambient_temp_c",
    "it_power_kw",
    "cooling_level",
    "fan_speed_pct",
    "inlet_temp_c",
    "outlet_temp_c",
    "cooling_power_kw",
]

ANOMALY_FEATURES: List[str] = [
    "cpu_util_pct",
    "gpu_util_pct",
    "ram_util_pct",
    "it_power_kw",
    "ambient_temp_c",
    "inlet_temp_c",
    "outlet_temp_c",
    "rack_temp_c",
    "cooling_power_kw",
]

WORKLOAD_CATEGORIES = ["GPU-intensive", "General", "CPU-intensive"]
COOLING_CATEGORIES = ["Low", "Medium", "High"]


class ModelManager:
    """Manages loaded models and dataset artifacts in memory."""

    def __init__(self, base_dir: Optional[Path] = None):
        if base_dir is None:
            # Default to backend directory
            self.base_dir = Path(__file__).resolve().parent.parent
        else:
            self.base_dir = base_dir

        self.models_dir = self.base_dir / "models"
        self.data_dir = self.base_dir / "data"

        self.temperature_model = None
        self.anomaly_model = None
        self.telemetry_df: Optional[pd.DataFrame] = None
        self.metrics_data: Optional[Dict[str, Any]] = None

        self.temp_model_path = self.models_dir / "temperature_model.joblib"
        self.anomaly_model_path = self.models_dir / "anomaly_model.joblib"
        self.telemetry_path = self.data_dir / "synthetic_datacenter_telemetry.csv"
        self.metrics_path = self.data_dir / "model_metrics.json"

    def load_artifacts(self) -> Dict[str, Any]:
        """Loads both models and metadata once at startup."""
        status = {
            "temperature_model_loaded": False,
            "anomaly_model_loaded": False,
            "sample_data_available": False,
            "metrics_available": False,
            "error_messages": [],
        }

        # 1. Load temperature model
        if self.temp_model_path.exists():
            try:
                self.temperature_model = joblib.load(self.temp_model_path)
                status["temperature_model_loaded"] = True
            except Exception as e:
                status["error_messages"].append(f"Failed to load temperature model: {str(e)}")
        else:
            status["error_messages"].append(
                f"Missing temperature model artifact at expected path: {self.temp_model_path}"
            )

        # 2. Load anomaly model
        if self.anomaly_model_path.exists():
            try:
                self.anomaly_model = joblib.load(self.anomaly_model_path)
                status["anomaly_model_loaded"] = True
            except Exception as e:
                status["error_messages"].append(f"Failed to load anomaly model: {str(e)}")
        else:
            status["error_messages"].append(
                f"Missing anomaly model artifact at expected path: {self.anomaly_model_path}"
            )

        # 3. Load sample telemetry data
        if self.telemetry_path.exists():
            try:
                self.telemetry_df = pd.read_csv(self.telemetry_path)
                status["sample_data_available"] = True
            except Exception as e:
                status["error_messages"].append(f"Failed to load telemetry CSV: {str(e)}")

        # 4. Load metrics
        if self.metrics_path.exists():
            try:
                with open(self.metrics_path, "r", encoding="utf-8") as f:
                    self.metrics_data = json.load(f)
                status["metrics_available"] = True
            except Exception as e:
                status["error_messages"].append(f"Failed to load model metrics: {str(e)}")

        return status

    def is_ready(self) -> bool:
        """Check if both mandatory models are loaded, attempting load if not yet done."""
        if self.temperature_model is None or self.anomaly_model is None:
            self.load_artifacts()
        return self.temperature_model is not None and self.anomaly_model is not None

    def predict_temperature(self, payload: Dict[str, Any]) -> float:
        """Run temperature pipeline prediction with exact feature names."""
        if self.temperature_model is None:
            raise RuntimeError(
                f"Temperature model not loaded. Please ensure '{self.temp_model_path}' exists."
            )

        input_df = pd.DataFrame([{k: payload[k] for k in TEMPERATURE_FEATURES}], columns=TEMPERATURE_FEATURES)
        pred = self.temperature_model.predict(input_df)[0]
        return round(float(pred), 2)

    def predict_anomaly(self, payload: Dict[str, Any], predicted_temp_c: float) -> Tuple[bool, int]:
        """Run IsolationForest anomaly detector.

        Uses predicted_rack_temp_c as the 'rack_temp_c' feature.
        Returns (is_anomaly, raw_score) where raw_score is -1 for anomaly, 1 for normal.
        """
        if self.anomaly_model is None:
            raise RuntimeError(
                f"Anomaly model not loaded. Please ensure '{self.anomaly_model_path}' exists."
            )

        anomaly_data = {
            "cpu_util_pct": payload["cpu_util_pct"],
            "gpu_util_pct": payload["gpu_util_pct"],
            "ram_util_pct": payload["ram_util_pct"],
            "it_power_kw": payload["it_power_kw"],
            "ambient_temp_c": payload["ambient_temp_c"],
            "inlet_temp_c": payload["inlet_temp_c"],
            "outlet_temp_c": payload["outlet_temp_c"],
            "rack_temp_c": predicted_temp_c,
            "cooling_power_kw": payload["cooling_power_kw"],
        }

        anomaly_df = pd.DataFrame([anomaly_data], columns=ANOMALY_FEATURES)
        raw_result = int(self.anomaly_model.predict(anomaly_df)[0])
        is_anomaly = raw_result == -1
        return is_anomaly, raw_result


# Global model manager singleton
model_manager = ModelManager()
