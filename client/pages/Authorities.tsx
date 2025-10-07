import { Shield, Siren, Users, Map, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";

type Incident = {
  id: string;
  type: string;
  // Normalize to lowercase internally
  severity: "info" | "warning" | "critical";
  location: string;
  reportedAt: string; // ISO string
  status: "open" | "acknowledged" | "resolved";
};

export default function Authorities() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchIncidents() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5000/api/hazards/recent", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Failed to load incidents (${res.status})`);
        }
        const data: { success: boolean; incidents: any[] } = await res.json();
        if (!data?.success || !Array.isArray(data.incidents)) {
          throw new Error("Invalid incidents response");
        }
        const normalized: Incident[] = data.incidents.map((it) => ({
          id: String(it.id ?? ""),
          type: String(it.type ?? "Unknown"),
          severity: String(it.severity ?? "info").toLowerCase() as Incident["severity"],
          location: String(it.location ?? "Unknown"),
          reportedAt: String(it.reportedAt ?? new Date().toISOString()),
          status: String(it.status ?? "open").toLowerCase() as Incident["status"],
        }));
        if (isMounted) setIncidents(normalized);
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? "Error loading incidents");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchIncidents();
    return () => {
      isMounted = false;
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
              <Button variant="outline" size="sm" className="gap-2"><Map className="h-4 w-4" /> View Map</Button>
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
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium">{inc.id}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> {inc.type}
                  </TableCell>
                  <TableCell>
                    {inc.severity === "critical" && <Badge variant="destructive">Critical</Badge>}
                    {inc.severity === "warning" && <Badge variant="secondary">Warning</Badge>}
                    {inc.severity === "info" && <Badge>Info</Badge>}
                  </TableCell>
                  <TableCell>{inc.location}</TableCell>
                  <TableCell>{new Date(inc.reportedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {inc.status === "open" && <Badge variant="destructive">Open</Badge>}
                    {inc.status === "acknowledged" && <Badge variant="secondary">Acknowledged</Badge>}
                    {inc.status === "resolved" && <Badge>Resolved</Badge>}
                  </TableCell>
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
    </div>
  );
}


