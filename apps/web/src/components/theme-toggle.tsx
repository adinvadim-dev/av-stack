"use client";

import { useEffect, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type ThemeToggleProps = {
  className?: string;
  withLabel?: boolean;
};

export function ThemeToggle({ className, withLabel = false }: Readonly<ThemeToggleProps>) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? theme ?? "system" : "system";
  const currentIcon =
    selectedTheme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun;
  const CurrentIcon = currentIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={withLabel ? "default" : "icon"}
          className={cn("shrink-0", className)}
          aria-label="Toggle theme"
        >
          <CurrentIcon className="size-4" />
          {withLabel && (
            <span>
              {selectedTheme === "system"
                ? "System"
                : selectedTheme === "dark"
                  ? "Dark"
                  : "Light"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" />
          Light
          {selectedTheme === "light" && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" />
          Dark
          {selectedTheme === "dark" && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="size-4" />
          System
          {selectedTheme === "system" && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
