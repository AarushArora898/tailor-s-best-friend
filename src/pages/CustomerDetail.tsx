import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomer, deleteCustomer } from "@/lib/db";
import type { Customer } from "@/types/customer";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, FileText, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { generatePDF } from "@/lib/pdf";
import { useSettings } from "@/contexts/SettingsContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function MeasureGrid({ data, labels }: { data: Record<string, string>; labels: Record<string, string> }) {
  const entries = Object.entries(labels).filter(([k]) => k !== "notes");
  const notes = data.notes;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, label]) => (
          <div key={key} className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">{data[key] || "—"}</p>
          </div>
        ))}
      </div>
      {notes && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Notes</p>
          <p className="mt-0.5 text-sm text-foreground">{notes}</p>
        </div>
      )}
    </div>
  );
}

const shirtLabels: Record<string, string> = {
  chest: "Chest", waist: "Waist", shoulder: "Shoulder", sleeveLength: "Sleeve Length",
  neck: "Neck", shirtLength: "Shirt Length", bicep: "Bicep", wrist: "Wrist",
};
const pantLabels: Record<string, string> = {
  waist: "Waist", hip: "Hip", thigh: "Thigh", knee: "Knee",
  bottom: "Bottom", inseam: "Inseam", outseam: "Outseam", length: "Length",
};
const blazerLabels: Record<string, string> = {
  chest: "Chest", waist: "Waist", shoulder: "Shoulder", sleeve: "Sleeve",
  length: "Length", neck: "Neck", armhole: "Armhole",
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { shopName } = useSettings();

  useEffect(() => {
    if (id) getCustomer(id).then((c) => setCustomer(c ?? null));
  }, [id]);

  if (!customer) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  async function handleDelete() {
    await deleteCustomer(customer!.id);
    toast({ title: "Customer deleted" });
    navigate("/");
  }

  function handleExportPDF() {
    generatePDF(customer!, shopName);
    toast({ title: "PDF downloaded!" });
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Customer Details"
        showBack
        right={
          <div className="flex gap-1">
            <button onClick={() => navigate(`/edit/${customer.id}`)} className="rounded-lg p-2 text-foreground hover:bg-secondary">
              <Edit size={18} />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                  <Trash2 size={18} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {customer.name} and all their measurements.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="mx-auto max-w-lg space-y-5 p-4">
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-card-foreground">{customer.name}</h2>
            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5"><Phone size={13} />{customer.phone}</p>
              {customer.email && <p className="flex items-center gap-1.5"><Mail size={13} />{customer.email}</p>}
              {customer.address && <p className="flex items-center gap-1.5"><MapPin size={13} />{customer.address}</p>}
              <p className="flex items-center gap-1.5"><Calendar size={13} />{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Measurements */}
        <Tabs defaultValue="shirt">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shirt">Shirt</TabsTrigger>
            <TabsTrigger value="pant">Pant</TabsTrigger>
            <TabsTrigger value="blazer">Blazer</TabsTrigger>
          </TabsList>
          <TabsContent value="shirt" className="mt-4">
            <MeasureGrid data={customer.shirt as any} labels={shirtLabels} />
          </TabsContent>
          <TabsContent value="pant" className="mt-4">
            <MeasureGrid data={customer.pant as any} labels={pantLabels} />
          </TabsContent>
          <TabsContent value="blazer" className="mt-4">
            <MeasureGrid data={customer.blazer as any} labels={blazerLabels} />
          </TabsContent>
        </Tabs>

        {/* Export */}
        <Button onClick={handleExportPDF} variant="outline" className="h-12 w-full gap-2 text-base">
          <FileText size={18} /> Export PDF
        </Button>
      </div>
    </div>
  );
}
