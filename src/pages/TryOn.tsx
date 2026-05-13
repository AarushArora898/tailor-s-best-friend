import { useRef, useState } from "react";
import { Loader2, Upload, Sparkles, Download, ImagePlus, User } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import maleModel from "@/assets/model-male.jpg";
import femaleModel from "@/assets/model-female.jpg";

const PRESETS = [
  { id: "male", label: "Male", url: maleModel },
  { id: "female", label: "Female", url: femaleModel },
];

const GARMENT_TYPES = ["Shirt", "T-Shirt", "Pant", "Jeans", "Kurta", "Pajama", "Waistcoat", "Blazer", "Sherwani", "Suit", "Jacket"];


function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}

function fileToDataUrl(f: File): Promise<string> {
  return blobToDataUrl(f);
}

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  let blob = await res.blob();
  if (!blob.type || blob.type === "application/octet-stream") {
    const ext = url.split(".").pop()?.toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    blob = new Blob([blob], { type: mime });
  }
  return blobToDataUrl(blob);
}

export default function TryOn() {
  const [modelUrl, setModelUrl] = useState<string>(maleModel);
  const [customModelData, setCustomModelData] = useState<string | null>(null);
  const [garmentData, setGarmentData] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState<string>("Shirt");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modelInput = useRef<HTMLInputElement>(null);
  const garmentInput = useRef<HTMLInputElement>(null);

  async function pickModel(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await fileToDataUrl(f);
    setCustomModelData(data);
    setModelUrl(data);
  }

  async function pickGarment(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setGarmentData(await fileToDataUrl(f));
  }

  async function generate() {
    if (!garmentData) {
      toast({ title: "Please add a garment image", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResultUrl(null);
    try {
      const modelImage = modelUrl.startsWith("data:") ? modelUrl : await urlToDataUrl(modelUrl);
      const { data, error } = await supabase.functions.invoke("tryon", {
        body: { modelImage, garmentImage: garmentData, garmentType },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResultUrl((data as any).image);
    } catch (err: any) {
      toast({ title: "Try-on failed", description: err.message ?? String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Virtual Try-On" />
      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Model selection */}
        <section className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1. Choose model</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setModelUrl(p.url); setCustomModelData(null); }}
                className={`overflow-hidden rounded-xl border-2 transition ${modelUrl === p.url && !customModelData ? "border-primary" : "border-border"}`}
              >
                <img src={p.url} alt={p.label} loading="lazy" className="aspect-[2/3] w-full object-cover" />
                <p className="py-1 text-xs font-medium">{p.label}</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => modelInput.current?.click()}
              className={`flex aspect-[2/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-muted-foreground transition ${customModelData ? "border-primary text-primary" : "border-border hover:text-foreground"}`}
            >
              {customModelData ? (
                <img src={customModelData} alt="Custom" className="h-full w-full rounded-[10px] object-cover" />
              ) : (
                <>
                  <User size={22} />
                  <span className="text-[10px]">Upload</span>
                </>
              )}
            </button>
          </div>
          <input ref={modelInput} type="file" accept="image/*" hidden onChange={pickModel} />
        </section>

        {/* Garment image */}
        <section className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2. Garment image</Label>
          <button
            type="button"
            onClick={() => garmentInput.current?.click()}
            className="flex h-32 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground hover:text-foreground"
          >
            {garmentData ? (
              <img src={garmentData} alt="Garment" className="h-full w-full rounded-[10px] object-contain p-2" />
            ) : (
              <>
                <ImagePlus size={22} />
                <span className="text-sm font-medium">Upload garment image</span>
              </>
            )}
          </button>
          <input ref={garmentInput} type="file" accept="image/*" hidden onChange={pickGarment} />
        </section>

        {/* Garment type */}
        <section className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3. What is it?</Label>
          <Select value={garmentType} onValueChange={setGarmentType}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GARMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </section>

        <Button onClick={generate} disabled={loading} className="h-12 w-full text-base font-semibold">
          {loading ? <><Loader2 className="mr-2 animate-spin" size={18} /> Generating...</> : <><Sparkles className="mr-2" size={18} /> Try It On</>}
        </Button>

        {resultUrl && (
          <section className="space-y-3 rounded-2xl border border-border bg-card p-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result</Label>
            <img src={resultUrl} alt="Result" className="w-full rounded-xl" />
            <a href={resultUrl} download="tryon.png">
              <Button variant="outline" className="w-full"><Download size={16} className="mr-2" /> Download</Button>
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
