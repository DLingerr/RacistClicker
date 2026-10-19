import { useState } from "react";
import type { AppInfo } from "../../../../store";
import { changelogEntries } from "../../../../changelog";
import ChangelogContent from "../../../ChangelogContent";

interface Props {
  appInfo: AppInfo;
  updateCheckStatus:
    "idle" | "checking" | "available" | "unavailable" | "error";
  onCheckForUpdate: () => void;
}

export default function AboutSection({
  appInfo,
  updateCheckStatus,
  onCheckForUpdate,
}: Props) {
  const [showChangelog, setShowChangelog] = useState(false);

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
    </>
  );
}
