import React from 'react';

const LogoCarousel = () => {
    // 1. Definimos las rutas de tus logos en un arreglo.
    // Aquí usamos las rutas exactas que venían en tu HTML original.
    const brands = [
        "assets/images/brand/1.svg",
        "assets/images/brand/2.svg",
        "assets/images/brand/3.svg",
        "assets/images/brand/4.svg",
        "assets/images/brand/5.svg",
        "assets/images/brand/6.svg",
    ];

    // 2. Duplicamos el arreglo para que el efecto de CSS funcione sin saltos
    const displayBrands = [...brands, ...brands];

    return (
        // Usamos el color de fondo oscuro de nuestra plantilla Gate Force
        <div className="py-5" style={{ backgroundColor: 'var(--gf-bg-dark)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">

                        {/* Contenedor principal de la animación */}
                        <div className="brand-scroll-wrapper">
                            <div className="brand-scroll-track">

                                {/* 3. Recorremos (map) el arreglo para crear las imágenes dinámicamente */}
                                {displayBrands.map((logoUrl, index) => (
                                    <div key={index} className="single-brand">
                                        <img
                                            src={logoUrl}
                                            alt={`Logo Empresa ${index + 1}`}
                                            className="img-fluid"
                                            // Este filtro es un truco excelente:
                                            // Convierte cualquier logo negro en blanco para que se vea en fondo oscuro
                                            style={{ filter: 'brightness(0) invert(1)' }}
                                        />
                                    </div>
                                ))}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoCarousel;