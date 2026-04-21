import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsPage() {
  const { shopName, darkMode, update } = useSettings();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Settings" />
      <div className="mx-auto max-w-lg space-y-6 p-4">
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Shop Name</Label>
          <Input
            value={shopName}
            onChange={(e) => update({ shopName: e.target.value })}
            placeholder="Your shop name"
            className="h-11"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <p className="font-medium text-card-foreground">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <Switch checked={darkMode} onCheckedChange={(v) => update({ darkMode: v })} />
        </div>

        <p className="text-center text-xs text-muted-foreground">ProTailor Measure Manager v1.0</p>
      </div>
    </div>
  );
}
