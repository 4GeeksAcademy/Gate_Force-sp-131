import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Services from './Services';
import LogoCarousel from './LogoCarousel';
import AboutUs from './AboutUs';
import OurTeam from './OurTeam';
import FAQ from './FAQ';
import ContactUs from './ContactUs';
import Footer from './Footer';


// Aquí importaremos el resto de componentes en el futuro:
// import LogoCarousel from './LogoCarousel';
// import AboutUs from './AboutUs';

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* 1. Barra de Navegación */}
      <Navbar />

      {/* 2. Sección Principal de Impacto */}
      <Hero />

      {/* 3. Carrusel de Logos (Espacio reservado) */}
      <LogoCarousel />
      <AboutUs />

      {/* 4. Servicios */}
      <Services />

      {/* Espacios reservados para las siguientes secciones */}

      <OurTeam />
      <FAQ />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default LandingPage;