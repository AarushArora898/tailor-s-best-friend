const SETTINGS_KEY = "protailor-settings";

export interface AppSettings {
  shopName: string;
  darkMode: boolean;
}

const defaults: AppSettings = {
  shopName: "ProTailor",
  darkMode: false,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return { ...defaults };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
