import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-secondary/60">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">Ocean Guard</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A modern disaster alert & reporting platform. Minimal, trustworthy, and user-friendly.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Helplines</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><span className="font-medium">Emergency:</span> 112</li>
            <li><span className="font-medium">Disaster Mgmt:</span> 108</li>
            <li><span className="font-medium">Coast Guard:</span> +91 1554</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/alerts" className="hover:underline">Live Alerts</Link></li>
            <li><Link to="/community" className="hover:underline">Community</Link></li>
            <li><Link to="/community#report" className="hover:underline">Report Incident</Link></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ocean Guard. All rights reserved.
      </div>
    </footer>
  );
}
