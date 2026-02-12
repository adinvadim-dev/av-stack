import { Icon as IconifyIcon, type IconProps as IconifyIconProps } from "@iconify/react";
import { cn } from "@/lib/utils";

type IconProps = Omit<IconifyIconProps, "className"> & {
  className?: string;
};

export function Icon({ className, ...props }: IconProps) {
  return <IconifyIcon className={cn("shrink-0", className)} {...props} />;
}
