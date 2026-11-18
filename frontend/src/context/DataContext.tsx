import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  HealthStatus,
  HistoricalSummary,
  SampleRecord,
  PredictionResult,
  OperatorDecision,
} from "../types";
import { fetchHealth, fetchHistoricalSummary, fetchSampleRecords } from "../api";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "warning" | "alert" | "info" | "success";
  read: boolean;
}

export interface AppSettings {
  tariffInr: number;
  lowTempThreshold: number;
  medTempThreshold: number;
  autoRefreshIntervalSec: number;
  userProfile: {
    name: string;
    role: string;
    facility: string;
    email: string;
  };
}

interface DataContextType {
  health: HealthStatus | null;
  summary: HistoricalSummary | null;
  sampleRecords: SampleRecord[];
  latestPrediction: PredictionResult | null;
  setLatestPrediction: (pred: PredictionResult) => void;
  decisions: OperatorDecision[];
  addDecision: (decision: OperatorDecision) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  isLoadingSummary: boolean;
  lastUpdated: string;
  refreshAll: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  tariffInr: 8.0,
  lowTempThreshold: 27.0,
  medTempThreshold: 31.0,
  autoRefreshIntervalSec: 30,
  userProfile: {
    name: "Nithish K.",
    role: "Lead DC Infrastructure Architect",
    facility: "Thermo-Opt Hall Alpha (Zone 4)",
    email: "ops.thermal@thermo-opt.internal",
  },
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Thermal Risk Advisory",
    message: "Rack row 4 reported outlet temp above 28.5°C during high compute burst.",
    timestamp: "10 mins ago",
    type: "warning",
    read: false,
  },
  {
    id: "notif-2",
    title: "IsolationForest Outlier",
    message: "Low fan speed with elevated IT load combination flagged for inspection.",
    timestamp: "28 mins ago",
    type: "alert",
    read: false,
  },
  {
    id: "notif-3",
    title: "Model Pipeline Verified",
    message: "RandomForestRegressor & IsolationForest loaded with 8,760 annual telemetry points.",
    timestamp: "1 hour ago",
    type: "success",
    read: true,
  },
];

const INITIAL_DECISIONS: OperatorDecision[] = [
  {
    id: "dec-init-1",
    timestamp: "10:30 AM",
    predicted_temp: 22.8,
    risk: "Low",
    recommended_cooling: "Low",
    decision: "Accepted",
    notes: "Telemetry stable within normal threshold. Kept at Low cooling.",
    cost_per_hour: 44.8,
    is_anomaly: false,
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [summary, setSummary] = useState<HistoricalSummary | null>(null);
  const [sampleRecords, setSampleRecords] = useState<SampleRecord[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [decisions, setDecisions] = useState<OperatorDecision[]>(() => {
    const saved = localStorage.getItem("thermo_opt_decisions");
    return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("thermo_opt_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const refreshAll = async () => {
    try {
      const [hData, sData, rData] = await Promise.allSettled([
        fetchHealth(),
        fetchHistoricalSummary(),
        fetchSampleRecords(0, 100),
      ]);

      if (hData.status === "fulfilled") setHealth(hData.value);
      if (sData.status === "fulfilled") setSummary(sData.value);
      if (rData.status === "fulfilled") setSampleRecords(rData.value.records);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, (settings.autoRefreshIntervalSec || 30) * 1000);
    return () => clearInterval(interval);
  }, [settings.autoRefreshIntervalSec]);

  const addDecision = (decision: OperatorDecision) => {
    setDecisions((prev) => {
      const updated = [decision, ...prev];
      localStorage.setItem("thermo_opt_decisions", JSON.stringify(updated));
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("thermo_opt_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        health,
        summary,
        sampleRecords,
        latestPrediction,
        setLatestPrediction,
        decisions,
        addDecision,
        settings,
        updateSettings,
        notifications,
        dismissNotification,
        isLoadingSummary,
        lastUpdated,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

