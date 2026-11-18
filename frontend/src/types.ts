export type WorkloadType = "GPU-intensive" | "General" | "CPU-intensive";
export type CoolingLevel = "Low" | "Medium" | "High";
export type ThermalRisk = "Low" | "Medium" | "High";

export interface TelemetryInput {
  cpu_util_pct: number;
  gpu_util_pct: number;
  ram_util_pct: number;
  active_servers: number;
  workload_type: WorkloadType;
  ambient_temp_c: number;
  it_power_kw: number;
  cooling_level: CoolingLevel;
  fan_speed_pct: number;
  inlet_temp_c: number;
  outlet_temp_c: number;
  cooling_power_kw: number;
  tariff_inr_per_kwh?: number;
}

export interface PredictionResult {
  predicted_rack_temp_c: number;
  thermal_risk: ThermalRisk;
  recommended_cooling: CoolingLevel;
  is_anomaly: boolean;
  anomaly_label: "Anomaly" | "Normal";
  raw_anomaly_score?: number;
  operator_message: string;
  estimated_cooling_cost_inr_per_hour: number;
  estimated_cooling_cost_inr_per_day: number;
  disclaimer: string;
  input_snapshot?: Record<string, any>;
  timestamp?: string;
}

export interface HealthStatus {
  status: "healthy" | "degraded";
  temperature_model_loaded: boolean;
  anomaly_model_loaded: boolean;
  sample_data_available: boolean;
  metrics_available: boolean;
  total_records: number;
  data_type: string;
  message: string;
}

export interface MetadataInfo {
  temperature_features: string[];
  anomaly_features: string[];
  workload_categories: string[];
  cooling_categories: string[];
  default_tariff_inr: number;
  prototype_thresholds: {
    low_threshold_c: number;
    medium_threshold_c: number;
    risk_mapping: Record<string, string>;
  };
  caveats: string[];
}

export interface ModelMetrics {
  temperature_mae_c: number;
  temperature_rmse_c: number;
  temperature_r2: number;
  test_records: number;
  data_type: string;
  notes: string[];
}

export interface SampleRecord {
  timestamp?: string;
  cpu_util_pct: number;
  gpu_util_pct: number;
  ram_util_pct: number;
  active_servers: number;
  workload_type: string;
  ambient_temp_c: number;
  it_power_kw: number;
  heat_load_kw?: number;
  cooling_level: string;
  fan_speed_pct: number;
  inlet_temp_c: number;
  outlet_temp_c: number;
  rack_temp_c: number;
  cooling_power_kw: number;
  thermal_risk: string;
  anomaly_label: number;
}

export interface HistoricalSummary {
  total_records: number;
  thermal_risk_counts: Record<string, number>;
  workload_counts: Record<string, number>;
  cooling_level_counts: Record<string, number>;
  anomaly_count: number;
  avg_rack_temp_c: number;
  avg_cooling_power_kw: number;
  avg_it_power_kw: number;
  trend_samples: Array<{
    timestamp: string;
    rack_temp_c: number;
    inlet_temp_c: number;
    outlet_temp_c: number;
    ambient_temp_c: number;
    cooling_power_kw: number;
    it_power_kw: number;
    thermal_risk: string;
    anomaly_label: number;
  }>;
}

export interface OperatorDecision {
  id: string;
  timestamp: string;
  predicted_temp: number;
  risk: string;
  recommended_cooling: string;
  decision: "Accepted" | "Modified" | "Rejected";
  target_cooling?: string;
  notes?: string;
  cost_per_hour: number;
  is_anomaly: boolean;
}
