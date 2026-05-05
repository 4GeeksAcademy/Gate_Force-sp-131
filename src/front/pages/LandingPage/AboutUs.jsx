import React from 'react';

const AboutUs = () => {
    // Arreglo de datos para la sección de contadores inferiores
    const counters = [
        { id: 1, number: "15", text: "Años de Experiencia" },
        { id: 2, number: "236", text: "Proyectos Instalados" },
        { id: 3, number: "33k", text: "Accesos Diarios" },
        { id: 4, number: "16", text: "Certificaciones" }
    ];

    return (
        <section id="about" className="py-5" style={{ backgroundColor: 'var(--gf-bg-secondary)' }}>
            <div className="container py-5">

                {/* 1. TÍTULO CENTRADO */}
                <div className="text-center mb-5">
                    <span className="text-accent fw-bold text-uppercase tracking-wider">Sobre Nosotros</span>
                    <h2 className="display-4 fw-bold mt-2 text-white">
                        Tu Socio <span style={{ fontStyle: 'italic', color: 'var(--gf-accent)' }}>Confiable</span> en <br />
                        Crecimiento y Seguridad
                    </h2>
                </div>

                {/* 2. CONTENEDOR PRINCIPAL DEL VIDEO/IMAGEN */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-10">
                        <div className="position-relative">

                            {/* Imagen principal (Fondo del video) */}
                            <img
                                src="https://placehold.co/1200x600/1e293b/f8fafc?text=Video+Background"
                                alt="Gate Force Video"
                                className="img-fluid rounded w-100 shadow-lg"
                                style={{ objectFit: 'cover', minHeight: '400px' }}
                            />

                            {/* Botón de Play (Centrado absoluto) */}
                            <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 2 }}>
                                <a href="#play" className="text-decoration-none">
                                    <div className="video-play-btn">
                                        <i className="bi bi-play-fill"></i>
                                    </div>
                                </a>
                            </div>

                            {/* Tarjeta Flotante (Esquina inferior izquierda superpuesta) */}
                            <div
                                className="position-absolute floating-review-card shadow-lg"
                                // Usamos bottom negativo y left para que sobresalga un poco de la imagen, tal como en tu referencia
                                style={{ bottom: '-30px', left: '20px', maxWidth: '280px' }}
                            >
                                <div className="mb-2">
                                    <i className="bi bi-star-fill"></i> Trustpilot
                                </div>
                                <div className="d-flex mb-1">
                                    <i className="bi bi-star-fill text-dark"></i>
                                    <i className="bi bi-star-fill text-dark"></i>
                                    <i className="bi bi-star-fill text-dark"></i>
                                    <i className="bi bi-star-fill text-dark"></i>
                                    <i className="bi bi-star-fill text-dark"></i>
                                </div>
                                <p className="small mb-3">Basado en 167 reseñas</p>
                                <h3 className="fw-bold mb-0">15+</h3>
                                <p className="small mb-0">Años, Misión y Valores</p>
                            </div>

                        </div>

                        {/* Texto descriptivo y botón (Debajo de la imagen, alineado a la derecha) */}
                        <div className="row mt-5 pt-3">
                            <div className="col-lg-5 offset-lg-7 d-flex flex-column align-items-start">
                                <p className=" lead mb-4">
                                    Somos un equipo de ingenieros y auditores apasionados por ayudar a las empresas a proteger su infraestructura operativa y desbloquear su máximo potencial.
                                </p>
                                <button className="btn btn-gf-primary">
                                    Conoce Nuestra Historia <i className="bi bi-arrow-up-right ms-2"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. SECCIÓN DE CONTADORES INFERIORES */}
                <div className="row justify-content-center mt-5">
                    <div className="col-lg-10">
                        <div className="row g-4">
                            {counters.map((item) => (
                                <div key={item.id} className="col-md-3 col-6">
                                    {/* Panel de cristal para cada contador */}
                                    <div className="glass-panel text-center p-4 h-100 d-flex flex-column justify-content-center">
                                        <h2 className="counter-number fw-bold mb-1">
                                            {item.number}<span className="text-accent">+</span>
                                        </h2>
                                        <span className="counter-text fw-bold">{item.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutUs;