import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  className?: string;
}

export function StatCard({ title, value, trend, trendUp, icon, className }: StatCardProps) {
  return (
    <div className={cn("glass-panel p-6 rounded-2xl relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <span className="text-muted-foreground text-sm font-medium mb-1">{title}</span>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">{value}</h3>
        {trend && (
          <div className={cn(
            "text-xs font-mono px-2 py-1 rounded-full w-fit flex items-center gap-1",
            trendUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          )}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
