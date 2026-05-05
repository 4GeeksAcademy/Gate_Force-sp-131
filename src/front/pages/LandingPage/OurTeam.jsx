import React from 'react';

const OurTeam = () => {
  // 1. Arreglo de Datos: Exactamente los 3 miembros de tu equipo
  // He asignado roles sugeridos, puedes modificarlos a tu gusto.
  const teamMembers = [
    { 
      id: 1, 
      name: "Joel Maya", 
      role: "Director General", 
      image: "https://placehold.co/400x500/1e293b/f8fafc?text=Foto+Joel" 
    },
    { 
      id: 2, 
      name: "Luis Sarmientos", 
      role: "Ingeniero Principal", 
      image: "https://placehold.co/400x500/1e293b/f8fafc?text=Foto+Luis" 
    },
    { 
      id: 3, 
      name: "Jesus Gomez", 
      role: "Especialista en Biometría", 
      image: "https://placehold.co/400x500/1e293b/f8fafc?text=Foto+Jesus" 
    }
  ];

  return (
    <section id="team" className="py-5" style={{ backgroundColor: 'var(--gf-bg-secondary)' }}>
      <div className="container py-5">
        
        {/* 2. ENCABEZADO DE LA SECCIÓN */}
        <div className="row align-items-end mb-5">
          <div className="col-lg-8">
            {/* Distintivo (Reutilizamos la clase gf-badge que creamos en Services) */}
            <span className="gf-badge mb-3">
              <span className="text-accent me-2">•</span> NUESTRO EQUIPO
            </span>
            <h2 className="display-6 fw-bold text-white mb-0">
              Conoce a los Expertos Detrás de <br/>
              Tu <span className="text-accent" style={{ fontStyle: 'italic' }}>Seguridad Integral</span>
            </h2>
          </div>
          
          <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
            {/* Botón superior adaptado del HTML original */}
            <button className="btn btn-outline-light d-inline-flex align-items-center gap-2">
              Ver Todos <i className="bi bi-arrow-up-right"></i>
            </button>
          </div>
        </div>

        {/* 3. REJILLA DEL EQUIPO (3 columnas) */}
        <div className="row justify-content-center g-4 mt-2">
          {teamMembers.map((member) => (
            // 'col-lg-4' divide la fila de 12 espacios en 3 bloques iguales
            <div key={member.id} className="col-lg-4 col-md-6">
              <div className="team-card">
                
                {/* Imagen del miembro */}
                <div className="team-image-wrapper">
                  <img src={member.image} alt={member.name} />
                </div>
                
                {/* Redes sociales justo debajo de la imagen */}
                <div className="team-social-links">
                  <a href="#linkedin"><i className="bi bi-linkedin"></i></a>
                  <a href="#twitter"><i className="bi bi-twitter-x"></i></a>
                  <a href="#email"><i className="bi bi-envelope-fill"></i></a>
                </div>
                
                {/* Info y botón de acción (usamos flexbox para separarlos) */}
                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary">
                  <div>
                    <h5 className="fw-bold text-white mb-1">{member.name}</h5>
                    <span className=" small">{member.role}</span>
                  </div>
                  <a href="#perfil" className="team-icon-btn shadow-sm">
                    <i className="bi bi-arrow-up-right"></i>
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default OurTeam;