// client/src/pages/CriminalReportPage.tsx

import React, { FormEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { getAuthHeaders, isLoggedIn } from "@/lib/auth"; 

// --- PLACEHOLDER DATA & LOGIC ---
const CRIMINAL_REPORT_TYPES = ["Poaching", "Illegal Dumping", "Unauthorized Vessel", "Other"];
const filteredReports: any[] = []; 
const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

export default function CriminalReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isChecking: boolean;
    isDuplicate: boolean;
    message: string;
  }>({
    isChecking: false,
    isDuplicate: false,
    message: ''
  });

  // Function to check for duplicate reports
  const checkForDuplicate = async (location: string, pincode: string, type: string) => {
    if (!isLoggedIn() || !location || !pincode || !type) {
      setDuplicateCheck({ isChecking: false, isDuplicate: false, message: '' });
      return;
    }

    setDuplicateCheck({ isChecking: true, isDuplicate: false, message: '' });

    try {
      const params = new URLSearchParams({
        location,
        pincode,
        category: 'criminal',
        type
      });

      const res = await fetch(`${API_BASE}/api/reports/check-duplicate?${params}`, {
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setDuplicateCheck({
          isChecking: false,
          isDuplicate: data.isDuplicate,
          message: data.message
        });
      } else {
        setDuplicateCheck({ isChecking: false, isDuplicate: false, message: '' });
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setDuplicateCheck({ isChecking: false, isDuplicate: false, message: '' });
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      alert('Please log in to submit a report.');
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      category: 'criminal',
      title: String(formData.get('title') || ''),
      type: String(formData.get('type') || 'Other'),
      description: String(formData.get('description') || ''),
      location: String(formData.get('location') || ''),
      pincode: String(formData.get('pincode') || ''),
    };

    // Check for duplicates before submitting
    if (duplicateCheck.isDuplicate) {
      alert(`❌ ${duplicateCheck.message}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/reports`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }, 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        
        if (res.status === 409) {
          // Duplicate report error
          alert(`❌ ${data.message || data.error || 'Duplicate report detected'}`);
          return;
        } else if (res.status === 401) {
          // Authentication error
          alert('❌ Please log in again to submit a report.');
          return;
        } else {
          alert(`❌ ${data.error || `Failed (${res.status})`}`);
          return;
        }
      }
      
      // Fire-and-forget: also ingest into hazards DB for authorities
      try {
        await fetch(`${API_BASE}/api/hazard-ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            title: payload.title,
            hazardType: payload.type,
            description: payload.description,
            severity: 'Low',
            pincode: payload.pincode,
            locationText: payload.location
          })
        });
      } catch {}
      
      alert('✅ Criminal Report saved successfully!');
      form.reset();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('❌ Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    // 💥 MODIFIED: Changed grid to 4 columns on large screens to make the form wider (3/4 width)
    <div className="container mx-auto py-10 grid gap-10 lg:grid-cols-4"> 
      
      {/* LEFT COLUMN: CRIMINAL REPORT FORM (Spans 3 of 4 columns) */}
      <section id="report" className="space-y-4 lg:col-span-3"> 
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Criminal Reporting</h1>
          <p className="text-muted-foreground">Submit detailed reports on illegal activities to alert authorities.</p>
          {!isLoggedIn() && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">Please log in to submit a report. You can only submit one report of each type per location per day.</span>
            </div>
          )}
          {isLoggedIn() && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Report Rules:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>One report per type per location per day</li>
                  <li>Example: You can report "Poaching" and "Illegal Dumping" in the same area on the same day</li>
                  <li>But you cannot report "Poaching" twice in the same area on the same day</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="rounded-xl border bg-card p-4 md:p-6 shadow-sm space-y-4">
          
          {/* Title and Type Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., Illegal fishing activity" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                name="type" 
                defaultValue="Poaching"
                onValueChange={(value) => {
                  const form = document.querySelector('form') as HTMLFormElement;
                  const formData = new FormData(form);
                  const location = String(formData.get('location') || '');
                  const pincode = String(formData.get('pincode') || '');
                  checkForDuplicate(location, pincode, value);
                }}
              >
                <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {CRIMINAL_REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Provide details, timing, and specific location information." required />
          </div>

          {/* Location and Pincode Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">City/Area Location</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="City or nearby landmark" 
                required 
                onChange={(e) => {
                  const form = e.target.closest('form') as HTMLFormElement;
                  const formData = new FormData(form);
                  const location = String(formData.get('location') || '');
                  const pincode = String(formData.get('pincode') || '');
                  const type = String(formData.get('type') || '');
                  checkForDuplicate(location, pincode, type);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input 
                id="pincode" 
                name="pincode" 
                placeholder="e.g., 575003" 
                required 
                type="number" 
                pattern="\d{6}" 
                maxLength={6}
                onChange={(e) => {
                  const form = e.target.closest('form') as HTMLFormElement;
                  const formData = new FormData(form);
                  const location = String(formData.get('location') || '');
                  const pincode = String(formData.get('pincode') || '');
                  const type = String(formData.get('type') || '');
                  checkForDuplicate(location, pincode, type);
                }}
              />
            </div>
          </div>
          
          {/* Photo Field */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo (Optional)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>

          {/* Duplicate Check Status */}
          {duplicateCheck.isChecking && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-800">Checking for duplicate reports...</span>
            </div>
          )}
          
          {duplicateCheck.isDuplicate && !duplicateCheck.isChecking && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{duplicateCheck.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              className="px-6" 
              disabled={!isLoggedIn() || isSubmitting || duplicateCheck.isDuplicate || duplicateCheck.isChecking}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Criminal Report'}
            </Button>
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