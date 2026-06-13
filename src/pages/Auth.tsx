import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type AuthValidation = { ok: true; email: string; password: string } | { ok: false; error: string };

function validateAuth(email: string, password: string): AuthValidation {
  const cleanEmail = email.trim();
  if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 255) return { ok: false, error: "Invalid email" };
  if (password.length < 6) return { ok: false, error: "Min 6 characters" };
  if (password.length > 72) return { ok: false, error: "Password is too long" };
  return { ok: true, email: cleanEmail, password };
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateAuth(email, password);
    if (parsed.ok === false) {
      toast({ title: parsed.error, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        let activeSession = await refreshSession();
        if (!activeSession) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: parsed.email,
            password: parsed.password,
          });
          if (signInError) throw signInError;
          activeSession = await refreshSession();
        }
        if (!activeSession) throw new Error("Account created. Please sign in once with the same email and password.");
        toast({ title: "Account ready", description: "You're signed in." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        });
        if (error) throw error;
        const activeSession = await refreshSession();
        if (!activeSession) throw new Error("Sign-in did not finish. Please try again.");
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      const message = String(err.message ?? "Authentication failed");
      toast({
        title: message.includes("Invalid login credentials") ? "Invalid email or password" : message,
        description: message.includes("Invalid login credentials") ? "Use Sign up first for a new email, or continue with Google." : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: "Google sign-in failed", description: String((result.error as any)?.message ?? ""), variant: "destructive" });
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground">
            ✂
          </div>
          <h1 className="text-2xl font-bold">ProTailor</h1>
          <p className="text-sm text-muted-foreground">Measure Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full font-semibold">
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>

          <div className="relative my-2 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button type="button" variant="outline" disabled={loading} onClick={handleGoogle} className="h-11 w-full font-medium">
            Continue with Google
          </Button>

          <p className="pt-2 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have one?"}{" "}
            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-primary hover:underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">Sign in with the same email on any device to sync your data.</p>
      </div>
    </div>
  );
}
