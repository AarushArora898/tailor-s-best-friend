import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Users, Scissors } from "lucide-react";
import { getAllCustomers, searchCustomers } from "@/lib/db";
import type { Customer } from "@/types/customer";
import { useSettings } from "@/contexts/SettingsContext";
import CustomerCard from "@/components/CustomerCard";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const { shopName } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setCustomers(await getAllCustomers());
  }

  useEffect(() => {
    if (query.trim()) {
      searchCustomers(query).then(setCustomers);
    } else {
      loadCustomers();
    }
  }, [query]);

  const recent = customers.slice(0, 5);

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-primary px-5 pb-10 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-2 mb-1">
            <Scissors size={20} />
            <span className="text-sm font-medium opacity-80">Measure Manager</span>
          </div>
          <h1 className="text-2xl font-bold">{shopName}</h1>

          {/* Search */}
          <div className="relative mt-5">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="h-11 border-none bg-primary-foreground/15 pl-10 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-primary-foreground/30"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-4 space-y-5">
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{customers.length}</p>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </div>
          </div>
        </div>

        {/* Recent */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {query ? "Search Results" : "Recent Customers"}
          </h2>
          <div className="space-y-2">
            <AnimatePresence>
              {(query ? customers : recent).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {query ? "No results found" : "No customers yet. Add your first!"}
                </p>
              )}
              {(query ? customers : recent).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <CustomerCard customer={c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/add")}
        className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-90"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
