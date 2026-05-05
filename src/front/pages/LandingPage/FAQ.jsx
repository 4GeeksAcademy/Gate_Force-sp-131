import React from 'react';

const FAQ = () => {
  // 1. Arreglo de datos con 5 Preguntas Frecuentes sobre Gate Force
  const faqData = [
    {
      id: "collapseOne",
      question: "¿Qué sucede con el control de acceso si hay un corte de energía?",
      answer: "Todos nuestros sistemas y portones industriales están equipados con bancos de baterías UPS de respaldo. Esto garantiza que el ecosistema de gestión y los bloqueos físicos sigan operativos ininterrumpidamente durante emergencias eléctricas."
    },
    {
      id: "collapseTwo",
      question: "¿El sistema biométrico se integra con nuestro software de nómina/RRHH?",
      answer: "Sí, nuestra arquitectura cuenta con APIs RESTful que permiten sincronizar los registros de entrada, salida y permisos basados en roles directamente con los ERPs y sistemas de recursos humanos más utilizados del mercado."
    },
    {
      id: "collapseThree",
      question: "¿Cuánto tiempo toma implementar un portón de alta resistencia?",
      answer: "El tiempo varía según la magnitud de la obra civil requerida. Una instalación estándar toma de 3 a 5 días hábiles, asegurando que las operaciones diarias de su empresa no se vean afectadas drásticamente."
    },
    {
      id: "collapseFour",
      question: "¿Ofrecen planes de mantenimiento preventivo?",
      answer: "Absolutamente. Recomendamos pólizas de mantenimiento trimestral o semestral. Nuestros ingenieros revisan el desgaste mecánico de los motores, calibran los sensores biométricos y actualizan el firmware del ecosistema de gestión."
    },
    {
      id: "collapseFive",
      question: "¿Es posible administrar múltiples sucursales desde un solo portal?",
      answer: "Sí, el ecosistema de Gate Force está basado en la nube. Un administrador global puede monitorear las métricas de acceso, otorgar credenciales y visualizar alertas en tiempo real de todas sus instalaciones a nivel nacional desde un único dashboard."
    }
  ];

  return (
    <section id="faq" className="py-5" style={{ backgroundColor: 'var(--gf-bg-secondary)' }}>
      <div className="container py-5">
        <div className="row g-5 align-items-center justify-content-between">
          
          {/* Columna Izquierda: Tarjeta Visual (Adaptada de tu imagen de referencia) */}
          <div className="col-lg-5">
            <div className="faq-image-wrapper shadow-lg">
              {/* Imagen principal (Placeholder) */}
              <img 
                src="https://placehold.co/600x700/1e293b/f8fafc?text=Ingenieros+GateForce" 
                alt="Soporte Técnico Gate Force" 
                className="img-fluid w-100" 
                style={{ minHeight: '500px', objectFit: 'cover' }}
              />
              
              {/* Panel curvo sobrepuesto en la parte inferior */}
              <div className="faq-review-card">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-shield-check fs-4 me-2"></i>
                  <span className="fw-bold">Certificación Nivel Industrial</span>
                </div>
                <div className="d-flex mb-2">
                  {/* 5 Estrellas Negras */}
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill text-dark me-1"></i>
                  ))}
                </div>
                <p className="small mb-0">Basado en +500 auditorías de seguridad exitosas a nivel nacional.</p>
                <div className="mt-3 text-end">
                   <h5 className="fw-bold mb-0">GATE FORCE</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: El Acordeón de Preguntas */}
          <div className="col-lg-6">
            <div className="mb-5">
              <h2 className="display-5 fw-bold text-white mb-0">¿Tienes Preguntas?</h2>
              <p className=" mt-3">Resolvemos tus dudas sobre la implementación de infraestructura y software de seguridad.</p>
            </div>

            {/* Acordeón de Bootstrap con nuestra clase personalizada gf-accordion */}
            <div className="accordion gf-accordion" id="faqAccordion">
              
              {faqData.map((faq, index) => (
                <div className="accordion-item" key={faq.id}>
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button 
                      // El primer elemento se muestra abierto por defecto (no tiene la clase 'collapsed')
                      className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`} 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#${faq.id}`} 
                      aria-expanded={index === 0 ? "true" : "false"} 
                      aria-controls={faq.id}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div 
                    id={faq.id} 
                    // El primer elemento tiene la clase 'show' para estar visible al cargar
                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                    aria-labelledby={`heading${index}`} 
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      {faq.answer}
                    </div>
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

export default FAQ;