import React from 'react';


const Services = () => {
  // 1. Arreglo de servicios (Potenciado para Gate Force)
  const serviceData = [
    {
      id: 1,
      icon: "bi-people-fill",
      title: "Gestión 360° del Empleado",
      desc: "Centralización total del ciclo de vida del colaborador. Desde el onboarding hasta la gestión de beneficios y perfiles dinámicos.",
      features: [
        "Expedientes digitales seguros",
        "Estructura organizacional fluida"
      ]
    },
    {
      id: 2,
      icon: "bi-clock-history",
      title: "Control de Acceso y Asistencia",
      desc: "Sistema de fichaje inteligente con validación biométrica y geolocalización para equipos presenciales y remotos.",
      features: [
        "Reportes de puntualidad automáticos",
        "Gestión de turnos y horas extra"
      ]
    },
    {
      id: 3,
      icon: "bi-cpu-fill",
      title: "IA de Reconocimiento Emocional",
      desc: "Algoritmos avanzados que analizan el sentimiento y clima laboral para identificar inconformidad o riesgos de bajo rendimiento.",
      features: [
        "Detección temprana de burnout",
        "Análisis de bienestar en tiempo real"
      ]
    },
    {
      id: 4,
      icon: "bi-file-earmark-lock2",
      title: "Bóveda de Documentación",
      desc: "Gestión documental",
      features: [
        "Gestión de documentos",
        "Acceso jerárquico por roles"
      ]
    }
  ];

  return (
    <section id="services" className="py-5 gate-force-section">
      <div className="container py-5">

        {/* 2. ENCABEZADO */}
        <div className="row align-items-center mb-5 pb-3">

          {/* Distintivo izquierdo */}
          <div className="col-lg-2 d-none d-lg-block">
            <span className="gf-badge">
              <span className="text-accent me-2">●</span> GATE FORCE
            </span>
          </div>

          {/* Título y descripción central */}
          <div className="col-lg-8 text-center">
            <h2 className="display-5 fw-bold text-white mb-3">
              Infraestructura <span className="text-accent highlight-text">Inexpugnable</span> <br />
              para tu Tranquilidad
            </h2>
            <p className=" mx-auto description-text">
              Desplegamos ecosistemas de seguridad física y electrónica. Soluciones modulares diseñadas con precisión técnica para erradicar vulnerabilidades en infraestructuras críticas.
            </p>
          </div>

          {/* Flecha gigante decorativa a la derecha */}
          <div className="col-lg-2 text-end d-none d-lg-block decorative-icon">
            <i className="bi bi-shield-check text-accent"></i>
          </div>

        </div>

        {/* 3. REJILLA DE TARJETAS DE SERVICIO */}
        <div className="row g-4 justify-content-center">
          {serviceData.map((service) => (
            <div key={service.id} className="col-xl-3 col-lg-4 col-md-6">
              <div className="service-card h-100 d-flex flex-column">

                {/* Ícono de la tarjeta */}
                <div className="icon-wrapper mb-4">
                  <i className={`bi ${service.icon} text-accent`}></i>
                </div>

                {/* Título y Descripción */}
                <h4 className="fw-bold text-white mb-3">{service.title}</h4>
                <p className=" small mb-4 flex-grow-1">{service.desc}</p>

                {/* Lista de características */}
                <ul className="service-feature-list mb-4">
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <i className="bi bi-check-circle-fill text-accent me-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Botón inferior */}
                <a href="#contacto" className="service-btn-outline mt-auto">
                  <span>Implementar Solución</span>
                  <i className="bi bi-arrow-right-short fs-4"></i>
                </a>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;