import FAQs from "@/components/landing/faqs-section"
import FeaturesSection from "@/components/landing/features-section"
import FooterSection from "@/components/landing/footer"
import HeroSection from "@/components/landing/hero-section"
import LogoCloud from "@/components/landing/logo-cloud"
const LandingPage = () => {
  return (
    <div >
      <HeroSection />
      <LogoCloud />
      <FeaturesSection />
      <FAQs />
      <FooterSection />
    </div>
  )
}

export default LandingPage