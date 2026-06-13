import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TIMEOUT_MS = 6000;

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  refreshSession: () => Promise<Session | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  refreshSession: async () => null,
  signOut: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let restoredFromStorage = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      if (event === "INITIAL_SESSION" && !restoredFromStorage) return;
      setSession(s);
      setLoading(false);
    });

    const timeout = window.setTimeout(() => {
      if (!active || restoredFromStorage) return;
      setLoading(false);
    }, SESSION_TIMEOUT_MS);

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      restoredFromStorage = true;
      window.clearTimeout(timeout);
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setLoading(false);
    return data.session;
  };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, loading, refreshSession, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
