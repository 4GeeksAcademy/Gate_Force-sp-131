import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-5" style={{ backgroundColor: 'var(--gf-bg-dark)' }}>
      <div className="container pt-4 pb-4">
        
        {/* SECCIÓN SUPERIOR: Llamado a la acción y Suscripción */}
        <div className="row gy-5 align-items-center justify-content-between mb-5 pb-4 border-bottom border-secondary">
          <div className="col-lg-6">
            <h2 className="display-5 fw-bold text-white mb-0">
              ¿Listo para Proteger tu <br />
              Infraestructura? <span className="text-accent" style={{ fontStyle: 'italic' }}>Hablemos.</span>
            </h2>
          </div>
          <div className="col-lg-5 col-xl-4">
            <form className="d-flex flex-column gap-3">
              <input 
                type="email" 
                className="footer-input shadow-none" 
                placeholder="Ingresa tu correo electrónico..." 
                required 
              />
              <button type="submit" className="btn btn-gf-primary d-flex justify-content-between align-items-center w-100 mt-2">
                <span>Agendar Auditoría Gratuita</span>
                <i className="bi bi-arrow-up-right"></i>
              </button>
            </form>
          </div>
        </div>

        {/* SECCIÓN MEDIA: Enlaces de navegación e Información */}
        <div className="row gy-5 mb-5">
          
          {/* Columna 1: Soluciones */}
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-widget-title">Soluciones</h6>
            <ul className="footer-list">
              <li><a href="#services">Control Biométrico</a></li>
              <li><a href="#services">Portones Industriales</a></li>
              <li><a href="#services">Cercados Eléctricos</a></li>
              <li><a href="#services">Ecosistema de Gestión</a></li>
            </ul>
          </div>

          {/* Columna 2: Oficina */}
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-widget-title">Oficina Central</h6>
            <ul className="footer-list">
              <li><span className="text-white">Calle Pacifico, 45<br />Madrid, España.</span></li>
              <li className="mt-3"><a href="mailto:soporte@gateforce.com">soporte@gateforce.com</a></li>
            </ul>
          </div>

          {/* Columna 3: Logo y Redes Sociales */}
          <div className="col-lg-4 col-md-6 mt-lg-0 mt-5">
            <Link to="/" className="text-decoration-none mb-3 d-inline-block">
              <h3 className="fw-bold text-white mb-0">
                <span className="text-accent">GATE</span> FORCE
              </h3>
            </Link>
            <div className="footer-social-links mt-3">
              <a href="#facebook"><i className="bi bi-facebook"></i></a>
              <a href="#linkedin"><i className="bi bi-linkedin"></i></a>
              <a href="#twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#youtube"><i className="bi bi-youtube"></i></a>
            </div>
          </div>

        </div>

        {/* SECCIÓN INFERIOR: Copyright y Legales */}
        <div className="row align-items-center footer-bottom-border pt-4 pb-2">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            {/* El año se actualiza dinámicamente con Javascript */}
            <p className=" small mb-0">
              GATE FORCE - Copyright © {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item me-4"><a href="#terms" className=" text-decoration-none">Términos y Condiciones</a></li>
              <li className="list-inline-item"><a href="#privacy" className=" text-decoration-none">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;