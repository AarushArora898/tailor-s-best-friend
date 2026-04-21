import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number";
}

interface Props {
  title: string;
  fields: Field[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  notesKey?: string;
}

export default function MeasurementSection({ title, fields, values, onChange, notesKey }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {fields
          .filter((f) => f.key !== notesKey)
          .map((f) => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type={f.type === "text" ? "text" : "text"}
                inputMode={f.type === "text" ? "text" : "decimal"}
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder="—"
                className="h-9"
              />
            </div>
          ))}
      </div>
      {notesKey && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea
            value={values[notesKey] ?? ""}
            onChange={(e) => onChange(notesKey, e.target.value)}
            placeholder="Additional notes..."
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
