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

export default function App() {
  return (
    // reducedMotion="user" makes Framer Motion honor prefers-reduced-motion
    // (its JS-driven transform/opacity animations ignore the CSS media query).
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
  );
}
