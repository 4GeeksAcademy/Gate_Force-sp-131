import Hero from "./Hero";
import LogoCarousel from "./LogoCarousel";
import AboutUs from "./AboutUs";
import Services from "./Services";
import OurTeam from "./OurTeam";
import FAQ from "./FAQ";
import ContactUs from "./ContactUs";

const LandingPage = () => {
    return (
        <div className="landing-wrapper">
            <Hero />
            <LogoCarousel />
            <AboutUs />
            <Services />
            <OurTeam />
            <FAQ />
            <ContactUs />
        </div>
    );
};

export default LandingPage;
