import { memo } from "react";
import { Link } from "react-router-dom";

const ArrowSmall = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 6V7.5H15.4425L6 16.9425L7.0575 18L16.5 8.5575V18H18V6H6Z" fill="currentColor" />
    </svg>
);

const ArrowUpRight = () => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="28" cy="28" r="27" stroke="#ff6b00" strokeOpacity="0.4" />
        <path d="M19 19V21.5H32.4425L19 34.9425L20.0575 36L33.5 22.5575V36H36V19H19Z" fill="#ff6b00" />
    </svg>
);

const SERVICES = [
    {
        icon: "bi-clock-history",
        title: "Time & Attendance",
        desc: "Smart check-in with GPS, biometric validation and automated overtime tracking for on-site and remote teams.",
        features: ["Geolocation check-in", "Automatic overtime reports"],
    },
    {
        icon: "bi-file-earmark-pdf-fill",
        title: "Payroll Distribution",
        desc: "Centralized payroll hub. Upload, distribute and archive payslips securely with full audit trail per employee.",
        features: ["Cloud document storage", "Per-employee secure access"],
    },
    {
        icon: "bi-calendar3",
        title: "Schedule Planning",
        desc: "Build, assign and rotate work schedules visually. Detect conflicts and balance workload across your teams.",
        features: ["Drag-and-drop planner", "Shift-conflict detection"],
    },
    {
        icon: "bi-heart-pulse-fill",
        title: "Wellness Surveys",
        desc: "Pulse-check your workforce regularly. AI-powered analysis surfaces burnout risk and morale insights early.",
        features: ["Anonymous responses", "Burnout-risk detection"],
    },
];

const Services = () => {
    return (
        <div className="rts-service-area-14 rts-section-gap">
            <div className="bg-14">
                <div className="container">

                    <div className="rts-section-title-area">
                        <span className="pre-title">Services</span>
                        <div className="content">
                            <h2 className="title">
                                Solutions <span>Tailored</span> for<br />
                                Your Business
                            </h2>
                            <p className="desc">
                                We offer a range of workforce management tools designed to
                                solve real business challenges and unlock growth opportunities.
                            </p>
                        </div>
                        <Link to="/signup" className="title-arrow" aria-label="View all services">
                            <ArrowUpRight />
                        </Link>
                    </div>

                    <div className="rts-service-wrapper">
                        <div className="row gy-5 gy-xl-0">
                            {SERVICES.map(({ icon, title, desc, features }) => (
                                <div key={title} className="col-xl-3 col-lg-4 col-md-6">
                                    <div className="single-item">
                                        <div className="icon">
                                            <i className={`bi ${icon}`} />
                                        </div>
                                        <div className="content">
                                            <a href="#services">
                                                <h4 className="title">{title}</h4>
                                            </a>
                                            <p className="desc">{desc}</p>
                                            <ul className="service-list">
                                                {features.map(f => (
                                                    <li key={f}>
                                                        <i className="bi bi-check2 check" />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Link to="/signup" className="service-btn">
                                            <span className="link-text">Learn More</span>
                                            <ArrowSmall />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default memo(Services);
