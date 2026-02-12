import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Clock3,
  LayoutGrid,
  Settings2,
  Shield,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc";

type AdminSection = "users" | "settings" | "profile" | "audit";

const sectionLabel: Record<AdminSection, string> = {
  users: "Users",
  settings: "Settings",
  profile: "Profile",
  audit: "Audit Log",
};

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const trpc = useTRPC();
  const location = useLocation();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const isAuthenticated = Boolean(session?.user);

  const usersQuery = useQuery({
    ...trpc.admin.users.queryOptions(),
    enabled: isAuthenticated,
  });
  const settingsQuery = useQuery({
    ...trpc.admin.settings.list.queryOptions(),
    enabled: isAuthenticated,
  });
  const profileQuery = useQuery({
    ...trpc.admin.profile.queryOptions(),
    enabled: isAuthenticated,
  });
  const auditLogQuery = useQuery({
    ...trpc.admin.auditLog.queryOptions(),
    enabled: isAuthenticated,
  });

  const usersCount = usersQuery.data?.items.length ?? 0;
  const superusersCount =
    usersQuery.data?.items.filter((u) => u.role === "superuser").length ?? 0;
  const settingsCount = settingsQuery.data?.items.length ?? 0;
  const auditCount = auditLogQuery.data?.items.length ?? 0;
  const profileUser = profileQuery.data?.user;
  const hasForbiddenError =
    usersQuery.error?.message?.includes("Superuser access required") ||
    settingsQuery.error?.message?.includes("Superuser access required") ||
    profileQuery.error?.message?.includes("Superuser access required") ||
    auditLogQuery.error?.message?.includes("Superuser access required");

  // Derive active section from URL path
  const lastSegment = location.pathname.split("/").filter(Boolean).pop();
  const section: AdminSection =
    lastSegment === "settings" ||
    lastSegment === "profile" ||
    lastSegment === "audit"
      ? lastSegment
      : "users";

  if (isSessionPending) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Checking access</CardTitle>
            <CardDescription>Loading your session...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need an account to open the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth" className="text-sm underline underline-offset-4">
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasForbiddenError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              Your account is authenticated, but only superusers can access admin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="Admin control center">
                <Link to="/admin/users">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Control Center</span>
                    <span className="truncate text-xs">Administration</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={section === "users"} tooltip="Users">
                    <Link to="/admin/users">
                      <Users />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{usersCount}</SidebarMenuBadge>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={section === "settings"} tooltip="Settings">
                    <Link to="/admin/settings">
                      <Settings2 />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{settingsCount}</SidebarMenuBadge>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={section === "audit"} tooltip="Audit log">
                    <Link to="/admin/audit">
                      <Clock3 />
                      <span>Audit Log</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{auditCount}</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Quick View</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Role distribution">
                    <LayoutGrid />
                    <span>Role distribution</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <Shield className="size-4" />
                        <span>Superusers: {superusersCount}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <Users className="size-4" />
                        <span>Users: {Math.max(usersCount - superusersCount, 0)}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Avatar>
                  <AvatarFallback>
                    {(profileUser?.name ?? "AD")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profileUser?.name ?? "Admin"}</span>
                  <span className="truncate text-xs">{profileUser?.email ?? "no-email"}</span>
                </div>
                <Building2 className="ml-auto size-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={section === "profile"} tooltip="Profile">
                <Link to="/admin/profile">
                  <User className="size-4" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to home">
                <Link to="/">
                  <ArrowLeft className="size-4" />
                  <span>Back to Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{sectionLabel[section]}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
