import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Studio from "./components/Studio";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { trackVisit } from "./lib/track";
import { SiteProvider } from "./lib/siteContent";

export default function PublicSite() {
  // Log one visit per page load (source / referrer / device captured inside).
  useEffect(() => {
    trackVisit("/");
  }, []);

  return (
    <SiteProvider>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-paper text-ink">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Gallery />
          <Studio />
          <Contact />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
      </MotionConfig>
    </SiteProvider>
  );
}
