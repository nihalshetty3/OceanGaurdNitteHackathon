import { Button } from "@/components/ui/button";
import { Waves, AlertTriangle, Tornado, Activity } from "lucide-react";
import AlertCard, { type AlertItem } from "@/components/AlertCard";
import OceanMap, { type MapMarker } from "@/components/OceanMap";
import { Link } from "react-router-dom";

const SAMPLE_ALERTS: AlertItem[] = [
  {
    id: "1",
    type: "Cyclone",
    severity: "warning",
    location: "Bay of Bengal",
    time: "5 min ago",
    description: "Cyclonic system forming off the coast, expected high winds and heavy rainfall.",
  },
  {
    id: "2",
    type: "Flood",
    severity: "critical",
    location: "Kochi, Kerala",
    time: "12 min ago",
    description: "Water levels rising rapidly near backwaters. Avoid low-lying routes.",
  },
  {
    id: "3",
    type: "Earthquake",
    severity: "info",
    location: "Gujarat coastline",
    time: "30 min ago",
    description: "Mild tremors recorded. No tsunami warning at this time.",
  },
];

const MAP_MARKERS: MapMarker[] = [
  { id: "m1", position: [9.9312, 76.2673], title: "Urban Flooding", type: "Flood" },
  { id: "m2", position: [19.076, 72.8777], title: "Cyclone Watch", type: "Cyclone" },
  { id: "m3", position: [22.2587, 71.1924], title: "Tremors", type: "Earthquake" },
];

export default function Index() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-sky-700 shadow-sm">
              <Waves className="h-4 w-4" /> Ocean Guard
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Stay Alert. Stay Safe.
            </h1>
            <p className="text-muted-foreground max-w-prose">
              Live disaster alerts, community reporting, and an interactive map to help you navigate emergencies with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="px-6">
                <Link to="/community#report"><AlertTriangle className="mr-2" /> Report an Incident</Link>
              </Button>
              <Button asChild variant="outline" className="px-6">
                <Link to="/alerts">View Live Alerts</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                  <Tornado />
                </div>
                <p className="mt-3 text-sm font-semibold">Cyclone Watch</p>
                <p className="text-xs text-muted-foreground">Bay of Bengal</p>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-700">
                  <AlertTriangle />
                </div>
                <p className="mt-3 text-sm font-semibold">Flood Warning</p>
                <p className="text-xs text-muted-foreground">Kochi, IN</p>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                  <Activity />
                </div>
                <p className="mt-3 text-sm font-semibold">Tremors</p>
                <p className="text-xs text-muted-foreground">Gujarat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Alerts + Map */}
      <section className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Live Alert Feed</h2>
            <p className="text-sm text-muted-foreground">Realtime updates from trusted sources and the community.</p>
          </div>
          <div className="grid gap-3">
            {SAMPLE_ALERTS.map((a) => (
              <AlertCard key={a.id} item={a} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Interactive Map</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/community#report">Add Marker via Report</Link>
            </Button>
          </div>
          <OceanMap markers={MAP_MARKERS} center={[20.5937, 78.9629]} zoom={4} />
        </div>
      </section>
    </div>
  );
}
