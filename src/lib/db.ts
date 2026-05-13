import { supabase } from "@/integrations/supabase/client";
import type { Customer } from "@/types/customer";
import { emptyShirt, emptyPant, emptyBlazer } from "@/types/customer";

type Row = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  shirt: any;
  pant: any;
  blazer: any;
  created_at: string;
  updated_at: string;
};

function fromRow(r: Row): Customer {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    address: r.address,
    email: r.email,
    shirt: { ...emptyShirt, ...(r.shirt ?? {}) },
    pant: { ...emptyPant, ...(r.pant ?? {}) },
    blazer: { ...emptyBlazer, ...(r.blazer ?? {}) },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getAllCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Row) : undefined;
}

export async function addCustomer(c: Omit<Customer, "createdAt" | "updatedAt">): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase.from("customers").insert({
    id: c.id,
    user_id: u.user.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    email: c.email,
    shirt: c.shirt as any,
    pant: c.pant as any,
    blazer: c.blazer as any,
  });
  if (error) throw error;
}

export async function updateCustomer(c: Customer): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update({
      name: c.name,
      phone: c.phone,
      address: c.address,
      email: c.email,
      shirt: c.shirt as any,
      pant: c.pant as any,
      blazer: c.blazer as any,
    })
    .eq("id", c.id);
  if (error) throw error;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const q = `%${query}%`;
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(`name.ilike.${q},phone.ilike.${q}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}
