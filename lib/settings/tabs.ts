export const SETTINGS_TABS = [
  "profile",
  "service-area",
  "team",
  "preferences",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export function parseSettingsTab(raw: string | null | undefined): SettingsTab {
  if (raw && SETTINGS_TABS.includes(raw as SettingsTab)) {
    return raw as SettingsTab;
  }
  return "profile";
}
