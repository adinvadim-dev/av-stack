import * as motion from "motion/react-client";
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
  Database,
  KeyRound,
  Layers,
  Paintbrush,
  Server,
  Sparkles,
  TestTube,
  Zap,
} from "lucide-react";

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
  testing: <TestTube className="size-4" />,
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
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <h1 className="mb-4 text-5xl font-bold tracking-tight motion-preset-slide-up">
          AV Stack
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

      {/* Animation demo */}
      <div className="mb-16 text-center">
        <h2 className="mb-8 text-2xl font-semibold">Animation Demo</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="motion-preset-bounce" size="lg">
            motion-preset-bounce
          </Button>
          <Button variant="secondary" className="motion-preset-shake" size="lg">
            motion-preset-shake
          </Button>
          <Button variant="outline" className="motion-preset-pulse" size="lg">
            motion-preset-pulse
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Powered by tailwindcss-motion + motion.dev
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Built with ❤️ ·{" "}
          <a
            href="https://github.com/adinvadim-dev/av-stack"
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
