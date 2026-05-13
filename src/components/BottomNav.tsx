import { useNavigate, useLocation } from "react-router-dom";
import { Home, Settings, Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  if (!user || pathname === "/auth") return null;

  const items = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Plus, label: "Add", path: "/add" },
    { icon: Sparkles, label: "Try-On", path: "/tryon" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {items.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
