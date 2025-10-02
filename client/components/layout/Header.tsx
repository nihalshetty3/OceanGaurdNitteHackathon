import { Link, NavLink } from "react-router-dom";
import { Waves, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Waves className="h-5 w-5" />
          </span>
          <div className="-space-y-1">
            <p className="font-extrabold tracking-tight text-lg leading-none">Ocean Guard</p>
            <p className="text-xs text-muted-foreground leading-none">Stay Alert. Stay Safe.</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Home</NavLink>
          <NavLink to="/alerts" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Alerts</NavLink>
          <NavLink to="/community" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Community</NavLink>
          <NavLink to="/report" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Report</NavLink>
          <div className="h-5 w-px bg-border" />
          <NavLink to="/login" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Login</NavLink>
          <NavLink to="/signup" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Signup</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link to="/community#report"><AlertTriangle className="mr-2" /> Report</Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="md:hidden">
            <Link to="/community#report"><AlertTriangle /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
