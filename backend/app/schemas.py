import math
from typing import Literal, Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class TelemetryInput(BaseModel):
    cpu_util_pct: float = Field(..., ge=0.0, le=100.0, description="CPU utilization percentage (0-100%)")
    gpu_util_pct: float = Field(..., ge=0.0, le=100.0, description="GPU utilization percentage (0-100%)")
    ram_util_pct: float = Field(..., ge=0.0, le=100.0, description="RAM utilization percentage (0-100%)")
    active_servers: int = Field(..., ge=1, le=10000, description="Number of active servers")
    workload_type: Literal["GPU-intensive", "General", "CPU-intensive"] = Field(
        ..., description="Workload type derived from utilization profile"
    )
    ambient_temp_c: float = Field(..., ge=-10.0, le=60.0, description="Ambient external temperature in °C")
    it_power_kw: float = Field(..., gt=0.0, le=1000.0, description="IT electrical power in kW")
    cooling_level: Literal["Low", "Medium", "High"] = Field(..., description="Simulated cooling control setting")
    fan_speed_pct: float = Field(..., ge=0.0, le=100.0, description="Fan speed percentage (0-100%)")
    inlet_temp_c: float = Field(..., ge=0.0, le=60.0, description="Inlet air temperature in °C")
    outlet_temp_c: float = Field(..., ge=5.0, le=80.0, description="Outlet air temperature in °C")
    cooling_power_kw: float = Field(..., gt=0.0, le=1000.0, description="Cooling electrical power in kW")
    tariff_inr_per_kwh: Optional[float] = Field(
        default=8.0, ge=0.0, le=500.0, description="Tariff rate in INR per kWh (default: ₹8.0)"
    )

    @field_validator(
        "cpu_util_pct",
        "gpu_util_pct",
        "ram_util_pct",
        "ambient_temp_c",
        "it_power_kw",
        "fan_speed_pct",
        "inlet_temp_c",
        "outlet_temp_c",
        "cooling_power_kw",
        "tariff_inr_per_kwh",
        mode="after",
    )
    @classmethod
    def validate_finite(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (math.isnan(v) or math.isinf(v)):
            raise ValueError("Numeric values must be finite and cannot be NaN or Infinity.")
        return v


class PredictionResponse(BaseModel):
    predicted_rack_temp_c: float = Field(..., description="Predicted rack temperature in °C from RandomForest model")
    thermal_risk: Literal["Low", "Medium", "High"] = Field(..., description="Thermal risk category (<27 Low, 27-31 Med, >=31 High)")
    recommended_cooling: Literal["Low", "Medium", "High"] = Field(..., description="Rule-based recommended cooling level")
    is_anomaly: bool = Field(..., description="True if IsolationForest flags anomalous pattern (prediction == -1)")
    anomaly_label: Literal["Anomaly", "Normal"] = Field(..., description="Anomaly classification label")
    raw_anomaly_score: Optional[int] = Field(None, description="Raw IsolationForest prediction (1=normal, -1=anomaly)")
    operator_message: str = Field(..., description="Actionable explanation and review message for data center operator")
    estimated_cooling_cost_inr_per_hour: float = Field(..., description="Estimated hourly cooling electrical cost in INR")
    estimated_cooling_cost_inr_per_day: float = Field(..., description="Estimated 24h cooling electrical cost in INR")
    disclaimer: str = Field(..., description="Safety and prototype disclaimer")
    input_snapshot: Optional[Dict[str, Any]] = Field(None, description="Snapshot of the evaluated telemetry input")


class HealthResponse(BaseModel):
    status: Literal["healthy", "degraded"]
    temperature_model_loaded: bool
    anomaly_model_loaded: bool
    sample_data_available: bool
    metrics_available: bool
    total_records: int
    data_type: str = "synthetic"
    message: str


class MetadataResponse(BaseModel):
    temperature_features: List[str]
    anomaly_features: List[str]
    workload_categories: List[str]
    cooling_categories: List[str]
    default_tariff_inr: float
    prototype_thresholds: Dict[str, Any]
    caveats: List[str]


class ModelMetricsResponse(BaseModel):
    temperature_mae_c: float
    temperature_rmse_c: float
    temperature_r2: float
    test_records: int
    data_type: str
    notes: List[str]


class SampleRecord(BaseModel):
    timestamp: Optional[str] = None
    cpu_util_pct: float
    gpu_util_pct: float
    ram_util_pct: float
    active_servers: int
    workload_type: str
    ambient_temp_c: float
    it_power_kw: float
    heat_load_kw: Optional[float] = None
    cooling_level: str
    fan_speed_pct: float
    inlet_temp_c: float
    outlet_temp_c: float
    rack_temp_c: float
    cooling_power_kw: float
    thermal_risk: str
    anomaly_label: int


class SampleRecordsResponse(BaseModel):
    total_records: int
    offset: int
    limit: int
    records: List[Dict[str, Any]]


class HistoricalSummaryResponse(BaseModel):
    total_records: int
    thermal_risk_counts: Dict[str, int]
    workload_counts: Dict[str, int]
    cooling_level_counts: Dict[str, int]
    anomaly_count: int
    avg_rack_temp_c: float
    avg_cooling_power_kw: float
    avg_it_power_kw: float
    trend_samples: List[Dict[str, Any]]


class ReportExportRequest(BaseModel):
    items: List[Dict[str, Any]] = Field(..., min_length=1, max_length=1000)
    title: Optional[str] = "Cooling Recommendation & Anomaly Export Report"


class BatchPredictRequest(BaseModel):
    rows: List[TelemetryInput] = Field(..., min_length=1, max_length=500, description="List of telemetry rows for batch inference")


class BatchPredictError(BaseModel):
    row: int
    message: str


class BatchPredictResponse(BaseModel):
    results: List[PredictionResponse]
    errors: List[BatchPredictError] = []
