import type { Customer } from "@/types/customer";
import { useNavigate } from "react-router-dom";
import { Phone, ChevronRight } from "lucide-react";

export default function CustomerCard({ customer }: { customer: Customer }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/customer/${customer.id}`)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {customer.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-card-foreground">{customer.name}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Phone size={13} /> {customer.phone}
        </p>
      </div>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}
