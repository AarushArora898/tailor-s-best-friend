export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  shirt: ShirtMeasurements;
  pant: PantMeasurements;
  blazer: BlazerMeasurements;
}

export interface ShirtMeasurements {
  chest: string;
  waist: string;
  shoulder: string;
  sleeveLength: string;
  neck: string;
  shirtLength: string;
  bicep: string;
  wrist: string;
  notes: string;
}

export interface PantMeasurements {
  waist: string;
  hip: string;
  thigh: string;
  knee: string;
  bottom: string;
  inseam: string;
  outseam: string;
  length: string;
  notes: string;
}

export interface BlazerMeasurements {
  chest: string;
  waist: string;
  shoulder: string;
  sleeve: string;
  length: string;
  neck: string;
  armhole: string;
  notes: string;
}

export const emptyShirt: ShirtMeasurements = {
  chest: "", waist: "", shoulder: "", sleeveLength: "", neck: "",
  shirtLength: "", bicep: "", wrist: "", notes: "",
};

export const emptyPant: PantMeasurements = {
  waist: "", hip: "", thigh: "", knee: "", bottom: "",
  inseam: "", outseam: "", length: "", notes: "",
};

export const emptyBlazer: BlazerMeasurements = {
  chest: "", waist: "", shoulder: "", sleeve: "", length: "",
  neck: "", armhole: "", notes: "",
};

export const createEmptyCustomer = (): Omit<Customer, "id" | "createdAt" | "updatedAt"> => ({
  name: "", phone: "", address: "", email: "",
  shirt: { ...emptyShirt },
  pant: { ...emptyPant },
  blazer: { ...emptyBlazer },
});
