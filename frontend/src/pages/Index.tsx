import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedBoats } from "@/components/FeaturedBoats";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedBoats />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;