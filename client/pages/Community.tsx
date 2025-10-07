import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Community() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community Reporting</h1>
        <p className="text-muted-foreground">Choose the type of report you want to submit.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link to="/criminalreport" className="block">
          <Button variant="default" className="w-full">Submit Criminal Report</Button>
        </Link>
        <Link to="/municipalityreport" className="block">
          <Button variant="secondary" className="w-full">Submit Municipality Report</Button>
        </Link>
        <Link to="/oceanreport" className="block">
          <Button variant="outline" className="w-full">Submit Ocean Report</Button>
        </Link>
      </div>
    </div>
  );
}