import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-skeleton-pulse rounded-md bg-muted/50 dark:bg-muted/30", className)}
      {...props}
    />
  )
}

export { Skeleton }
