import { Shield, Siren, Users, Map, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Incident = {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  location: string;
  reportedAt: string;
  status: "open" | "acknowledged" | "resolved";
};

const SAMPLE_INCIDENTS: Incident[] = [
  { id: "INC-1024", type: "Cyclone", severity: "warning", location: "Bay of Bengal", reportedAt: "5m ago", status: "acknowledged" },
  { id: "INC-1023", type: "Flood", severity: "critical", location: "Kochi, KL", reportedAt: "16m ago", status: "open" },
  { id: "INC-1019", type: "Earthquake", severity: "info", location: "Gujarat", reportedAt: "1h ago", status: "resolved" },
];

export default function Authorities() {
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
            <CardTitle className="text-3xl">7</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Across coastal regions</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Severity</CardDescription>
            <CardTitle className="text-3xl">2</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Immediate attention needed</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Acknowledged</CardDescription>
            <CardTitle className="text-3xl">4</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Assigned to response teams</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved (24h)</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
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
              {SAMPLE_INCIDENTS.map((inc) => (
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
                  <TableCell>{inc.reportedAt}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}


