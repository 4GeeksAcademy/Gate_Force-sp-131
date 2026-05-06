import { memo } from "react";

const BRAND_LOGOS = [
    { name: "Vortex", icon: <i className="bi bi-hexagon-fill" /> },
    { name: "Nimbus Co.", icon: <i className="bi bi-cloud-fill" /> },
    { name: "Apex Group", icon: <i className="bi bi-triangle-fill" /> },
    { name: "Lumen", icon: <i className="bi bi-lightbulb-fill" /> },
    { name: "Forge", icon: <i className="bi bi-tools" /> },
    { name: "Zenith", icon: <i className="bi bi-bullseye" /> },
    { name: "Orbit", icon: <i className="bi bi-globe2" /> },
    { name: "Pulse", icon: <i className="bi bi-activity" /> },
];

const LogoCarousel = () => {
    const track = [...BRAND_LOGOS, ...BRAND_LOGOS];
    return (
        <div className="rts-brand-area">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <p className="brand-caption">Trusted by leading companies worldwide</p>
                        <div className="brand-scroll-mask">
                            <div className="brand-scroll-track">
                                {track.map((b, i) => (
                                    <div key={i} className="brand-item">
                                        {b.icon}
                                        <span>{b.name}</span>
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

export default memo(LogoCarousel);
