import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const usersQueryOptions = trpc.admin.users.queryOptions();
  const invitesQueryOptions = trpc.admin.invites.list.queryOptions();
  const profileQueryOptions = trpc.admin.profile.queryOptions();
  const auditLogQueryOptions = trpc.admin.auditLog.queryOptions();

  const usersQuery = useQuery(usersQueryOptions);
  const invitesQuery = useQuery(invitesQueryOptions);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiresInDays, setInviteExpiresInDays] = useState("7");

  const usersCount = usersQuery.data?.items.length ?? 0;
  const superusersCount =
    usersQuery.data?.items.filter((u) => u.role === "superuser").length ?? 0;

  const setRoleMutation = useMutation(
    trpc.admin.setUserRole.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: usersQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: auditLogQueryOptions.queryKey }),
        ]);
      },
    }),
  );

  const createInviteMutation = useMutation(
    trpc.admin.invites.create.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: invitesQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: auditLogQueryOptions.queryKey }),
        ]);
      },
    }),
  );

  const revokeInviteMutation = useMutation(
    trpc.admin.invites.revoke.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: invitesQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: auditLogQueryOptions.queryKey }),
        ]);
      },
    }),
  );

  const inviteBaseUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/auth?invite=`;
  }, []);

  const activeInvitesCount =
    invitesQuery.data?.items.filter((invite) => !invite.usedAt && !invite.revokedAt).length ?? 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-3xl">{usersCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Superusers</CardDescription>
            <CardTitle className="text-3xl">{superusersCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active invites</CardDescription>
            <CardTitle className="text-3xl">{activeInvitesCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Users</CardTitle>
          <CardDescription>
            Create one-time links for registration without email delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                placeholder="user@example.com"
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-days">Expires in days</Label>
              <Input
                id="invite-days"
                type="number"
                min={1}
                max={30}
                value={inviteExpiresInDays}
                onChange={(event) => setInviteExpiresInDays(event.target.value)}
              />
            </div>
            <Button
              disabled={createInviteMutation.isPending}
              onClick={() => {
                const expiresInDays = Number(inviteExpiresInDays);
                const normalizedEmail = inviteEmail.trim().toLowerCase();

                if (!normalizedEmail) {
                  toast.error("Email is required");
                  return;
                }

                if (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 30) {
                  toast.error("Expiry must be a number from 1 to 30");
                  return;
                }

                toast.promise(
                  createInviteMutation
                    .mutateAsync({ email: normalizedEmail, expiresInDays })
                    .then(async (result) => {
                      const inviteUrl = `${inviteBaseUrl}${result.invite.token}`;
                      setInviteEmail("");

                      if (!inviteBaseUrl || typeof navigator === "undefined") {
                        return;
                      }

                      await navigator.clipboard.writeText(inviteUrl);
                    }),
                  {
                    loading: "Creating invite link...",
                    success: "Invite created and copied to clipboard",
                    error: "Failed to create invite",
                  },
                );
              }}
            >
              Create Invite
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitesQuery.data?.items.map((invite) => {
                const inviteUrl = `${inviteBaseUrl}${invite.token}`;
                const isActive = !invite.usedAt && !invite.revokedAt;

                return (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      {invite.usedAt ? (
                        <Badge variant="secondary">Used</Badge>
                      ) : invite.revokedAt ? (
                        <Badge variant="outline">Revoked</Badge>
                      ) : (
                        <Badge>Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(invite.expiresAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!isActive}
                          onClick={() => {
                            toast.promise(navigator.clipboard.writeText(inviteUrl), {
                              loading: "Copying invite link...",
                              success: "Invite link copied",
                              error: "Failed to copy invite link",
                            });
                          }}
                        >
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!isActive || revokeInviteMutation.isPending}
                          onClick={() => {
                            toast.promise(
                              revokeInviteMutation.mutateAsync({ inviteId: invite.id }),
                              {
                                loading: "Revoking invite...",
                                success: "Invite revoked",
                                error: "Failed to revoke invite",
                              },
                            );
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {invitesQuery.data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No invites yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Role access is managed from one place for operational safety.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.data?.items.map((currentUser) => (
                <TableRow key={currentUser.id}>
                  <TableCell>{currentUser.name}</TableCell>
                  <TableCell>{currentUser.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        currentUser.role === "superuser"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentUser.role === "superuser" && <Shield className="size-3.5" />}
                      {currentUser.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          currentUser.role === "user" ||
                          setRoleMutation.isPending
                        }
                        onClick={() => {
                          const previousRole = currentUser.role as "user" | "superuser";
                          toast.promise(
                            setRoleMutation.mutateAsync({
                              userId: currentUser.id,
                              role: "user",
                            }),
                            {
                              loading: `Demoting ${currentUser.name}...`,
                              success: () => `${currentUser.name} is now a user`,
                              error: "Failed to update role",
                              action: previousRole !== "user" ? {
                                label: "Undo",
                                onClick: () =>
                                  setRoleMutation.mutate({
                                    userId: currentUser.id,
                                    role: previousRole,
                                  }),
                              } : undefined,
                            }
                          );
                        }}
                      >
                        Set User
                      </Button>
                      <Button
                        size="sm"
                        disabled={
                          currentUser.role === "superuser" ||
                          setRoleMutation.isPending
                        }
                        onClick={() => {
                          const previousRole = currentUser.role as "user" | "superuser";
                          toast.promise(
                            setRoleMutation.mutateAsync({
                              userId: currentUser.id,
                              role: "superuser",
                            }),
                            {
                              loading: `Promoting ${currentUser.name}...`,
                              success: () => `${currentUser.name} is now a superuser`,
                              error: "Failed to update role",
                              action: previousRole !== "superuser" ? {
                                label: "Undo",
                                onClick: () =>
                                  setRoleMutation.mutate({
                                    userId: currentUser.id,
                                    role: previousRole,
                                  }),
                              } : undefined,
                            }
                          );
                        }}
                      >
                        Set Superuser
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {usersQuery.data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No users found yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
