import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AppInfo } from "../../../../store";
import { changelogEntries } from "../../../../changelog";
import ChangelogContent from "../../../ChangelogContent";
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

interface Props {
  appInfo: AppInfo;
  updateCheckStatus:
    "idle" | "checking" | "available" | "unavailable" | "error";
  onCheckForUpdate: () => void;
}

export default function GeneralSection({
  appInfo,
  updateCheckStatus,
  onCheckForUpdate,
}: Props) {
  const [stats, setStats] = useState<CumulativeStats | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const language = "en";

  useEffect(() => {
    invoke<CumulativeStats>("get_stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const hasStats = stats !== null && stats.totalSessions > 0;

  const updateButtonLabel = {
    idle: "Check for Update",
    checking: "Checking...",
    available: "Update found!",
    unavailable: "No update found",
    error: "Check failed",
  }[updateCheckStatus];

  return (
    <>
      <SettingsCard title="About" description="Version info.">
        <div className="settings-row">
          <div className="settings-label-group settings-label-group--inline">
            <span className="settings-label">Version</span>
            <span className="settings-value">
              v{appInfo.version}
              {appInfo.portable ? " portable (no auto update)" : ""}
            </span>
          </div>
          <div className="settings-row-actions">
            <button
              className="settings-btn-secondary changelog-toggle-btn"
              onClick={() => setShowChangelog((v) => !v)}
            >
              <svg
                className={`changelog-arrow${showChangelog ? " open" : ""}`}
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M3 1L7 5L3 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {showChangelog ? "Hide Changes" : "Show Changes"}
            </button>
            <button
              className="settings-btn-secondary check-update-btn"
              onClick={onCheckForUpdate}
              disabled={updateCheckStatus !== "idle"}
            >
              {updateButtonLabel}
            </button>
          </div>
        </div>
        {showChangelog && <ChangelogContent entries={changelogEntries} />}
      </SettingsCard>

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
