import type {
  TelemetryInput,
  PredictionResult,
  HealthStatus,
  MetadataInfo,
  ModelMetrics,
  HistoricalSummary,
  SampleRecord,
} from "./types";

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_BASE = RAW_API_BASE
  ? (RAW_API_BASE.endsWith("/api") ? RAW_API_BASE : `${RAW_API_BASE.replace(/\/$/, "")}/api`)
  : "/api";

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMetadata(): Promise<MetadataInfo> {
  const res = await fetch(`${API_BASE}/metadata`);
  if (!res.ok) {
    throw new Error(`Failed to load metadata: ${res.statusText}`);
  }
  return res.json();
}

export async function predictTelemetry(input: TelemetryInput): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e: any) => `${e.loc?.join(".") || ""}: ${e.msg}`).join("; ");
        } else {
          errorDetail = String(errJson.detail);
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail || `Inference error (${res.status})`);
  }

  const data: PredictionResult = await res.json();
  data.timestamp = new Date().toISOString();
  return data;
}

export async function fetchSampleRecords(
  offset: number = 0,
  limit: number = 50,
  workload?: string,
  risk?: string,
  anomalyOnly?: boolean
): Promise<{ total_records: number; records: SampleRecord[] }> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  if (workload && workload !== "All") params.append("workload", workload);
  if (risk && risk !== "All") params.append("risk", risk);
  if (anomalyOnly) params.append("anomaly_only", "true");

  const res = await fetch(`${API_BASE}/sample-records?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch records: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) {
    throw new Error(`Failed to load metrics: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchHistoricalSummary(): Promise<HistoricalSummary> {
  const res = await fetch(`${API_BASE}/historical-summary`);
  if (!res.ok) {
    throw new Error(`Failed to load summary: ${res.statusText}`);
  }
  return res.json();
}

export async function batchPredictTelemetry(
  rows: TelemetryInput[]
): Promise<{ results: PredictionResult[]; errors: { row: number; message: string }[] }> {
  const res = await fetch(`${API_BASE}/batch-predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = String(errJson.detail);
    } catch {}
    throw new Error(errorDetail || `Batch inference error (${res.status})`);
  }
  return res.json();
}

export async function exportReportCsv(items: any[], filename: string = "datacenter_report.csv") {
  const res = await fetch(`${API_BASE}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    throw new Error(`Export failed: ${res.statusText}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
