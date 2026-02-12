import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    invite: typeof search.invite === "string" ? search.invite : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { invite } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registrationQuery = useQuery(trpc.auth.registration.queryOptions());
  const inviteStatusQuery = useQuery({
    ...trpc.auth.inviteStatus.queryOptions({ token: invite ?? "" }),
    enabled: Boolean(invite),
  });

  const allowSelfRegistration = registrationQuery.data?.allowSelfRegistration ?? true;
  const inviteInfo = inviteStatusQuery.data;
  const hasInviteToken = Boolean(invite);
  const hasValidInvite = inviteInfo?.valid === true;
  const canSignUp = allowSelfRegistration || hasValidInvite;

  useEffect(() => {
    if (!allowSelfRegistration && hasInviteToken) {
      setMode("signup");
    }
  }, [allowSelfRegistration, hasInviteToken]);

  useEffect(() => {
    if (inviteInfo?.valid && !email) {
      setEmail(inviteInfo.email);
    }
  }, [inviteInfo, email]);

  const submit = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      toast.error("Name is required for sign up");
      return;
    }

    if (mode === "signup" && !canSignUp) {
      toast.error("Registration is available only by invite link");
      return;
    }

    await toast.promise(
      (mode === "signin"
        ? authClient.signIn.email({ email, password })
        : authClient.signUp.email({
            name: name.trim(),
            email,
            password,
            ...(invite ? { inviteToken: invite } : {}),
          }))
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
              : canSignUp
                ? "Create your first account to start using this starter."
                : "Registration is disabled. Ask an admin for an invite link."}
          </CardDescription>
          {hasInviteToken && (
            <p className="text-sm text-muted-foreground">
              {hasValidInvite
                ? `Invite for ${inviteInfo.email}`
                : "Invite link is invalid or expired"}
            </p>
          )}
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
              onClick={() => {
                if (mode === "signin" && !allowSelfRegistration) {
                  return;
                }
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="underline underline-offset-4"
            >
              {mode === "signin"
                ? allowSelfRegistration
                  ? "Need an account? Sign up"
                  : "Registration via invite only"
                : "Already have an account? Sign in"}
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
