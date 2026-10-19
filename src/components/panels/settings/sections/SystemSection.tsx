import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { error } from "@tauri-apps/plugin-log";
import type { AppInfo } from "../../../../store";
import { changelogEntries } from "../../../../changelog";
import ChangelogContent from "../../../ChangelogContent";
import ConfirmDialog from "../../../ConfirmDialog";
import { SettingsCard } from "./shared";

interface Props {
  appInfo: AppInfo;
  updateCheckStatus:
    "idle" | "checking" | "available" | "unavailable" | "error";
  onCheckForUpdate: () => void;
  onReset: () => Promise<void>;
}

export default function SystemSection({
  appInfo,
  updateCheckStatus,
  onCheckForUpdate,
  onReset,
}: Props) {
  const [pendingAction, setPendingAction] = useState<"reset-settings" | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [diagnosticsStatus, setDiagnosticsStatus] = useState<string | null>(
    null,
  );
  const [exporting, setExporting] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const handleConfirmResetSettings = async () => {
    setBusy(true);
    try {
      await onReset();
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const updateButtonLabel = {
    idle: "Check for Update",
    checking: "Checking...",
    available: "Update found!",
    unavailable: "No update found",
    error: "Check failed",
  }[updateCheckStatus];

  return (
    <>
      <section className="settings-card">
        <div className="settings-card-content">
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
        </div>
      </section>

      <SettingsCard title="Diagnostics" description="Your logs & crash reports">
        <div className="settings-row">
          <div className="settings-label-group">
            <span className="settings-label">Diagnostics</span>
            <span className="settings-sublabel">
              View or export your diagnostics.
            </span>
          </div>
          <div className="settings-row-actions">
            <button
              className="settings-btn-secondary"
              onClick={async () => {
                try {
                  await invoke("open_diagnostics_folder");
                } catch (err) {
                  error(
                    JSON.stringify({
                      source: "SettingsPanel.openDiagnostics",
                      error: String(err),
                    }),
                  );
                }
              }}
            >
              Open Folder
            </button>
            <button
              className="settings-btn-secondary"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                setDiagnosticsStatus(null);
                try {
                  const path: string = await invoke(
                    "export_diagnostics_bundle",
                  );
                  setDiagnosticsStatus(`Exported to ${path}`);
                } catch (err) {
                  setDiagnosticsStatus("Export failed");
                  error(
                    JSON.stringify({
                      source: "SettingsPanel.exportDiagnostics",
                      error: String(err),
                    }),
                  );
                } finally {
                  setExporting(false);
                }
              }}
            >
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
        {diagnosticsStatus && (
          <span className="settings-note">{diagnosticsStatus}</span>
        )}
      </SettingsCard>

      <SettingsCard title="Reset" description="Reset all settings.">
        <div className="settings-row">
          <div className="settings-label-group">
            <span className="settings-label">Reset All Settings</span>
            <span className="settings-sublabel">
              Reset all settings to their defaults.
            </span>
          </div>
          <button
            className="settings-btn-danger"
            onClick={() => setPendingAction("reset-settings")}
          >
            Reset
          </button>
        </div>
      </SettingsCard>

      <ConfirmDialog
        open={pendingAction === "reset-settings"}
        title="Reset all settings"
        message="This will reset all settings to their default values. This action cannot be undone."
        confirmLabel="Reset"
        busy={busy}
        onConfirm={handleConfirmResetSettings}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
