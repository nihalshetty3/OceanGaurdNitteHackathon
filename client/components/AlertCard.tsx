import { cn } from "@/lib/utils";
import { AlertTriangle, Waves, Activity, Tornado } from "lucide-react";

export type AlertType = "Flood" | "Earthquake" | "Cyclone" | "Tsunami" | "Other";

export interface AlertItem {
  id: string;
  type: AlertType;
  severity: "info" | "warning" | "critical";
  location: string;
  time: string; // ISO or human-readable
  description: string;
}

const typeIcon = (type: AlertType) => {
  switch (type) {
    case "Flood":
    case "Tsunami":
      return Waves;
    case "Earthquake":
      return Activity;
    case "Cyclone":
      return Tornado;
    default:
      return AlertTriangle;
  }
};

const severityClasses: Record<AlertItem["severity"], string> = {
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
};

export default function AlertCard({ item }: { item: AlertItem }) {
  const Icon = typeIcon(item.type);
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md",
      "ring-1 ring-inset",
      item.severity === "critical" ? "ring-red-200" : item.severity === "warning" ? "ring-amber-200" : "ring-sky-200",
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md", severityClasses[item.severity])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{item.type}</p>
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              item.severity === "critical" ? "bg-red-100 text-red-800 border-red-200" : item.severity === "warning" ? "bg-amber-100 text-amber-900 border-amber-200" : "bg-sky-100 text-sky-800 border-sky-200",
            )}>
              {item.severity.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
          <p className="text-sm"><span className="text-muted-foreground">Location:</span> {item.location}</p>
        </div>
      </div>
    </div>
  );
}
