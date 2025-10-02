import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/layout/Layout";
import Community from "@/pages/Community";
import PlaceholderPage from "@/pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<Community />} />
            <Route path="/alerts" element={<PlaceholderPage title="Live Alerts" description="A dedicated alerts dashboard can be added here. For now, view alerts on the homepage." />} />
            <Route path="/report" element={<PlaceholderPage title="Report Incident" description="Use the Community page to submit a report. We can add a standalone report flow here if you prefer." />} />
            <Route path="/login" element={<PlaceholderPage title="Login" description="Clean login/signup forms can be added here. Let me know to build them next." />} />
            <Route path="/signup" element={<PlaceholderPage title="Signup" description="Create an account to save preferences and manage reports. We can implement this next." />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
