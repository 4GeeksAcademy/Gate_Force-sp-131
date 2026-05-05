import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        // Barra fijada en la parte superior, transparente y con un z-index alto para estar sobre todo
        <nav className="navbar navbar-expand-lg fixed-top bg-transparent pt-4" style={{ zIndex: 10 }}>
            <div className="container">

                {/* Logo de Gate Force */}
                <Link className="navbar-brand fw-bold text-white" to="/">
                    <span className="text-accent">GATE</span> FORCE
                </Link>

                {/* Botón de menú tipo hamburguesa para pantallas móviles */}
                <button className="navbar-toggler shadow-none border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Enlaces de navegación centrales */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto align-items-center">
                        {/* 
              Cada href apunta al ID de la sección correspondiente en la misma página.
              Usamos fw-semibold para que la letra tenga un poco más de grosor.
            */}
                        <li className="nav-item">
                            <a className="nav-link text-white px-3 fw-semibold" href="#about">About Us</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white px-3 fw-semibold" href="#services">Services</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white px-3 fw-semibold" href="#team">OurTeam</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white px-3 fw-semibold" href="#faq">FAQ</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white px-3 fw-semibold" href="#contact">Contact Us</a>
                        </li>
                    </ul>

                    {/* Botón de acción a la derecha */}
                    <div className="d-flex mt-3 mt-lg-0">
                        <Link to="/login" className="btn btn-gf-primary rounded-1">
                            Portal de Gestión <i className="bi bi-arrow-up-right ms-1"></i>
                        </Link>
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;