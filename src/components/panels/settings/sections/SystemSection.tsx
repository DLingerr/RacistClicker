import { useState } from "react";
import ConfirmDialog from "../../../ConfirmDialog";
import { SettingsCard } from "./shared";

interface Props {
  onReset: () => Promise<void>;
}

export default function SystemSection({ onReset }: Props) {
  const [pendingAction, setPendingAction] = useState<"reset-settings" | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const handleConfirmResetSettings = async () => {
    setBusy(true);
    try {
      await onReset();
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  return (
    <>
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
