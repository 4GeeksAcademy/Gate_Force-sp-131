import { memo, useState } from "react";

const ArrowIcon = () => (
    <svg width="22" height="22" viewBox="6 6 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 6V7.5H15.4425L6 16.9425L7.0575 18L16.5 8.5575V18H18V6H6Z" fill="currentColor" />
    </svg>
);

const CONTACT_INFO = [
    {
        icon: "bi-envelope-paper",
        title: "Support Email",
        desc: "support@gateforce.com",
        href: "mailto:support@gateforce.com",
    },
    {
        icon: "bi-geo-alt-fill",
        title: "Headquarters",
        desc: "Calle Pacífico, 45 — Madrid, Spain",
        href: null,
    },
    {
        icon: "bi-clock-history",
        title: "Working Hours",
        desc: "Monday – Friday, 8:00 AM – 6:00 PM",
        href: null,
    },
];

const ContactUs = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <div id="contact" className="rts-contact-area">
            <div className="container">
                <div className="contact-card">
                    <div className="row g-5 align-items-center">

                        {/* LEFT: title + contact info */}
                        <div className="col-lg-6">
                            <span className="pre-title">Contact</span>
                            <h2 className="title">
                                Let's <span>Connect</span><br />
                                and Build Together
                            </h2>
                            <p className="desc">
                                Reach out for a personalized demo, integration questions or
                                to schedule a workforce-readiness audit. Our team responds
                                within 24 hours.
                            </p>

                            <div className="contact-info-list">
                                {CONTACT_INFO.map(({ icon, title, desc, href }) => (
                                    <div key={title} className="contact-info-item">
                                        <div className="info-icon">
                                            <i className={`bi ${icon}`} />
                                        </div>
                                        <div className="info-text">
                                            <h6>{title}</h6>
                                            {href ? (
                                                <a href={href}>{desc}</a>
                                            ) : (
                                                <p>{desc}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: form */}
                        <div className="col-lg-6">
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <h3 className="form-title">Send us a message</h3>

                                <div className="form-row">
                                    <label>
                                        <span>Your Name</span>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="form-row">
                                    <label>
                                        <span>Email Address</span>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="form-row">
                                    <label>
                                        <span>Your Message</span>
                                        <textarea
                                            rows="4"
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            placeholder="Tell us about your team's needs..."
                                            required
                                        />
                                    </label>
                                </div>

                                {sent && (
                                    <div className="form-success">
                                        <i className="bi bi-check-circle-fill" /> Message sent. We'll get back to you soon.
                                    </div>
                                )}

                                <button type="submit" className="rts-btn btn-primary-7 radius-6">
                                    Send Message
                                    <ArrowIcon />
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ContactUs);
