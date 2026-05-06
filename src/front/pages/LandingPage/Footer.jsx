import { memo, useState } from "react";
import { Link } from "react-router-dom";

const ArrowIcon = () => (
    <svg width="22" height="22" viewBox="6 6 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 6V7.5H15.4425L6 16.9425L7.0575 18L16.5 8.5575V18H18V6H6Z" fill="currentColor" />
    </svg>
);

const FOOTER_LINKS = {
    Solutions: [
        { label: "Time Tracking", href: "#services" },
        { label: "Payroll Hub", href: "#services" },
        { label: "Schedule Planner", href: "#services" },
        { label: "Wellness Surveys", href: "#services" },
    ],
    Company: [
        { label: "About Us", href: "#about" },
        { label: "Our Team", href: "#team" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "#contact" },
    ],
};

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 4000);
    };

    return (
        <footer className="rts-footer-area">
            <div className="container">

                {/* TOP — CTA + newsletter */}
                <div className="footer-cta">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-7">
                            <h2 className="footer-cta-title">
                                Ready to grow your workforce?<br />
                                <span>Let's talk.</span>
                            </h2>
                        </div>
                        <div className="col-lg-5">
                            <form className="footer-newsletter" onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    placeholder="Enter your email…"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="rts-btn btn-primary-7 radius-6">
                                    Get a Free Audit
                                    <ArrowIcon />
                                </button>
                                {subscribed && (
                                    <p className="newsletter-success">
                                        <i className="bi bi-check-circle-fill" /> Subscribed!
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* MIDDLE — links + brand */}
                <div className="footer-mid">
                    <div className="row g-5">
                        <div className="col-lg-4 col-md-6">
                            <Link to="/" className="footer-brand">
                                <span className="brand-text">
                                    Gate<span className="brand-accent">Force</span>
                                </span>
                            </Link>
                            <p className="footer-tagline">
                                Smart workforce management tools that help teams clock in,
                                get paid and stay aligned — all in one platform.
                            </p>
                            <div className="footer-socials">
                                {[
                                    { icon: "bi-facebook", href: "#facebook", label: "Facebook" },
                                    { icon: "bi-linkedin", href: "#linkedin", label: "LinkedIn" },
                                    { icon: "bi-twitter-x", href: "#twitter", label: "Twitter" },
                                    { icon: "bi-youtube", href: "#youtube", label: "YouTube" },
                                ].map(({ icon, href, label }) => (
                                    <a key={icon} href={href} aria-label={label}>
                                        <i className={`bi ${icon}`} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {Object.entries(FOOTER_LINKS).map(([section, items]) => (
                            <div key={section} className="col-lg-3 col-md-6">
                                <h6 className="footer-widget-title">{section}</h6>
                                <ul className="footer-list">
                                    {items.map(({ label, href }) => (
                                        <li key={label}>
                                            <a href={href}>{label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-widget-title">Office</h6>
                            <ul className="footer-list">
                                <li>Calle Pacífico, 45<br />Madrid, Spain</li>
                                <li>
                                    <a href="mailto:support@gateforce.com">
                                        support@gateforce.com
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BOTTOM — copyright + legal */}
                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} GateForce. All rights reserved.
                    </p>
                    <ul>
                        <li><a href="#terms">Terms &amp; Conditions</a></li>
                        <li><a href="#privacy">Privacy Policy</a></li>
                    </ul>
                </div>

            </div>
        </footer>
    );
};

export default memo(Footer);
