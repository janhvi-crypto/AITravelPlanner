import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/auth-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/services/api";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — AI Travel Planner for India" },
      {
        name: "description",
        content:
          "Sign in to plan smarter trips across India with weather-aware AI itineraries, budgets, food guides and packing lists.",
      },
      { property: "og:title", content: "Sign in — AI Travel Planner for India" },
      {
        property: "og:description",
        content: "Weather-aware AI travel itineraries, budgets and food guides across India.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      // POST {VITE_API_BASE_URL}/auth/login  |  /auth/signup  (Supabase auth)
      const { data } =
        mode === "signin"
          ? await authApi.login(email, password)
          : await authApi.signup(name, email, password);

      if ((data as { needsEmailConfirmation?: boolean })?.needsEmailConfirmation || !data?.token) {
        toast.info("Check your email to confirm, then sign in", {
          description: "Or disable Confirm email in Supabase → Authentication → Providers → Email.",
        });
        setMode("signin");
        return;
      }

      saveSession(data.user ?? { name: name || email.split("@")[0], email }, data.token);
      toast.success(mode === "signin" ? "Signed in" : "Account created");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        ax?.response?.data?.message ||
        ax?.message ||
        "Could not reach the backend. Is it running on port 5000?";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <img
        src={heroImage}
        alt="Taj Mahal reflected in a water channel at dusk"
        width={1600}
        height={1104}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/72" />

      <section className="relative w-full max-w-lg">
        <h1 className="font-display text-5xl leading-tight sm:text-6xl">AI Travel Planner</h1>
        <h2 className="mt-6 text-xl font-semibold">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Plan smarter trips with weather-aware AI recommendations across India.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {mode === "signup" && (
            <div>
              <Label className="label-caps" htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                className="mt-2 h-12 bg-background/40"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label className="label-caps" htmlFor="email">
              User
            </Label>
            <Input
              id="email"
              type="email"
              className="mt-2 h-12 bg-background/40"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="label-caps" htmlFor="password">
              Pwd
            </Label>
            <Input
              id="password"
              type="password"
              className="mt-2 h-12 bg-background/40"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            className="font-semibold text-primary underline underline-offset-4"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </section>
    </main>
  );
}
