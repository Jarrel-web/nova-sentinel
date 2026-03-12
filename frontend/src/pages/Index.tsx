import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import FeaturesSection from "@/components/FeaturesSection";
import WorkflowSection from "@/components/WorkflowSection";
import UsersSection from "@/components/UsersSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <UploadSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <WorkflowSection />
      <UsersSection />
      <Footer />
    </div>
  );
};

export default Index;
