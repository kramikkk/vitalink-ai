import AboutSection from "@/components/landing/about-section"
import FAQs from "@/components/landing/faqs-section"
import FeaturesSection from "@/components/landing/features-section"
import FooterSection from "@/components/landing/footer"
import HeroSection from "@/components/landing/hero-section"
import LogoCloud from "@/components/landing/logo-cloud"
import TeamSection from "@/components/landing/team"
const LandingPage = () => {
  return (
    <div >
      <HeroSection />
      <LogoCloud />
      <FeaturesSection />
      <FAQs />
      <AboutSection />
      <TeamSection />
      <FooterSection />
    </div>
  )
}

export default LandingPage