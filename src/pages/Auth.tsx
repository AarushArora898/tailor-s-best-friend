import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getFriendlyErrorMessage, isInvalidCredentialsError, withRetry } from "@/lib/retry";

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
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    void import("@/pages/Dashboard");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateAuth(email, password);
    if (parsed.ok === false) {
      toast({ title: parsed.error, variant: "destructive" });
      return;
    }
    setLoading(true);
    setStatusText("");
    try {
      if (mode === "signup") {
        const { error } = await withRetry(() => supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: { emailRedirectTo: window.location.origin },
        }), {
          retries: 3,
          onRetry: () => setStatusText("Backend is waking up. Retrying..."),
        });
        if (error) throw error;
        let activeSession = await refreshSession();
        if (!activeSession) {
          const { error: signInError } = await withRetry(() => supabase.auth.signInWithPassword({
            email: parsed.email,
            password: parsed.password,
          }), {
            retries: 3,
            onRetry: () => setStatusText("Still connecting. Retrying..."),
          });
          if (signInError) throw signInError;
          activeSession = await refreshSession();
        }
        if (!activeSession) throw new Error("Account created. Please sign in once with the same email and password.");
        toast({ title: "Account ready", description: "You're signed in." });
      } else {
        const { error } = await withRetry(() => supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        }), {
          retries: 3,
          onRetry: () => setStatusText("Backend is waking up. Retrying..."),
        });
        if (error) {
          if (isInvalidCredentialsError(error)) {
            setMode("signup");
            toast({
              title: "Create your account first",
              description: "I switched this form to Sign Up. Press the button once to create your account with this email.",
            });
            return;
          }
          throw error;
        }
        const activeSession = await refreshSession();
        if (!activeSession) throw new Error("Sign-in did not finish. Please try again.");
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({
        title: isInvalidCredentialsError(err) ? "Wrong password or account not created" : getFriendlyErrorMessage(err),
        description: isInvalidCredentialsError(err) ? "Use Sign Up for a new email, or check the password for an existing account." : undefined,
        variant: "destructive",
      });
    } finally {
      setStatusText("");
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
            {loading ? statusText || "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
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
