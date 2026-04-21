import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSettings, saveSettings, type AppSettings } from "@/lib/settings";

interface SettingsCtx extends AppSettings {
  update: (s: Partial<AppSettings>) => void;
}

const Ctx = createContext<SettingsCtx>({
  ...getSettings(),
  update: () => {},
});

export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    saveSettings(settings);
  }, [settings]);

  const update = (partial: Partial<AppSettings>) =>
    setSettings((prev) => ({ ...prev, ...partial }));

  return <Ctx.Provider value={{ ...settings, update }}>{children}</Ctx.Provider>;
}
