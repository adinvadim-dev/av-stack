import * as motion from "motion/react-client";
import { Link } from "@tanstack/react-router";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Database,
  Github,
  KeyRound,
  Layers,
  Paintbrush,
  Server,
  Sparkles,
  TestTube,
  Undo2,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { authClient } from "@/lib/auth-client";

interface StackItem {
  name: string;
  description: string;
  category: string;
}

interface StackDemoProps {
  greeting?: string;
  stackItems?: StackItem[];
  isLoading: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  build: <Layers className="size-4" />,
  framework: <Server className="size-4" />,
  ui: <Sparkles className="size-4" />,
  language: <Zap className="size-4" />,
  api: <Zap className="size-4" />,
  auth: <KeyRound className="size-4" />,
  database: <Database className="size-4" />,
  styling: <Paintbrush className="size-4" />,
  components: <Sparkles className="size-4" />,
  animation: <Sparkles className="size-4" />,
  tooling: <TestTube className="size-4" />,
  testing: <Icon icon="mdi:test-tube" className="size-4" />,
};

const categoryColors: Record<string, string> = {
  build: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  framework: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  ui: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  language: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  api: "bg-green-500/10 text-green-700 dark:text-green-400",
  auth: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  database: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  styling: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  components: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  animation: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  tooling: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  testing: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
};

export function StackDemo({ greeting, stackItems, isLoading }: StackDemoProps) {
  const { data: session } = authClient.useSession();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="mb-6 flex items-center justify-end gap-2">
        {session?.user ? (
          <Button
            variant="outline"
            onClick={() => {
              toast.promise(authClient.signOut(), {
                loading: "Signing out...",
                success: "Signed out",
                error: "Failed to sign out",
              });
            }}
          >
            Sign out
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
        <ThemeToggle withLabel />
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          TypeScript Starter
        </h1>
        <p className="mb-2 text-xl text-muted-foreground">
          Production-ready monorepo template
        </p>
        {isLoading ? (
          <Skeleton className="mx-auto h-6 w-64" />
        ) : (
          <p className="text-lg font-medium text-primary">
            {greeting}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          ↑ served via tRPC
        </p>
        <div className="mt-5">
          <Button asChild variant="outline">
            <Link to="/admin/users">
              Open Admin Panel
            </Link>
          </Button>
        </div>
      </motion.div>

      <Separator className="mb-12" />

      {/* Stack grid */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          The Stack
        </h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stackItems?.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={categoryColors[item.category] ?? ""}
                      >
                        {categoryIcons[item.category]}
                        <span className="ml-1">{item.category}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Separator className="mb-12" />

      <div className="mb-16">
        <h2 className="mb-3 text-center text-2xl font-semibold">Icons</h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground">
          This starter supports both Lucide and Iconify, so you can use familiar
          Lucide components or pull icons from almost any collection.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lucide (component)</CardTitle>
              <CardDescription>Use as regular React components</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
              <Github className="size-5 text-foreground" />
              <span>`import {"{"} Github {"}"} from "lucide-react"`</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Iconify (any set)</CardTitle>
              <CardDescription>Use one API for many collections</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon icon="mdi:github" className="size-5 text-foreground" />
              <span>`&lt;Icon icon="mdi:github" /&gt;`</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="mb-12" />

      {/* Sonner Toast Demo */}
      <div className="mb-16">
        <h2 className="mb-3 text-center text-2xl font-semibold">
          <Bell className="mb-1 mr-2 inline-block size-6" />
          Toast Notifications
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground">
          Custom-styled Sonner toasts with accent borders, glass backdrop, and
          full CSS variable integration. Try the different variants below.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <p className="text-sm font-medium">Basic types</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.success("Changes saved", {
                      description: "Your settings have been updated.",
                    })
                  }
                >
                  Success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.error("Something went wrong", {
                      description: "Please try again later.",
                    })
                  }
                >
                  Error
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.warning("Careful!", {
                      description: "This action cannot be undone.",
                    })
                  }
                >
                  Warning
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.info("Did you know?", {
                      description: "You can customize these toasts.",
                    })
                  }
                >
                  Info
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <p className="text-sm font-medium">Promise toast</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.promise(
                    new Promise<{ name: string }>((resolve) =>
                      setTimeout(() => resolve({ name: "Deployment" }), 2000)
                    ),
                    {
                      loading: "Deploying to production...",
                      success: (data) => `${data.name} completed!`,
                      error: "Deploy failed",
                    }
                  );
                }}
              >
                Simulate deploy
              </Button>
              <p className="text-xs text-muted-foreground">
                Shows loading, then success after 2s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <p className="text-sm font-medium">With undo action</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast("Item deleted", {
                    description: "The record was removed from the database.",
                    action: {
                      label: "Undo",
                      onClick: () => toast.success("Restored!"),
                    },
                  });
                }}
              >
                <Undo2 className="mr-1 size-3.5" />
                Delete with undo
              </Button>
              <p className="text-xs text-muted-foreground">
                Click "Undo" inside the toast to restore
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="mb-12" />

      {/* Animation demo */}
      <div className="mb-16 text-center">
        <h2 className="mb-8 text-2xl font-semibold">Animation Demo</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg">
            Subtle reveal
          </Button>
          <Button variant="secondary" size="lg">
            Smooth transition
          </Button>
          <Button variant="outline" size="lg">
            Interactive state
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Powered by motion.dev
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Built with ❤️ ·{" "}
          <a
            href="https://github.com/your-org/your-repo"
            className="underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
