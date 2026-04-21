import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Customer } from "@/types/customer";

interface TailorDB extends DBSchema {
  customers: {
    key: string;
    value: Customer;
    indexes: { "by-name": string; "by-phone": string; "by-date": string };
  };
}

let dbPromise: Promise<IDBPDatabase<TailorDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TailorDB>("protailor-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("customers", { keyPath: "id" });
        store.createIndex("by-name", "name");
        store.createIndex("by-phone", "phone");
        store.createIndex("by-date", "createdAt");
      },
    });
  }
  return dbPromise;
}

export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDB();
  const all = await db.getAll("customers");
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const db = await getDB();
  return db.get("customers", id);
}

export async function addCustomer(customer: Customer): Promise<void> {
  const db = await getDB();
  await db.put("customers", customer);
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const db = await getDB();
  await db.put("customers", customer);
}

export async function deleteCustomer(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("customers", id);
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const all = await getAllCustomers();
  const q = query.toLowerCase();
  return all.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
}
