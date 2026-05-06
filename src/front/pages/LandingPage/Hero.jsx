import { memo } from "react";
import { Link } from "react-router-dom";

const ArrowIcon = () => (
    <svg width="22" height="22" viewBox="6 6 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 6V7.5H15.4425L6 16.9425L7.0575 18L16.5 8.5575V18H18V6H6Z" fill="currentColor" />
    </svg>
);

const AvatarStack = () => (
    <svg width="124" height="40" viewBox="0 0 124 40" xmlns="http://www.w3.org/2000/svg" aria-label="Trusted clients">
        <defs>
            <linearGradient id="av1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="av2" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="av3" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="av4" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
        </defs>
        {[
            { cx: 20, fill: "url(#av1)", letter: "J" },
            { cx: 48, fill: "url(#av2)", letter: "M" },
            { cx: 76, fill: "url(#av3)", letter: "L" },
            { cx: 104, fill: "url(#av4)", letter: "K" },
        ].map(({ cx, fill, letter }, i) => (
            <g key={i}>
                <circle cx={cx} cy="20" r="19" fill="#0f172a" />
                <circle cx={cx} cy="20" r="17" fill={fill} />
                <text
                    x={cx}
                    y="20"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="14"
                    fontWeight="700"
                    fontFamily="Outfit, sans-serif"
                >
                    {letter}
                </text>
            </g>
        ))}
    </svg>
);

const StarsRow = () => (
    <span className="stars" aria-label="4.5 out of 5 stars">
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-fill" />
        <i className="bi bi-star-half" />
    </span>
);

const SpinningCircle = () => (
    <a href="#about" className="circle-spin d-none d-md-flex" aria-label="Scroll to about">
        <svg className="text-spin" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <path id="circlePath" d="M 80,80 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
            </defs>
            <text fill="#fff" fontFamily="Outfit, sans-serif" fontSize="11" fontWeight="600" letterSpacing="3">
                <textPath href="#circlePath" startOffset="0">
                    SCROLL DOWN • DISCOVER MORE • SCROLL DOWN • DISCOVER MORE •
                </textPath>
            </text>
        </svg>
        <span className="circle-arrow" aria-hidden="true">
            <i className="bi bi-arrow-down" />
        </span>
    </a>
);

const Hero = () => {
    return (
        <div id="hero" className="rts-banner-fourteen-area banner-bg-f14">
            <div className="rts-banner-content-wrapper">

                <SpinningCircle />

                <div className="hero-fade-in">

                    <div className="author-trust-review">
                        <div className="author-area">
                            <AvatarStack />
                        </div>
                        <div className="review-area">
                            <span className="title">Trusted by 120+ Companies</span>
                            <div className="star-ratting-area">
                                <StarsRow />
                                <span className="ratting">4.5 (989 reviews)</span>
                            </div>
                        </div>
                    </div>

                    <p className="desc">
                        Unlock your workforce's full potential with smart management
                        tools tailored to your company's unique goals. Let's build a
                        smarter, stronger team — together.
                    </p>

                    <div className="bottom-area">
                        <Link to="/login" className="rts-btn btn-primary-7 radius-6">
                            Get Started
                            <ArrowIcon />
                        </Link>
                        <div className="phone-area">
                            <div className="icon"><i className="bi bi-telephone-fill" /></div>
                            <a href="tel:+34603887120">(+34) 603 887 120</a>
                        </div>
                    </div>
                </div>

                <h1 className="banner-title hero-fade-in delay">
                    Workforce <span>Growth</span><br />Starts Here
                </h1>

            </div>
        </div>
    );
};

export default memo(Hero);
