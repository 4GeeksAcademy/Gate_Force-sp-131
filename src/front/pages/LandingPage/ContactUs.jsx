import React from 'react';

const ContactUs = () => {
    const contactInfo = [
        {
            id: 1,
            icon: "bi-envelope-paper",
            title: "Soporte Técnico",
            desc: "soporte@gateforce.com"
        },
        {
            id: 2,
            icon: "bi-geo-alt",
            title: "Sede Principal",
            desc: "Calle Pacifico, 45 Madrid, España."
        },
        {
            id: 3,
            icon: "bi-clock-history",
            title: "Atención y Monitoreo",
            desc: "Lunes - Viernes: 8:00 AM - 6:00 PM (Monitoreo 24/7)"
        }
    ];

    return (
        <section id="contact" className="py-5" style={{ backgroundColor: 'var(--gf-bg-dark)' }}>
            <div className="container py-4">

                {/* La gran tarjeta contenedora (equivalente al fondo celeste de tu imagen) */}
                <div className="glass-panel p-4 p-lg-5 rounded-4 border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <div className="row g-5 align-items-center justify-content-between">

                        {/* Columna Izquierda: Textos y Botón */}
                        <div className="col-lg-6">

                            {/* Distintivo Superior */}
                            <span className="gf-badge mb-4">
                                <span className="text-accent me-2">•</span> CONTACTO
                            </span>

                            {/* Título Principal */}
                            <h2 className="display-5 fw-bold text-white mb-4">
                                Conectemos y <span className="text-accent" style={{ fontStyle: 'italic' }}>Aseguremos</span> <br />
                                tu Infraestructura
                            </h2>

                            {/* Descripción */}
                            <p className="mb-5">
                                Estamos aquí para evaluar las vulnerabilidades de tu perímetro, diseñar ecosistemas de acceso automatizados y proteger tus instalaciones. Escríbenos o solicita una revisión técnica de tus instalaciones.
                            </p>

                            {/* Botón de Acción */}
                            <button className="btn btn-gf-primary btn-lg d-inline-flex align-items-center gap-2">
                                Solicitar Auditoría
                                <i className="bi bi-arrow-up-right"></i>
                            </button>

                        </div>

                        {/* Columna Derecha: Lista de Información de Contacto */}
                        <div className="col-lg-5">
                            <div className="d-flex flex-column gap-4">

                                {contactInfo.map((item) => (
                                    <div key={item.id} className="d-flex align-items-center gap-4">
                                        {/* Caja del ícono */}
                                        <div className="contact-icon-box">
                                            <i className={`bi ${item.icon}`}></i>
                                        </div>
                                        {/* Textos de contacto */}
                                        <div>
                                            <h6 className="fw-bold text-white mb-1">{item.title}</h6>
                                            <p className="small mb-0" style={{ maxWidth: '250px' }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default ContactUs;