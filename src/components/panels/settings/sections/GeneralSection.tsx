import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SettingsCard } from "./shared";

interface CumulativeStats {
  totalClicks: number;
  totalTimeSecs: number;
  totalSessions: number;
  avgCpu: number;
}

function formatTime(totalSeconds: number, language: string): string {
  if (totalSeconds < 0.01) return "0s";
  if (totalSeconds < 60) {
    return `${Math.floor(totalSeconds).toLocaleString(language)}s`;
  }
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return s > 0
      ? `${m.toLocaleString(language)}m ${s.toLocaleString(language)}s`
      : `${m.toLocaleString(language)}m`;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return m > 0
    ? `${h.toLocaleString(language)}h ${m.toLocaleString(language)}m`
    : `${h.toLocaleString(language)}h`;
}

function formatNumber(n: number, language: string): string {
  return Math.floor(n).toLocaleString(language);
}

function formatCpu(
  cpu: number,
  language: string,
  notAvailable: string,
): string {
  if (!Number.isFinite(cpu) || cpu < 0) return notAvailable;
  return `${cpu.toLocaleString(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export default function GeneralSection() {
  const [stats, setStats] = useState<CumulativeStats | null>(null);
  const language = "en";

  useEffect(() => {
    invoke<CumulativeStats>("get_stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const hasStats = stats !== null && stats.totalSessions > 0;

  return (
    <>
      <SettingsCard
        title="Usage"
        description="Clicking statistics for all sessions (only stored locally)."
      >
        {hasStats ? (
          <div className="stats-grid">
            <div className="stats-cell">
              <span className="stats-cell-label">Total Clicks</span>
              <span className="stats-cell-value">
                {formatNumber(stats.totalClicks, language)}
              </span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-label">Total Clicking Time</span>
              <span className="stats-cell-value">
                {formatTime(stats.totalTimeSecs, language)}
              </span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-label">Average CPU Usage</span>
              <span className="stats-cell-value">
                {formatCpu(stats.avgCpu, language, "N/A")}
              </span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-label">Clicking Sessions</span>
              <span className="stats-cell-value">
                {formatNumber(stats.totalSessions, language)}
              </span>
            </div>
          </div>
        ) : (
          <div className="stats-empty">No session data yet.</div>
        )}
      </SettingsCard>
    </>
  );
}
