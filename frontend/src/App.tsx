import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";

// 10 Separate Module Pages
import { OverviewPage } from "./pages/OverviewPage";
import { LiveMonitoringPage } from "./pages/LiveMonitoringPage";
import { TemperaturePredictionPage } from "./pages/TemperaturePredictionPage";
import { ThermalRiskPage } from "./pages/ThermalRiskPage";
import { AnomalyDetectionPage } from "./pages/AnomalyDetectionPage";
import { CoolingRecommendationsPage } from "./pages/CoolingRecommendationsPage";
import { EnergyCostPage } from "./pages/EnergyCostPage";
import { CsvUploadPage } from "./pages/CsvUploadPage";
import { ReportsHistoryPage } from "./pages/ReportsHistoryPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
            <Route path="/prediction" element={<TemperaturePredictionPage />} />
            <Route path="/thermal-risk" element={<ThermalRiskPage />} />
            <Route path="/anomaly-detection" element={<AnomalyDetectionPage />} />
            <Route path="/cooling-recommendations" element={<CoolingRecommendationsPage />} />
            <Route path="/energy-cost" element={<EnergyCostPage />} />
            <Route path="/csv-upload" element={<CsvUploadPage />} />
            <Route path="/reports-history" element={<ReportsHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  );
}
