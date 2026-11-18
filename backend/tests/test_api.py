"""Unit tests for FastAPI backend application.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.recommendations import risk_from_temperature, recommended_cooling_from_temperature


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_recommendation_rules():
    assert risk_from_temperature(24.5) == "Low"
    assert risk_from_temperature(28.3) == "Medium"
    assert risk_from_temperature(32.1) == "High"

    assert recommended_cooling_from_temperature(24.5) == "Low"
    assert recommended_cooling_from_temperature(28.3) == "Medium"
    assert recommended_cooling_from_temperature(32.1) == "High"


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["temperature_model_loaded"] is True
    assert data["anomaly_model_loaded"] is True
    assert data["sample_data_available"] is True
    assert data["total_records"] > 0


def test_metadata_endpoint(client):
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "cpu_util_pct" in data["temperature_features"]
    assert "GPU-intensive" in data["workload_categories"]
    assert "Low" in data["cooling_categories"]
    assert data["default_tariff_inr"] == 8.0


def test_predict_endpoint_valid(client):
    payload = {
        "cpu_util_pct": 74.0,
        "gpu_util_pct": 65.0,
        "ram_util_pct": 62.0,
        "active_servers": 94,
        "workload_type": "GPU-intensive",
        "ambient_temp_c": 22.2,
        "it_power_kw": 38.1,
        "cooling_level": "Medium",
        "fan_speed_pct": 73.9,
        "inlet_temp_c": 19.0,
        "outlet_temp_c": 28.1,
        "cooling_power_kw": 6.69,
        "tariff_inr_per_kwh": 8.0,
    }

    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_rack_temp_c" in data
    assert isinstance(data["predicted_rack_temp_c"], float)
    assert data["thermal_risk"] in ["Low", "Medium", "High"]
    assert data["recommended_cooling"] in ["Low", "Medium", "High"]
    assert isinstance(data["is_anomaly"], bool)
    assert data["anomaly_label"] in ["Anomaly", "Normal"]
    assert data["estimated_cooling_cost_inr_per_hour"] > 0
    assert data["estimated_cooling_cost_inr_per_day"] == round(data["estimated_cooling_cost_inr_per_hour"] * 24, 2)
    assert "Prototype recommendation only" in data["disclaimer"]


def test_predict_endpoint_validation_error(client):
    # Negative CPU util
    payload = {
        "cpu_util_pct": -5.0,
        "gpu_util_pct": 65.0,
        "ram_util_pct": 62.0,
        "active_servers": 94,
        "workload_type": "GPU-intensive",
        "ambient_temp_c": 22.2,
        "it_power_kw": 38.1,
        "cooling_level": "Medium",
        "fan_speed_pct": 73.9,
        "inlet_temp_c": 19.0,
        "outlet_temp_c": 28.1,
        "cooling_power_kw": 6.69,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422


def test_predict_invalid_workload(client):
    # Unsupported category
    payload = {
        "cpu_util_pct": 50.0,
        "gpu_util_pct": 50.0,
        "ram_util_pct": 50.0,
        "active_servers": 50,
        "workload_type": "Quantum-Computing",
        "ambient_temp_c": 22.0,
        "it_power_kw": 30.0,
        "cooling_level": "Medium",
        "fan_speed_pct": 60.0,
        "inlet_temp_c": 19.0,
        "outlet_temp_c": 25.0,
        "cooling_power_kw": 5.0,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422


def test_sample_records_endpoint(client):
    response = client.get("/api/sample-records?offset=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == 10
    assert len(data["records"]) == 10
    assert "cpu_util_pct" in data["records"][0]


def test_metrics_endpoint(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "temperature_mae_c" in data
    assert data["test_records"] == 1752
    assert data["data_type"] == "synthetic"


def test_historical_summary(client):
    response = client.get("/api/historical-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] > 0
    assert "Low" in data["thermal_risk_counts"]
    assert len(data["trend_samples"]) > 0


def test_report_export(client):
    sample_data = {
        "items": [
            {
                "timestamp": "2025-01-01 00:00:00",
                "predicted_temp": 23.5,
                "cooling": "Low",
                "risk": "Low",
            }
        ]
    }
    response = client.post("/api/report", json=sample_data)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "timestamp,predicted_temp,cooling,risk" in response.text
