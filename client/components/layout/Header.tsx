import { Link, NavLink } from "react-router-dom";
import { Waves, AlertTriangle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

export default function Header() {
  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("token");
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Waves className="h-5 w-5" />
          </span>
           <div className="flex flex-col leading-tight">
    <p className="font-extrabold tracking-tight text-lg">Ocean Guard</p>
    <p className="text-xs text-muted-foreground">Stay Alert. Stay Safe.</p>
  </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Home</NavLink>
          <NavLink to="/alerts" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Alerts</NavLink>
          <NavLink to="/community" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Community</NavLink>
          <NavLink to="/report" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Report</NavLink>
          <div className="h-5 w-px bg-border" />
          {!isLoggedIn ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Login</NavLink>
              <NavLink to="/signup" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Signup</NavLink>
            </>
          ) : (
            <NavLink to="/profile" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>My Profile</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link to="/community#report"><AlertTriangle className="mr-2" /> Report</Link>
          </Button>

          {/* Mobile hamburger menu */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Waves className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <p className="font-extrabold tracking-tight">Ocean Guard</p>
                    <p className="text-xs text-muted-foreground">Stay Alert. Stay Safe.</p>
                  </div>
                </div>
                <nav className="mt-6 grid gap-3">
                  <NavLink to="/" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>Home</NavLink>
                  <NavLink to="/alerts" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>Alerts</NavLink>
                  <NavLink to="/community" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>Community</NavLink>
                  <NavLink to="/report" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>Report</NavLink>
                  <div className="h-px bg-border my-2" />
                  {!isLoggedIn ? (
                    <>
                      <NavLink to="/login" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>Login</NavLink>
                      <NavLink to="/signup" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>Signup</NavLink>
                    </>
                  ) : (
                    <NavLink to="/profile" className={({ isActive }) => `rounded-md px-3 py-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>My Profile</NavLink>
                  )}
                  <Button asChild className="mt-2">
                    <Link to="/community#report"><AlertTriangle className="mr-2" /> Report Incident</Link>
                  </Button>
                </nav>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
