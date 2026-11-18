"""Recommendation rules, thermal risk classification, and electricity cost calculations.

Matches specifications defined in ANTIGRAVITY_PROJECT_SPEC.md.
"""

from typing import Tuple, Dict, Any

PROTOTYPE_DISCLAIMER = (
    "Prototype recommendation only. Thresholds are illustrative and must be validated by "
    "qualified data-center engineers before operational use. Trained and tested on synthetic data; "
    "does not claim verified real-world energy savings or autonomous HVAC control."
)


def risk_from_temperature(temp_c: float) -> str:
    """Classify thermal risk based on prototype thresholds matching the synthetic dataset."""
    if temp_c < 27.0:
        return "Low"
    elif temp_c < 31.0:
        return "Medium"
    return "High"


def recommended_cooling_from_temperature(temp_c: float) -> str:
    """Determine prototype recommended cooling level based on predicted rack temperature."""
    if temp_c < 27.0:
        return "Low"
    elif temp_c < 31.0:
        return "Medium"
    return "High"


def generate_operator_message(temp_c: float, risk: str, is_anomaly: bool) -> str:
    """Generate clear, actionable explanation for data center operators."""
    if risk == "Low":
        msg = "Predicted temperature is below the prototype's simulated risk thresholds."
    elif risk == "Medium":
        msg = "Predicted temperature is elevated; review cooling and telemetry."
    else:
        msg = "Predicted temperature exceeds the prototype's high-risk threshold; prompt operator review is recommended."

    if is_anomaly:
        msg += " Alert: Unusual telemetry combination flagged by anomaly model. Inspect subsystem metrics for unexpected variance."
    else:
        msg += " Telemetry profile conforms to expected operational patterns."

    return msg


def calculate_cooling_costs(
    cooling_power_kw: float, tariff_inr_per_kwh: float = 8.0
) -> Tuple[float, float]:
    """Calculate estimated hourly and 24-hour electricity cooling cost in INR.

    These are assumption-based estimates using user-specified tariff and simulated cooling power.
    """
    hourly_cost = round(cooling_power_kw * tariff_inr_per_kwh, 2)
    daily_cost = round(hourly_cost * 24.0, 2)
    return hourly_cost, daily_cost


def evaluate_telemetry(
    predicted_temp_c: float,
    is_anomaly: bool,
    cooling_power_kw: float,
    tariff_inr_per_kwh: float = 8.0,
) -> Dict[str, Any]:
    """Combine thermal risk, cooling recommendation, operator alert, and cost calculation."""
    risk = risk_from_temperature(predicted_temp_c)
    rec_cooling = recommended_cooling_from_temperature(predicted_temp_c)
    operator_msg = generate_operator_message(predicted_temp_c, risk, is_anomaly)
    hourly_cost, daily_cost = calculate_cooling_costs(cooling_power_kw, tariff_inr_per_kwh)

    return {
        "thermal_risk": risk,
        "recommended_cooling": rec_cooling,
        "operator_message": operator_msg,
        "estimated_cooling_cost_inr_per_hour": hourly_cost,
        "estimated_cooling_cost_inr_per_day": daily_cost,
        "disclaimer": PROTOTYPE_DISCLAIMER,
    }
