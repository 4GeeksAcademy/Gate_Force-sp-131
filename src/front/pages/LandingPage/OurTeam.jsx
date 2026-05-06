import { memo } from "react";

const TeamArrow = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M0 0V1.5H9.4425L0 10.9425L1.0575 12L10.5 2.5575V12H12V0H0Z" fill="currentColor" />
    </svg>
);

const GithubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22 6 12 13 2 6" />
    </svg>
);

const TEAM = [
    {
        name: "Joel Maya",
        designation: "General Director",
        image: "/team/joel.jpg",
        github: "https://github.com/jmaya2002",
        email: "joel@gateforce.com",
    },
    {
        name: "Luis Sarmientos",
        designation: "Lead Engineer",
        image: "/team/luis.jpg",
        github: "https://github.com/dudunesto",
        email: "luis@gateforce.com",
    },
    {
        name: "Jesus Gomez",
        designation: "Biometrics Specialist",
        image: "/team/jesus.jpg",
        github: "https://github.com/Chaguan17",
        email: "jesus@gateforce.com",
    },
];

const OurTeam = () => {
    return (
        <div id="team" className="rts-team-area team-14">
            <div className="container">

                <div className="rts-section-title-area">
                    <div className="section-title">
                        <span className="pre-title">Our Team</span>
                        <h2 className="title">
                            The Experts Behind<br />
                            Your <span>Workforce</span> Growth
                        </h2>
                    </div>
                    <a href="#team" className="tm-btn">
                        <span>View All</span>
                        <TeamArrow />
                    </a>
                </div>

                <div className="rts-team-wrapper">
                    <div className="row g-4">
                        {TEAM.map(({ name, designation, image, github, email }) => (
                            <div key={name} className="col-lg-4 col-md-6">
                                <div className="single-team">
                                    <div className="thumb">
                                        <a href="#team">
                                            <img src={image} alt={name} loading="lazy" />
                                        </a>
                                    </div>
                                    <div className="content">
                                        <div className="team-social">
                                            <a
                                                href={github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="team-link"
                                                aria-label={`${name} on GitHub`}
                                            >
                                                <GithubIcon />
                                                <span>GitHub</span>
                                            </a>
                                            <a
                                                href={`mailto:${email}`}
                                                className="team-link"
                                                aria-label={`Email ${name}`}
                                            >
                                                <MailIcon />
                                                <span>Email</span>
                                            </a>
                                        </div>
                                        <div className="info-area">
                                            <div className="info-details">
                                                <a href="#team">
                                                    <h4 className="title">{name}</h4>
                                                </a>
                                                <span className="designation">{designation}</span>
                                            </div>
                                            <a
                                                href={github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="team-icon"
                                                aria-label={`See ${name}'s GitHub profile`}
                                            >
                                                <TeamArrow />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default memo(OurTeam);
