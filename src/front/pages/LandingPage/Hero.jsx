import React from 'react';

const Hero = () => {
    return (
        // min-vh-100 hace que ocupe todo el alto de la pantalla. flex-column nos ayuda a empujar el título abajo.
        <section className="hero-fullscreen d-flex flex-column" style={{ minHeight: '100vh' }}>

            {/* Capa de color oscuro */}
            <div className="hero-overlay"></div>

            {/* Contenedor del contenido (Flexbox para distribuir el espacio) */}
            <div className="container hero-content-wrapper d-flex flex-column flex-grow-1">

                {/* Espacio para empujar el contenido hacia el centro verticalmente */}
                <div className="flex-grow-1 d-flex align-items-center mt-5 pt-5">
                    <div className="row w-100">
                        <div className="col-lg-5 col-md-8">

                            {/* Sección de avatares y calificación (Trusted by...) */}
                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex me-3">
                                    {/* Avatares falsos usando CSS circles */}
                                    <div className="rounded-circle border border-2 border-dark" style={{ width: '35px', height: '35px', backgroundColor: '#94a3b8', zIndex: 3 }}></div>
                                    <div className="rounded-circle border border-2 border-dark ms-n2" style={{ width: '35px', height: '35px', backgroundColor: '#cbd5e1', zIndex: 2, marginLeft: '-10px' }}></div>
                                    <div className="rounded-circle border border-2 border-dark ms-n2" style={{ width: '35px', height: '35px', backgroundColor: '#e2e8f0', zIndex: 1, marginLeft: '-10px' }}></div>
                                </div>
                                <div>
                                    <h6 className="text-white mb-1 small fw-bold">Confiado por más de 120 Empresas</h6>
                                    <div className="text-warning small">
                                        <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-half"></i>
                                        <span className="text-white ms-2">4.5 (989)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Texto Descriptivo */}
                            <p className="text-white mb-5" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                                Desbloquea el máximo potencial de la seguridad de tu empresa con automatización de accesos adaptada a tus metas únicas. Construyamos una infraestructura más inteligente y fuerte—juntos.
                            </p>

                            {/* Botones de acción */}
                            <div className="d-flex align-items-center flex-wrap gap-4">
                                <button className="btn btn-gf-primary btn-lg rounded-1 fs-6">
                                    Obtener Consultoría <i className="bi bi-arrow-up-right ms-1"></i>
                                </button>
                                <div className="d-flex align-items-center text-white">
                                    <i className="bi bi-telephone text-accent fs-4 me-2"></i>
                                    <a href="tel:+1554555471" className="text-white text-decoration-none fw-bold">(+34)60388712</a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Texto Gigante en la parte inferior */}
                <div className="pb-4">
                    {/* display-1 es la clase más grande de texto en Bootstrap */}
                    <h1 className="display-1 fw-bold text-white text-center mb-0" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>
                        Seguridad <span className="text-accent" style={{ fontStyle: 'italic' }}>Total</span> Comienza Aquí
                    </h1>
                </div>

            </div>
        </section>
    );
};

export default Hero;