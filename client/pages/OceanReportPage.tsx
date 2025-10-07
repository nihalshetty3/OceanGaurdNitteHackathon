// client/src/pages/OceanReportPage.tsx

import React, { FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react"; 

// --- PLACEHOLDER DATA & LOGIC ---
const OCEAN_REPORT_TYPES = ["Oil Spill", "Marine Life Distress", "Pollution/Debris", "Unusual Algae", "Other"];
const filteredReports: any[] = []; 

const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  alert("✅ Ocean Report submitted! (Prototype functionality)");
  e.currentTarget.reset();
};
// --------------------------------

export default function OceanReportPage() {
  
  return (
    // Uses the same 3:1 grid ratio (lg:col-span-3 and lg:col-span-1)
    <div className="container mx-auto py-10 grid gap-10 lg:grid-cols-4"> 
      
      {/* LEFT COLUMN: OCEAN REPORT FORM (Spans 3 of 4 columns) */}
      <section id="report" className="space-y-4 lg:col-span-3"> 
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ocean Reporting</h1>
          <p className="text-muted-foreground">Submit reports on marine pollution, environmental hazards, or distressed wildlife.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="rounded-xl border bg-card p-4 md:p-6 shadow-sm space-y-4">
          
          {/* Title and Type Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., Oil slick sighting" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="Oil Spill">
                <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {OCEAN_REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Provide details, size, and approximate location/coordinates." required />
          </div>

          {/* Location and Pincode Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Area Location</Label>
              <Input id="location" name="location" placeholder="Beach/Coast or Coordinates (e.g., 12.9716, 77.5946)" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Nearest Pincode</Label>
              <Input id="pincode" name="pincode" placeholder="e.g., 575003" required type="number" pattern="\d{6}" maxLength={6} />
            </div>
          </div>
          
          {/* Photo Field */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo (Optional)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="px-6">Submit Ocean Report</Button>
          </div>
        </form>
      </section>

       {/* RIGHT COLUMN: COMMUNITY REPORTS SECTION (Spans 1 of 4 columns) */}
           <section className="space-y-4 lg:col-span-1">
             <div className="flex flex-wrap items-end justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-bold tracking-tight">Community Reports</h2>
                 <p className="text-muted-foreground">Filter by type or date.</p>
               </div>
               <div className="flex gap-3">
                 {/* Type Filter Placeholder */}
                 <Select>
                   <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="All">All Types</SelectItem>
                   </SelectContent>
                 </Select>
                 {/* Date Filter Placeholder */}
                 <Select>
                   <SelectTrigger className="w-[200px]"><SelectValue placeholder="Date" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="All">All Dates</SelectItem>
                     <SelectItem value="Today">Today</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
     
             <div className="grid gap-4">
               {filteredReports.length === 0 ? (
                 <div className="rounded-lg border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                   <AlertTriangle className="h-10 w-100 mx-auto mb-2 text-primary" />
                   No criminal reports submitted yet. Be the first to report an incident.
                 </div>
               ) : (
                 filteredReports.map((r) => <div key={r.id}>Report Card for {r.title}</div>) 
               )}
             </div>
           </section>
         </div>
       );
     }