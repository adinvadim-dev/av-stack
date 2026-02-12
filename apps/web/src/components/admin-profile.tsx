import { useEffect, useState } from "react";
import { Calendar, Hash, Mail, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
}

export interface AdminProfileProps {
  user: ProfileUser | null | undefined;
  onSaveProfile: (input: { name: string; email: string }) => Promise<void>;
  isSaving: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AdminProfile({ user, onSaveProfile, isSaving }: AdminProfileProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user?.name, user?.email]);

  const isDirty = name.trim() !== (user?.name ?? "") || email.trim() !== (user?.email ?? "");

  return (
    <div className="mx-auto max-w-3xl space-y-0">
      <div className="grid gap-6 py-8 md:grid-cols-[260px_1fr]">
        <div>
          <h3 className="text-sm font-semibold">Personal Information</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Keep your profile up to date. These values are used in admin and audit trails.
          </p>
        </div>
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 text-lg">
              <AvatarFallback>{getInitials(name || "U")}</AvatarFallback>
            </Avatar>
            <Badge variant="outline">Managed by account settings</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Display name</Label>
            <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email address</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button
            onClick={() => onSaveProfile({ name: name.trim(), email: email.trim() })}
            disabled={!isDirty || isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 py-8 md:grid-cols-[260px_1fr]">
        <div>
          <h3 className="text-sm font-semibold">Account</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Read-only account metadata and current permissions.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{user?.email ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="size-4 text-muted-foreground" />
            <Badge variant={user?.role === "superuser" ? "default" : "secondary"}>{user?.role ?? "unknown"}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="size-4 text-muted-foreground" />
            <span className="font-mono text-xs">{user?.id?.slice(0, 16) ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{user?.createdAt ? fmtDate(user.createdAt) : "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
