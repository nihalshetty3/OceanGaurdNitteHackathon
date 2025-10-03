import Header from "./Header";
import Footer from "./Footer";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]">
      <Header />
      <main className="container py-8 md:py-12">{children}</main>
      <Footer />
    </div>
  );
}
