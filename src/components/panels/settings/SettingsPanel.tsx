import "./SettingsPanel.css";
import { useEffect, useRef, useState } from "react";
import type { AppInfo, PresetId, Settings } from "../../../store";

import BehaviorSection from "./sections/BehaviorSection";
import AppearanceSection from "./sections/AppearanceSection";
import PresetsSection from "./sections/PresetsSection";
import SystemSection from "./sections/SystemSection";
import KeybindsSection from "./sections/KeybindsSection";
import ProcessListSection from "./sections/ProcessListSection";

type SettingsTab =
  | "behavior"
  | "appearance"
  | "keybinds"
  | "process-list"
  | "presets"
  | "system";

interface Props {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  running: boolean;
  appInfo: AppInfo;
  onSavePreset: (name: string) => boolean;
  onApplyPreset: (presetId: PresetId) => boolean;
  onUpdatePreset: (presetId: PresetId) => boolean;
  onRenamePreset: (presetId: PresetId, name: string) => boolean;
  onDeletePreset: (presetId: PresetId) => boolean;
  onDuplicatePreset: (presetId: PresetId) => boolean;
  onExportPreset: (presetId: PresetId) => Promise<boolean>;
  onImportPreset: () => Promise<boolean | null>;
  onToggleAlwaysOnTop: () => Promise<void>;
  onReset: () => Promise<void>;
  initialSettingsTab?: string;
  onInitialTabConsumed?: () => void;
}

export default function SettingsPanel({
  settings,
  update,
  running,
  appInfo,
  onSavePreset,
  onApplyPreset,
  onUpdatePreset,
  onRenamePreset,
  onDeletePreset,
  onDuplicatePreset,
  onExportPreset,
  onImportPreset,
  onToggleAlwaysOnTop,
  onReset,
  initialSettingsTab,
  onInitialTabConsumed,
}: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("behavior");
  const [atBottom, setAtBottom] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevInitialTabRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      initialSettingsTab &&
      initialSettingsTab !== prevInitialTabRef.current
    ) {
      prevInitialTabRef.current = initialSettingsTab;
      onInitialTabConsumed?.();
      const tab = initialSettingsTab as SettingsTab;
      requestAnimationFrame(() => {
        setActiveTab(tab);
      });
    }
  }, [initialSettingsTab, onInitialTabConsumed]);

  const handleScroll = () => {
    const panel = panelRef.current;
    if (!panel) return;
    setAtBottom(panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2);
  };

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(handleScroll);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [activeTab]);

  return (
    <div className="settings-wrapper">
      <nav className="settings-sidebar">
        <button
          className={`sidebar-tab ${activeTab === "behavior" ? "active" : ""}`}
          onClick={() => setActiveTab("behavior")}
        >
          <span className="tab-icon tab-icon-behavior">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect
                className="beh-track"
                x="2"
                y="6"
                width="20"
                height="12"
                rx="6"
              />
              <circle
                className="beh-knob"
                cx="16"
                cy="12"
                r="3.5"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </span>
          Behavior
        </button>
        <button
          className={`sidebar-tab ${activeTab === "appearance" ? "active" : ""}`}
          onClick={() => setActiveTab("appearance")}
        >
          <span className="tab-icon tab-icon-appearance">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4.5" />
              <g className="app-rays">
                <line x1="12" y1="3" x2="12" y2="1" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="3" y1="12" x2="1" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                <line x1="6.34" y1="6.34" x2="4.93" y2="4.93" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
              </g>
            </svg>
          </span>
          Appearance
        </button>
        <button
          className={`sidebar-tab ${activeTab === "keybinds" ? "active" : ""}`}
          onClick={() => setActiveTab("keybinds")}
        >
          <span className="tab-icon tab-icon-keybinds">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
            </svg>
          </span>
          Keybinds
        </button>
        <button
          className={`sidebar-tab ${activeTab === "process-list" ? "active" : ""}`}
          onClick={() => setActiveTab("process-list")}
        >
          <span className="tab-icon tab-icon-process-list">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="M6 8h.01" />
              <path d="M10 8h.01" />
              <path d="M14 8h.01" />
            </svg>
          </span>
          Process List
        </button>
        <button
          className={`sidebar-tab ${activeTab === "presets" ? "active" : ""}`}
          onClick={() => setActiveTab("presets")}
        >
          <span className="tab-icon tab-icon-presets">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                className="preset-fill"
                d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
              />
            </svg>
          </span>
          Presets
        </button>
        <button
          className={`sidebar-tab ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          <span className="tab-icon tab-icon-system">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
            </svg>
          </span>
          System
        </button>
      </nav>
      <div className="settings-corner" />
      <div className="settings-panel-frame">
        <div className="settings-panel-gutter" />
        <div className="settings-panel-corner-right" />
        <div className="settings-panel-border" />
      <div className="settings-panel" ref={panelRef} onScroll={handleScroll}>
        {activeTab === "behavior" && (
          <BehaviorSection
            settings={settings}
            update={update}
            onToggleAlwaysOnTop={onToggleAlwaysOnTop}
            portable={appInfo.portable}
          />
        )}
        {activeTab === "appearance" && (
          <AppearanceSection settings={settings} update={update} />
        )}
        {activeTab === "keybinds" && (
          <KeybindsSection settings={settings} update={update} />
        )}
        {activeTab === "process-list" && (
          <div className="settings-proc-list-wrapper">
            <ProcessListSection settings={settings} update={update} />
          </div>
        )}
        {activeTab === "presets" && (
          <PresetsSection
            settings={settings}
            running={running}
            onSavePreset={onSavePreset}
            onApplyPreset={onApplyPreset}
            onUpdatePreset={onUpdatePreset}
            onRenamePreset={onRenamePreset}
            onDeletePreset={onDeletePreset}
            onDuplicatePreset={onDuplicatePreset}
            onExportPreset={onExportPreset}
            onImportPreset={onImportPreset}
          />
        )}
        {activeTab === "system" && (
          <SystemSection onReset={onReset} />
        )}
      </div>
      </div>
      <div
        className={`settings-fade ${atBottom ? "settings-fade--hidden" : ""}`}
      ></div>
    </div>
  );
}
