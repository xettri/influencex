import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ForBrands } from "@/components/landing/ForBrands";
import { ForCreators } from "@/components/landing/ForCreators";
import { Pricing } from "@/components/landing/Pricing";
import { Waitlist } from "@/components/landing/Waitlist";
import { Footer } from "@/components/landing/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05050f]">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ForBrands />
      <ForCreators />
      <Pricing />
      <Waitlist />
      <Footer />
    </div>
  );
}
