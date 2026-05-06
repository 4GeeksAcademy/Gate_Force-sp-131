import { memo } from "react";

const FAQ_DATA = [
    {
        id: "faq-q1",
        question: "How does the time-tracking system work for remote employees?",
        answer:
            "Our smart check-in system uses GPS geolocation and biometric validation, working seamlessly for on-site, hybrid and fully-remote teams. Each entry is timestamped and linked to a verified location.",
    },
    {
        id: "faq-q2",
        question: "Can GateForce integrate with my existing payroll software?",
        answer:
            "Yes. We expose a RESTful API that synchronizes attendance, schedules and role-based permissions with the most popular ERPs and HR systems. Integration takes minutes, not weeks.",
    },
    {
        id: "faq-q3",
        question: "How long does it take to onboard my company?",
        answer:
            "A typical onboarding takes 2 to 5 business days. Our team handles employee imports, role configuration and initial training so your operations are never disrupted.",
    },
    {
        id: "faq-q4",
        question: "Is my employees' data secure?",
        answer:
            "All data is encrypted in transit and at rest, stored in EU-compliant data centers and protected with strict role-based access controls. We are GDPR-compliant and audit-ready.",
    },
    {
        id: "faq-q5",
        question: "Can I manage multiple branches from one dashboard?",
        answer:
            "Yes. The GateForce platform is cloud-based. A global administrator can monitor attendance metrics, grant credentials and view real-time alerts across all your locations from a single dashboard.",
    },
];

const FAQ = () => {
    return (
        <div id="faq" className="rts-faq-area">
            <div className="container">
                <div className="row align-items-center g-5">

                    {/* LEFT: Image + floating badge */}
                    <div className="col-lg-5">
                        <div className="faq-thumbnail">
                            <img
                                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop"
                                alt="GateForce team"
                                loading="lazy"
                            />
                            <div className="faq-floating-card">
                                <div className="floating-head">
                                    <i className="bi bi-shield-check" />
                                    <span>ISO Certified</span>
                                </div>
                                <div className="floating-stars">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <i key={i} className="bi bi-star-fill" />
                                    ))}
                                </div>
                                <p className="floating-desc">
                                    Based on +500 successful workforce deployments worldwide.
                                </p>
                                <span className="floating-brand">GATEFORCE</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Section title + Accordion */}
                    <div className="col-lg-7">
                        <div className="accordion-area">
                            <div className="title-area">
                                <span className="pre-title">FAQ</span>
                                <h2 className="title">
                                    Got <span>Questions?</span><br />
                                    We've Got Answers.
                                </h2>
                                <p className="desc">
                                    Everything you need to know about deploying GateForce in
                                    your organization.
                                </p>
                            </div>

                            <div className="accordion accordion-one-inner" id="faqAccordion">
                                {FAQ_DATA.map((item, index) => (
                                    <div className="accordion-item" key={item.id}>
                                        <h2 className="accordion-header" id={`heading-${item.id}`}>
                                            <button
                                                className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#${item.id}`}
                                                aria-expanded={index === 0 ? "true" : "false"}
                                                aria-controls={item.id}
                                            >
                                                <span className="q-num">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <span className="q-text">{item.question}</span>
                                            </button>
                                        </h2>
                                        <div
                                            id={item.id}
                                            className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                            aria-labelledby={`heading-${item.id}`}
                                            data-bs-parent="#faqAccordion"
                                        >
                                            <div className="accordion-body">{item.answer}</div>
                                        </div>
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

export default memo(FAQ);
