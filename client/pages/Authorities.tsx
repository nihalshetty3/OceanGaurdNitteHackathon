import { Shield, Siren, Users, Map as MapIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OceanMap, { type MapMarker } from "@/components/OceanMap";
import type { AlertType } from "@/components/AlertCard";

type Incident = {
  id: string;
  type: string;
  // Normalize to lowercase internally
  severity: "info" | "warning" | "critical";
  location: string;
  reportedAt: string; // ISO string
  status: "open" | "acknowledged" | "resolved";
  pincode?: string;
  aiConfidence?: number | null;
};

export default function Authorities() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

    async function loadHazards() {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch only AI-positive hazards for fast display
        const rep = await fetch(`${API_BASE}/api/reports/hazards?minConfidence=0.7`);
        const reports: any[] = await rep.json();

        const normalized: (Incident & { aiConfidence?: number | null })[] = (reports || []).map((r: any) => {
          const conf = typeof r?.ai?.confidence === 'number' ? r.ai.confidence : null;
          let severity: Incident["severity"] = 'info';
          if (typeof conf === 'number') {
            severity = conf >= 0.8 ? 'critical' : conf >= 0.5 ? 'warning' : 'info';
          }
          const locStr = r?.location ? String(r.location) : (r?.pincode || 'Unknown');
          return {
            id: String(r.id ?? r._id ?? ''),
            type: String(r.type ?? 'Unknown'),
            severity,
            location: locStr,
            reportedAt: String(r.createdAt ?? new Date().toISOString()),
            status: 'open',
            pincode: String(r.pincode || ''),
            aiConfidence: conf,
          } as any;
        });
        if (isMounted) setIncidents(normalized);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Error loading incidents');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    // initial load
    loadHazards();
    // poll every 3s for near‑real‑time updates
    const id = setInterval(loadHazards, 3000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  const stats = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter((i) => i.severity === "critical").length;
    const acknowledged = incidents.filter((i) => i.status === "acknowledged").length;
    // Placeholder for resolved in last 24h; here we count all resolved
    const resolved = incidents.filter((i) => i.status === "resolved").length;
    return { total, critical, acknowledged, resolved };
  }, [incidents]);

  // Location mapping for common places in the region
  const locationMap: Record<string, [number, number]> = {
    'goa': [15.2993, 74.1240],
    'mangalore': [12.9141, 74.8560],
    'managlore': [12.9141, 74.8560], // Handle typo
    'karkala': [13.2000, 74.9833],
    'udupi': [13.3409, 74.7421],
    'bangalore': [12.9716, 77.5946],
    'mumbai': [19.0760, 72.8777],
    'chennai': [13.0827, 80.2707],
    'kochi': [9.9312, 76.2673],
    'trivandrum': [8.5241, 76.9366],
    'calicut': [11.2588, 75.7804],
    'kannur': [11.8745, 75.3704],
    'kasargod': [12.4984, 74.9899],
    'dakshina kannada': [12.9141, 74.8560],
    'uttara kannada': [14.5204, 74.6047],
    'udupi district': [13.3409, 74.7421],
    'coastal karnataka': [13.3409, 74.7421],
  };

  // Build map markers from incidents
  const markers: MapMarker[] = useMemo(() => {
    const allowedTypes: AlertType[] = ["Flood", "Earthquake", "Cyclone", "Tsunami", "Oil Spill", "Marine Life Distress", "Poaching", "Unauthorized Vessel", "Unusual Algae", "Other"];
    const toAlertType = (t: string): AlertType => {
      const normalized = t.trim().toLowerCase();
      const match = allowedTypes.find((x) => x.toLowerCase() === normalized);
      return match ?? "Other";
    };
    
    const getLocationCoordinates = (location: string, pincode?: string): [number, number] | null => {
      // First try to parse as lat,lng coordinates
      const parts = location.split(/[,|\s]+/).filter(Boolean);
      if (parts.length >= 2) {
        const lat = Number(parts[0]);
        const lng = Number(parts[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return [lat, lng];
        }
      }
      
      // Try to find in location map
      const normalizedLocation = location.toLowerCase().trim();
      const coords = locationMap[normalizedLocation];
      if (coords) return coords;
      
      // Try partial matches for common patterns
      for (const [key, value] of Object.entries(locationMap)) {
        if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
          return value;
        }
      }
      
      // Default to Goa coordinates if no match found
      return [15.2993, 74.1240];
    };

    return incidents
      .map((inc) => {
        const pos = getLocationCoordinates(inc.location, inc.pincode);
        if (!pos) return null;
        
        // Determine severity based on AI confidence
        let severity: "low" | "medium" | "high" | "critical" = "low";
        if (inc.aiConfidence != null) {
          if (inc.aiConfidence >= 0.8) severity = "critical";
          else if (inc.aiConfidence >= 0.6) severity = "high";
          else if (inc.aiConfidence >= 0.4) severity = "medium";
          else severity = "low";
        }
        
        return {
          id: inc.id,
          position: pos,
          title: `${inc.type} - ${inc.location}`,
          type: toAlertType(inc.type),
          severity,
          confidence: inc.aiConfidence ?? undefined,
          reportedAt: inc.reportedAt,
        } satisfies MapMarker;
      })
      .filter(Boolean) as MapMarker[];
  }, [incidents]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-sky-700" /> Authorities Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Monitor incidents, coordinate response, and manage official updates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> Assign Teams</Button>
          <Button className="gap-2"><Siren className="h-4 w-4" /> Issue Alert</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Incidents</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Across coastal regions</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Severity</CardDescription>
            <CardTitle className="text-3xl">{stats.critical}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Immediate attention needed</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Acknowledged</CardDescription>
            <CardTitle className="text-3xl">{stats.acknowledged}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Assigned to response teams</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved (24h)</CardDescription>
            <CardTitle className="text-3xl">{stats.resolved}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Successfully closed</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Incoming reports and automated detections</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsMapOpen(true)}
              >
                <MapIcon className="h-4 w-4" /> View Map
              </Button>
              <Button size="sm" className="gap-2"><CheckCircle2 className="h-4 w-4" /> Acknowledge All</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading incidents…</div>
          )}
          {error && !isLoading && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!isLoading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc: any, idx) => (
                <TableRow key={inc.id || idx}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> {inc.type}
                  </TableCell>
                  <TableCell>
                    {inc.aiConfidence != null ? (
                      inc.aiConfidence >= 0.7 ? (
                        <Badge variant="destructive">Hazard</Badge>
                      ) : (
                        <Badge>Not hazard</Badge>
                      )
                    ) : (
                      <Badge>Unknown</Badge>
                    )}
                  </TableCell>
                  <TableCell>{inc.location}</TableCell>
                  <TableCell>{new Date(inc.reportedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" /> 
              Hazard Locations Map
              <Badge variant="outline" className="ml-2">{markers.length} incidents</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Critical (≥80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span>High (60-79%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                <span>Medium (40-59%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Low (&lt;40%)</span>
              </div>
            </div>
            <OceanMap markers={markers} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


