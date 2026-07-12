import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TIMEOUT_MS = 12000;

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

function getStoredSession(): Session | null {
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const maybeSession = parsed?.currentSession ?? parsed?.session ?? parsed;
      if (maybeSession?.access_token && maybeSession?.user) return maybeSession as Session;
    }
  } catch {
    return null;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      if (event === "INITIAL_SESSION") return;
      setSession(s);
      setLoading(false);
    });

    const timeout = window.setTimeout(() => {
      if (!active) return;
      const stored = getStoredSession();
      if (stored) setSession(stored);
      setLoading(false);
    }, SESSION_TIMEOUT_MS);

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!active) return;
        window.clearTimeout(timeout);
        setSession(data.session ?? getStoredSession());
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        window.clearTimeout(timeout);
        setSession(getStoredSession());
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
    const { data } = await supabase.auth.getSession().catch(() => ({ data: { session: getStoredSession() } }));
    setSession(data.session ?? null);
    setLoading(false);
    return data.session ?? null;
  };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, loading, refreshSession, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
