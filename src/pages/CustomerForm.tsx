import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { addCustomer, getCustomer, updateCustomer } from "@/lib/db";
import { createEmptyCustomer, type Customer } from "@/types/customer";
import PageHeader from "@/components/PageHeader";
import MeasurementSection from "@/components/MeasurementSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const shirtFields = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeveLength", label: "Sleeve Length" },
  { key: "neck", label: "Neck" },
  { key: "shirtLength", label: "Shirt Length" },
  { key: "bicep", label: "Bicep" },
  { key: "wrist", label: "Wrist" },
  { key: "notes", label: "Notes", type: "text" as const },
];

const pantFields = [
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "bottom", label: "Bottom" },
  { key: "inseam", label: "Inseam" },
  { key: "outseam", label: "Outseam" },
  { key: "length", label: "Length" },
  { key: "notes", label: "Notes", type: "text" as const },
];

const blazerFields = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeve", label: "Sleeve" },
  { key: "length", label: "Length" },
  { key: "neck", label: "Neck" },
  { key: "armhole", label: "Armhole" },
  { key: "notes", label: "Notes", type: "text" as const },
];

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(createEmptyCustomer());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getCustomer(id).then((c) => {
        if (c) setForm({ name: c.name, phone: c.phone, address: c.address, email: c.email, shirt: c.shirt, pant: c.pant, blazer: c.blazer });
      });
    }
  }, [id]);

  const setField = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Name and Phone are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const now = new Date().toISOString();
    const customer: Customer = {
      id: id ?? crypto.randomUUID(),
      ...form,
      createdAt: isEdit ? "" : now,
      updatedAt: now,
    };
    if (isEdit) {
      const existing = await getCustomer(id!);
      customer.createdAt = existing?.createdAt ?? now;
      await updateCustomer(customer);
      toast({ title: "Customer updated!" });
    } else {
      await addCustomer(customer);
      toast({ title: "Customer added!" });
    }
    setLoading(false);
    navigate(isEdit ? `/customer/${id}` : "/");
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title={isEdit ? "Edit Customer" : "Add Customer"} showBack />
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6 p-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</h3>
          <div className="space-y-3">
            {[
              { key: "name", label: "Name *", placeholder: "Customer name" },
              { key: "phone", label: "Phone *", placeholder: "Phone number" },
              { key: "address", label: "Address", placeholder: "Address" },
              { key: "email", label: "Email", placeholder: "Email" },
            ].map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input
                  value={(form as any)[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="h-10"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Measurements Tabs */}
        <Tabs defaultValue="shirt" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shirt">Shirt</TabsTrigger>
            <TabsTrigger value="pant">Pant</TabsTrigger>
            <TabsTrigger value="blazer">Blazer</TabsTrigger>
          </TabsList>
          <TabsContent value="shirt" className="mt-4">
            <MeasurementSection
              title="Shirt Measurements"
              fields={shirtFields}
              values={form.shirt as any}
              onChange={(k, v) => setForm((p) => ({ ...p, shirt: { ...p.shirt, [k]: v } }))}
              notesKey="notes"
            />
          </TabsContent>
          <TabsContent value="pant" className="mt-4">
            <MeasurementSection
              title="Pant Measurements"
              fields={pantFields}
              values={form.pant as any}
              onChange={(k, v) => setForm((p) => ({ ...p, pant: { ...p.pant, [k]: v } }))}
              notesKey="notes"
            />
          </TabsContent>
          <TabsContent value="blazer" className="mt-4">
            <MeasurementSection
              title="Blazer Measurements"
              fields={blazerFields}
              values={form.blazer as any}
              onChange={(k, v) => setForm((p) => ({ ...p, blazer: { ...p.blazer, [k]: v } }))}
              notesKey="notes"
            />
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={loading} className="h-12 w-full text-base font-semibold">
          {loading ? "Saving..." : isEdit ? "Update Customer" : "Save Customer"}
        </Button>
      </form>
    </div>
  );
}
