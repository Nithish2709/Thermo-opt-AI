"""FastAPI Backend Application for AI Data Center Energy Optimization & Cooling Recommendations.

Strictly integrates actual trained ML models according to ANTIGRAVITY_PROJECT_SPEC.md.
"""

import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path regardless of execution directory
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import io
import csv
from contextlib import asynccontextmanager
from typing import List, Optional
import numpy as np
from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    TelemetryInput,
    PredictionResponse,
    HealthResponse,
    MetadataResponse,
    ModelMetricsResponse,
    SampleRecordsResponse,
    HistoricalSummaryResponse,
    ReportExportRequest,
    BatchPredictRequest,
    BatchPredictResponse,
)
from app.inference import (
    model_manager,
    TEMPERATURE_FEATURES,
    ANOMALY_FEATURES,
    WORKLOAD_CATEGORIES,
    COOLING_CATEGORIES,
)
from app.recommendations import evaluate_telemetry, PROTOTYPE_DISCLAIMER


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML models and artifacts once
    status_dict = model_manager.load_artifacts()
    print("Backend startup artifacts status:", status_dict)
    yield
    # Shutdown logic if needed
    print("Backend shutting down.")


app = FastAPI(
    title="Data Center Energy Optimizer & Predictive Cooling API",
    description=(
        "Decision-support system utilizing trained machine learning models for rack temperature "
        "forecasting and anomaly detection in data centers. Prototype trained on synthetic telemetry."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    if allowed_origins_env.strip() == "*":
        allowed_origins = ["*"]
        allow_credentials = False
    else:
        allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
        allow_credentials = True
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def get_health():
    """Returns system status, model availability, and sample dataset presence without leaking server paths."""
    ready = model_manager.is_ready()
    records_count = len(model_manager.telemetry_df) if model_manager.telemetry_df is not None else 0

    return HealthResponse(
        status="healthy" if ready else "degraded",
        temperature_model_loaded=model_manager.temperature_model is not None,
        anomaly_model_loaded=model_manager.anomaly_model is not None,
        sample_data_available=model_manager.telemetry_df is not None,
        metrics_available=model_manager.metrics_data is not None,
        total_records=records_count,
        data_type="synthetic",
        message="System operating with loaded ML artifacts." if ready else "Models not loaded. Please inspect backend/models directory.",
    )


@app.get("/api/metadata", response_model=MetadataResponse)
def get_metadata():
    """Returns model input feature names, supported categories, thresholds, and caveats."""
    return MetadataResponse(
        temperature_features=TEMPERATURE_FEATURES,
        anomaly_features=ANOMALY_FEATURES,
        workload_categories=WORKLOAD_CATEGORIES,
        cooling_categories=COOLING_CATEGORIES,
        default_tariff_inr=8.0,
        prototype_thresholds={
            "low_threshold_c": 27.0,
            "medium_threshold_c": 31.0,
            "risk_mapping": {
                "< 27.0°C": "Low",
                "27.0°C - 30.9°C": "Medium",
                ">= 31.0°C": "High",
            },
        },
        caveats=[
            "Decision-support prototype only; not a closed-loop HVAC controller.",
            "Trained and evaluated exclusively on synthetic data (8,760 hourly simulated records).",
            "Electricity cost figures are illustrative estimates based on user-editable tariff rates.",
            "High-risk thermal conditions and anomalies must always be verified by certified on-site engineers.",
        ],
    )


@app.post("/api/predict", response_model=PredictionResponse)
def predict_telemetry(payload: TelemetryInput):
    """Predicts rack temperature and anomaly status using actual trained models.

    Computes rule-based cooling recommendation and estimated electricity cost.
    """
    if not model_manager.is_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not ready for inference. Verify model files are placed in backend/models.",
        )

    payload_dict = payload.model_dump()

    try:
        # 1. Run temperature regression model
        pred_temp = model_manager.predict_temperature(payload_dict)

        # 2. Run IsolationForest anomaly model using predicted rack temperature
        is_anomaly, raw_score = model_manager.predict_anomaly(payload_dict, pred_temp)

        # 3. Rule-based evaluation & cost calculation
        eval_result = evaluate_telemetry(
            predicted_temp_c=pred_temp,
            is_anomaly=is_anomaly,
            cooling_power_kw=payload.cooling_power_kw,
            tariff_inr_per_kwh=payload.tariff_inr_per_kwh or 8.0,
        )

        return PredictionResponse(
            predicted_rack_temp_c=pred_temp,
            thermal_risk=eval_result["thermal_risk"],
            recommended_cooling=eval_result["recommended_cooling"],
            is_anomaly=is_anomaly,
            anomaly_label="Anomaly" if is_anomaly else "Normal",
            raw_anomaly_score=raw_score,
            operator_message=eval_result["operator_message"],
            estimated_cooling_cost_inr_per_hour=eval_result["estimated_cooling_cost_inr_per_hour"],
            estimated_cooling_cost_inr_per_day=eval_result["estimated_cooling_cost_inr_per_day"],
            disclaimer=eval_result["disclaimer"],
            input_snapshot=payload_dict,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@app.post("/api/batch-predict", response_model=BatchPredictResponse)
def batch_predict_telemetry(request: BatchPredictRequest):
    """Runs batch inference on multiple telemetry rows. Returns per-row predictions and errors."""
    if not model_manager.is_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not ready for inference. Verify model files in backend/models.",
        )

    results = []
    errors = []

    for i, payload in enumerate(request.rows):
        try:
            payload_dict = payload.model_dump()
            pred_temp = model_manager.predict_temperature(payload_dict)
            is_anomaly, raw_score = model_manager.predict_anomaly(payload_dict, pred_temp)
            eval_result = evaluate_telemetry(
                predicted_temp_c=pred_temp,
                is_anomaly=is_anomaly,
                cooling_power_kw=payload.cooling_power_kw,
                tariff_inr_per_kwh=payload.tariff_inr_per_kwh or 8.0,
            )
            results.append(PredictionResponse(
                predicted_rack_temp_c=pred_temp,
                thermal_risk=eval_result["thermal_risk"],
                recommended_cooling=eval_result["recommended_cooling"],
                is_anomaly=is_anomaly,
                anomaly_label="Anomaly" if is_anomaly else "Normal",
                raw_anomaly_score=raw_score,
                operator_message=eval_result["operator_message"],
                estimated_cooling_cost_inr_per_hour=eval_result["estimated_cooling_cost_inr_per_hour"],
                estimated_cooling_cost_inr_per_day=eval_result["estimated_cooling_cost_inr_per_day"],
                disclaimer=eval_result["disclaimer"],
                input_snapshot=payload_dict,
            ))
        except Exception as e:
            results.append(None)
            errors.append({"row": i, "message": str(e)})

    # Filter None from results (only successful predictions serialized)
    clean_results = [r for r in results if r is not None]
    return BatchPredictResponse(results=clean_results, errors=errors)


@app.get("/api/sample-records", response_model=SampleRecordsResponse)
def get_sample_records(
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=500, description="Number of records to fetch (max 500)"),
    workload: Optional[str] = Query(None, description="Optional filter by workload"),
    risk: Optional[str] = Query(None, description="Optional filter by thermal_risk"),
    anomaly_only: Optional[bool] = Query(False, description="Filter for anomalies only"),
):
    """Returns paginated historical/sample telemetry records from the synthetic dataset."""
    if model_manager.telemetry_df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Synthetic telemetry dataset not available on server.",
        )

    df = model_manager.telemetry_df

    if workload and workload != "All":
        df = df[df["workload_type"] == workload]

    if risk and risk != "All":
        df = df[df["thermal_risk"] == risk]

    if anomaly_only:
        df = df[df["anomaly_label"] == 1]

    total_matched = len(df)
    sliced = df.iloc[offset : offset + limit]

    # Convert records to clean dictionaries with python-native types
    records = sliced.replace({np.nan: None}).to_dict(orient="records")

    return SampleRecordsResponse(
        total_records=total_matched,
        offset=offset,
        limit=limit,
        records=records,
    )


@app.get("/api/metrics", response_model=ModelMetricsResponse)
def get_metrics():
    """Returns saved holdout evaluation metrics from model training."""
    if model_manager.metrics_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics file not found.",
        )

    data = model_manager.metrics_data
    return ModelMetricsResponse(
        temperature_mae_c=round(float(data.get("temperature_mae_c", 0.0)), 4),
        temperature_rmse_c=round(float(data.get("temperature_rmse_c", 0.0)), 4),
        temperature_r2=round(float(data.get("temperature_r2", 0.0)), 4),
        test_records=int(data.get("test_records", 0)),
        data_type=str(data.get("data_type", "synthetic")),
        notes=[
            "Evaluated on chronological holdout test split of synthetic telemetry.",
            "High-risk thermal occurrences are relatively rare in the simulation data.",
            "Anomaly detector is an unsupervised IsolationForest calibrated to 1% nominal contamination.",
            "Classifier confusion matrices and classification reports were printed in Google Colab during training.",
        ],
    )


@app.get("/api/historical-summary", response_model=HistoricalSummaryResponse)
def get_historical_summary():
    """Returns aggregated KPIs and trend points for dashboard charts."""
    if model_manager.telemetry_df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Synthetic telemetry dataset not available.",
        )

    df = model_manager.telemetry_df
    total = len(df)

    risk_counts = df["thermal_risk"].value_counts().to_dict()
    workload_counts = df["workload_type"].value_counts().to_dict()
    cooling_counts = df["cooling_level"].value_counts().to_dict()
    anomaly_count = int(df["anomaly_label"].sum()) if "anomaly_label" in df.columns else 0

    avg_rack_temp = round(float(df["rack_temp_c"].mean()), 2)
    avg_cooling_power = round(float(df["cooling_power_kw"].mean()), 2)
    avg_it_power = round(float(df["it_power_kw"].mean()), 2)

    # Subsample 150 points spaced evenly across the year for smooth charting
    step = max(1, total // 150)
    trend_df = df.iloc[::step][
        ["timestamp", "rack_temp_c", "inlet_temp_c", "outlet_temp_c", "ambient_temp_c", "cooling_power_kw", "it_power_kw", "thermal_risk", "anomaly_label"]
    ]
    trend_samples = trend_df.replace({np.nan: None}).to_dict(orient="records")

    return HistoricalSummaryResponse(
        total_records=total,
        thermal_risk_counts=risk_counts,
        workload_counts=workload_counts,
        cooling_level_counts=cooling_counts,
        anomaly_count=anomaly_count,
        avg_rack_temp_c=avg_rack_temp,
        avg_cooling_power_kw=avg_cooling_power,
        avg_it_power_kw=avg_it_power,
        trend_samples=trend_samples,
    )


@app.post("/api/report")
def export_report_csv(request: ReportExportRequest):
    """Generates and downloads a clean CSV report containing model evaluation records and cooling recommendations."""
    if not request.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No records provided for CSV export.",
        )

    output = io.StringIO()
    # Collect all unique fieldnames
    first_item = request.items[0]
    fieldnames = list(first_item.keys())

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for row in request.items:
        # Clean nested dicts if any
        clean_row = {}
        for k, v in row.items():
            if isinstance(v, dict):
                clean_row[k] = str(v)
            else:
                clean_row[k] = v
        writer.writerow(clean_row)

    csv_data = output.getvalue()
    filename = "cooling_recommendations_report.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


if __name__ == "__main__":
    import uvicorn
    import sys
    from pathlib import Path

    backend_dir = str(Path(__file__).resolve().parent.parent)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, app_dir=backend_dir)

