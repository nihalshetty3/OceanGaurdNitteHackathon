import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import AlertCard, { type AlertItem, type AlertType } from "@/components/AlertCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Small shadcn-like inputs (project already includes these components)

const DISASTER_TYPES: AlertType[] = ["Flood", "Earthquake", "Cyclone", "Tsunami", "Other"];

type Report = AlertItem & { photo?: string; createdAt: string };

export default function Community() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filterType, setFilterType] = useState<"All" | AlertType>("All");
  const [filterDate, setFilterDate] = useState<"All" | "Today">("All");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
  
    const title = String(data.get("title") || "").trim();
    const description = String(data.get("description") || "").trim();
    const location = String(data.get("location") || "").trim();
    const type = String(data.get("type") || "Other") as AlertType;
    const file = data.get("photo") as File | null;
  
    if (!title || !description || !location) return;
  
    try {
      // Send to backend
      const res = await fetch("http://localhost:5000/api/hazards/add", {
        method: "POST",
        body: data, // FormData includes file if present
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        console.error("Backend error:", result);
        alert("Failed to submit report: " + (result.error || "Unknown error"));
        return;
      }
  
      // Add locally for instant UI update
      let photoUrl: string | undefined;
      if (file && file.size > 0) {
        // Use backend uploaded photo path
        photoUrl = `http://localhost:5000/uploads/${result.hazard.photo}`;
      }
  
      const item: Report = {
        id: result.hazard._id, // use MongoDB ID
        type,
        severity: "info",
        location,
        time: new Date().toLocaleString(),
        description,
        photo: photoUrl,
        createdAt: new Date().toISOString(),
      };
  
      setReports((prev) => [item, ...prev]);
      e.currentTarget.reset();
      if (fileRef.current) fileRef.current.value = "";
  
      alert("✅ Hazard report submitted successfully!");
  
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Failed to connect to server");
    }
  };
  

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const typeOk = filterType === "All" || r.type === filterType;
      const dateOk =
        filterDate === "All" || new Date(r.createdAt).toDateString() === new Date().toDateString();
      return typeOk && dateOk;
    });
  }, [reports, filterType, filterDate]);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.1fr]">
      <section id="report" className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Reporting</h1>
          <p className="text-muted-foreground">Submit incidents to alert nearby communities and authorities.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4 md:p-6 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., Road flooded near beach" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="Flood">
                <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {DISASTER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Provide details that can help others stay safe" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="City, area or coordinates" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <Input ref={fileRef} id="photo" name="photo" type="file" accept="image/*" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="px-6">Submit Report</Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Community Reports</h2>
            <p className="text-muted-foreground">Filter by type or date.</p>
          </div>
          <div className="flex gap-3">
            <Select onValueChange={(v) => setFilterType(v as any)} defaultValue="All">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {DISASTER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => setFilterDate(v as any)} defaultValue="All">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Date" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Dates</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
              No reports yet. Be the first to submit a community report.
            </div>
          ) : (
            filtered.map((r) => <AlertCard key={r.id} item={r} />)
          )}
        </div>
      </section>
    </div>
  );
}
