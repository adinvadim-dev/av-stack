import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      toast.error("Name is required for sign up");
      return;
    }

    await toast.promise(
      (mode === "signin"
        ? authClient.signIn.email({ email, password })
        : authClient.signUp.email({ name: name.trim(), email, password }))
        .then(async (result) => {
          if (result.error) {
            throw new Error(result.error.message ?? "Authentication failed");
          }
          await navigate({ to: "/admin/users" });
        }),
      {
        loading: mode === "signin" ? "Signing in..." : "Creating account...",
        success: mode === "signin" ? "Signed in" : "Account created",
        error: mode === "signin" ? "Sign in failed" : "Sign up failed",
      },
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Use your credentials to access the admin area."
              : "Create your first account to start using this starter."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button onClick={submit} className="w-full">
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="underline underline-offset-4"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
            <Link to="/" className="underline underline-offset-4">
              Back home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
