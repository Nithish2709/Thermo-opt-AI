import React, { useState, useRef } from "react";
import {
  FileUp,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Table2,
  Thermometer,
  Zap,
  XCircle,
  Info,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatusBadge } from "../components/common/StatusBadge";
import { batchPredictTelemetry, exportReportCsv } from "../api";
import type { TelemetryInput, PredictionResult } from "../types";

interface RowResult {
  row: number;
  input: TelemetryInput;
  result?: PredictionResult;
  error?: string;
}

const REQUIRED_COLUMNS = [
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
];

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] ?? "";
    });
    return obj;
  });
  return { headers, rows };
}

function rowToTelemetry(row: Record<string, string>, rowIndex: number): TelemetryInput {
  const missing = REQUIRED_COLUMNS.filter((c) => !(c in row) || row[c] === "");
  if (missing.length > 0)
    throw new Error(`Row ${rowIndex + 1}: Missing required columns: ${missing.join(", ")}`);
  return {
    cpu_util_pct: parseFloat(row.cpu_util_pct),
    gpu_util_pct: parseFloat(row.gpu_util_pct),
    ram_util_pct: parseFloat(row.ram_util_pct),
    active_servers: parseInt(row.active_servers, 10),
    workload_type: row.workload_type as any,
    ambient_temp_c: parseFloat(row.ambient_temp_c),
    it_power_kw: parseFloat(row.it_power_kw),
    cooling_level: row.cooling_level as any,
    fan_speed_pct: parseFloat(row.fan_speed_pct),
    inlet_temp_c: parseFloat(row.inlet_temp_c),
    outlet_temp_c: parseFloat(row.outlet_temp_c),
    cooling_power_kw: parseFloat(row.cooling_power_kw),
    tariff_inr_per_kwh: row.tariff_inr_per_kwh ? parseFloat(row.tariff_inr_per_kwh) : 8.0,
  };
}

export const CsvUploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<TelemetryInput[]>([]);
  const [_rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RowResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setParseError(null);
    setResults([]);
    setApiError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const { headers, rows } = parseCsv(text);
        setRawHeaders(headers);
        const parsed = rows.map((r, i) => rowToTelemetry(r, i));
        setParsedRows(parsed);
      } catch (err: any) {
        setParseError(err.message || "Failed to parse CSV file");
        setParsedRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
    handleFileChange({ target: { files: dt.files } } as any);
  };

  const handleSubmit = async () => {
    if (parsedRows.length === 0) return;
    setIsRunning(true);
    setApiError(null);
    setResults([]);
    setProgress({ done: 0, total: parsedRows.length });

    try {
      const { results: apiResults, errors } = await batchPredictTelemetry(parsedRows);
      const combined: RowResult[] = parsedRows.map((input, i) => {
        const err = errors.find((e) => e.row === i);
        return {
          row: i + 1,
          input,
          result: apiResults[i],
          error: err?.message,
        };
      });
      setResults(combined);
      setProgress({ done: parsedRows.length, total: parsedRows.length });
    } catch (err: any) {
      setApiError(err.message || "Batch prediction failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadResults = async () => {
    const exportItems = results.map((r) => ({
      row: r.row,
      cpu_util_pct: r.input.cpu_util_pct,
      gpu_util_pct: r.input.gpu_util_pct,
      ram_util_pct: r.input.ram_util_pct,
      active_servers: r.input.active_servers,
      workload_type: r.input.workload_type,
      it_power_kw: r.input.it_power_kw,
      cooling_level: r.input.cooling_level,
      predicted_rack_temp_c: r.result?.predicted_rack_temp_c ?? "",
      thermal_risk: r.result?.thermal_risk ?? "",
      recommended_cooling: r.result?.recommended_cooling ?? "",
      is_anomaly: r.result?.is_anomaly ?? "",
      anomaly_label: r.result?.anomaly_label ?? "",
      estimated_cooling_cost_inr_per_hour: r.result?.estimated_cooling_cost_inr_per_hour ?? "",
      estimated_cooling_cost_inr_per_day: r.result?.estimated_cooling_cost_inr_per_day ?? "",
      error: r.error ?? "",
    }));
    await exportReportCsv(exportItems, "thermo_opt_batch_predictions.csv");
  };

  const successCount = results.filter((r) => r.result).length;
  const errorCount = results.filter((r) => r.error).length;

  return (
    <DashboardLayout breadcrumbItems={[{ label: "CSV Upload & Batch Inference" }]}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>CSV Upload & Batch Prediction</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ingest bulk telemetry CSV datasets, validate schema against 12 model features, and execute ML batch inference.
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-2xl text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Prototype Advisory: </strong>
          Predictions are generated by models trained on synthetic data. Output values are decision-support insights and must not be used to autonomously command real-world chillers.
        </div>
      </div>

      {/* Expected Columns Checklist Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Required CSV Schema (12 Features)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {REQUIRED_COLUMNS.map((col) => (
            <span
              key={col}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-medium"
            >
              {col}
            </span>
          ))}
          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs rounded-lg border border-slate-200 dark:border-slate-700/60 font-mono">
            tariff_inr_per_kwh (optional)
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
          Valid <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-200 font-mono">workload_type</code>: General, GPU-intensive, CPU-intensive &nbsp;|&nbsp;
          Valid <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-200 font-mono">cooling_level</code>: Low, Medium, High
        </p>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors p-8 sm:p-10 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-4 text-center cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {fileName ? `${fileName} (${fileSize})` : "Drop telemetry CSV file here, or click to browse"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard UTF-8 comma-separated file format (.csv)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {parsedRows.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{parsedRows.length} valid telemetry rows parsed & verified</span>
          </div>
        )}

        {parseError && (
          <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs px-4 py-2 rounded-xl text-left max-w-lg">
            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}
      </div>

      {/* 5-Row Preview Table & Execute Button */}
      {parsedRows.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Table2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Dataset Preview (Showing 5 of {parsedRows.length} rows)</span>
            </h3>
            <span className="text-xs text-slate-500">Ready for batch scoring</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">CPU%</th>
                  <th className="py-2.5 px-3">GPU%</th>
                  <th className="py-2.5 px-3">RAM%</th>
                  <th className="py-2.5 px-3">Servers</th>
                  <th className="py-2.5 px-3">Workload</th>
                  <th className="py-2.5 px-3">IT Power</th>
                  <th className="py-2.5 px-3">Cooling Lvl</th>
                  <th className="py-2.5 px-3">Fan%</th>
                  <th className="py-2.5 px-3">Inlet °C</th>
                  <th className="py-2.5 px-3">Outlet °C</th>
                  <th className="py-2.5 px-3">Cooling kW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {parsedRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-400 font-mono">{i + 1}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.cpu_util_pct.toFixed(1)}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.gpu_util_pct.toFixed(1)}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.ram_util_pct.toFixed(1)}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.active_servers}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{row.workload_type}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.it_power_kw.toFixed(1)} kW</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.cooling_level}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.fan_speed_pct.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-blue-600 dark:text-blue-400">{row.inlet_temp_c.toFixed(1)}°C</td>
                    <td className="py-2 px-3 text-amber-600 dark:text-amber-400">{row.outlet_temp_c.toFixed(1)}°C</td>
                    <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400 font-semibold">{row.cooling_power_kw.toFixed(1)} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || parsedRows.length === 0}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Batch Inference ({progress?.done ?? 0}/{progress?.total ?? parsedRows.length})...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Batch ML Predictions on {parsedRows.length} Rows</span>
              </>
            )}
          </button>
        </div>
      )}

      {apiError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 p-4 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Batch Error: </span>{apiError}
          </div>
        </div>
      )}

      {/* Results Table & Export */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Batch Inference Results</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{successCount} successful</span>
                {errorCount > 0 && (
                  <>, <span className="text-rose-600 dark:text-rose-400 font-bold">{errorCount} errors</span></>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadResults}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Predictions CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-3 px-3.5">#</th>
                  <th className="py-3 px-3.5">Workload</th>
                  <th className="py-3 px-3.5">CPU%</th>
                  <th className="py-3 px-3.5">IT Power</th>
                  <th className="py-3 px-3.5">Predicted Rack Temp</th>
                  <th className="py-3 px-3.5">Thermal Risk</th>
                  <th className="py-3 px-3.5">Rec. Cooling</th>
                  <th className="py-3 px-3.5">Anomaly</th>
                  <th className="py-3 px-3.5">Cost / hr</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {results.map((r) => (
                  <tr key={r.row} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">{r.row}</td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">{r.input.workload_type}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.input.cpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.input.it_power_kw.toFixed(1)} kW</td>
                    {r.result ? (
                      <>
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                          {r.result.predicted_rack_temp_c.toFixed(2)}°C
                        </td>
                        <td className="py-2.5 px-3.5">
                          <StatusBadge status={r.result.thermal_risk} size="sm" />
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">
                          {r.result.recommended_cooling}
                        </td>
                        <td className="py-2.5 px-3.5">
                          {r.result.is_anomaly ? (
                            <StatusBadge status="Anomaly" size="sm" />
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">Normal</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-cyan-600 dark:text-cyan-400">
                          ₹{r.result.estimated_cooling_cost_inr_per_hour.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td colSpan={5} className="py-2.5 px-3.5 text-rose-600 text-xs">
                          {r.error || "Inference failed"}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="text-rose-600 text-[11px] font-bold">Error</span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
