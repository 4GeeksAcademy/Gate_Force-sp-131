import { memo } from "react";
import { Link } from "react-router-dom";

const ArrowIcon = () => (
    <svg width="22" height="22" viewBox="6 6 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 6V7.5H15.4425L6 16.9425L7.0575 18L16.5 8.5575V18H18V6H6Z" fill="currentColor" />
    </svg>
);

const RatingStars = () => (
    <span className="rating-stars" aria-label="5 stars">
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
    </span>
);

const AboutUs = () => {
    return (
        <div id="about" className="rts-about-area about-14">
            {/* Decorative world-map watermark */}
            <div className="map" aria-hidden="true">
                <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.2" fill="rgba(255,107,0,0.18)" />
                        </pattern>
                    </defs>
                    <ellipse cx="400" cy="200" rx="380" ry="170" fill="url(#dots)" />
                </svg>
            </div>

            <div className="container">
                <div className="section-title text-center">
                    <span className="pre-title">About Us</span>
                    <h2 className="title">
                        Your Trusted Workforce<br />
                        <span>Growth</span> Partner
                    </h2>
                </div>

                <div className="row justify-content-center">
                    <div className="col-xl-10">
                        <div className="about-wrapper-area">

                            <div className="video-area">
                                <img
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop"
                                    alt="GateForce team"
                                    loading="lazy"
                                />
                                <a href="#about" className="icon" aria-label="Play intro video">
                                    <svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M21 11.27a2 2 0 0 1 0 3.46L4 24.66A2 2 0 0 1 1 22.93V3.07A2 2 0 0 1 4 1.34l17 9.93Z" fill="#001D21" />
                                    </svg>
                                </a>
                            </div>

                            <div className="bottom-area">
                                <div className="content">
                                    <div className="review-count">
                                        <div className="review">
                                            <RatingStars />
                                            <p className="desc">Based on 167 reviews</p>
                                        </div>
                                        <div className="counts">
                                            <h2 className="title">
                                                <span className="counter">15</span>+
                                            </h2>
                                            <p className="desc">Years of Excellence</p>
                                        </div>
                                    </div>
                                    <p className="desc">
                                        We're a team of passionate engineers and HR specialists
                                        helping companies unlock their workforce's full potential
                                        through smart technology.
                                    </p>
                                </div>
                                <Link to="/signup" className="rts-btn btn-primary-7 radius-6">
                                    Discover Our Story
                                    <ArrowIcon />
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(AboutUs);
