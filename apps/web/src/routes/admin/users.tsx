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
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const usersQueryOptions = trpc.admin.users.queryOptions();
  const profileQueryOptions = trpc.admin.profile.queryOptions();
  const auditLogQueryOptions = trpc.admin.auditLog.queryOptions();

  const usersQuery = useQuery(usersQueryOptions);

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
            <CardDescription>Standard users</CardDescription>
            <CardTitle className="text-3xl">{Math.max(usersCount - superusersCount, 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

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
