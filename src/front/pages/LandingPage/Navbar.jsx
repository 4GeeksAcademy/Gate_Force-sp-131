import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
    { label: "Home", href: "#hero" },
    { label: "About Us", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Our Team", href: "#team" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
];

const ArrowIcon = () => (
    <svg width="20" height="20" viewBox="6 6 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 6V7.5H15.4425L6 16.9425L7.0575 18L16.5 8.5575V18H18V6H6Z" fill="currentColor" />
    </svg>
);

const Navbar = () => {
    const [sticky, setSticky] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setSticky(prev => {
                    const next = window.scrollY > 80;
                    return prev === next ? prev : next;
                });
                ticking = false;
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <div className={`header-twelve header--fourteen header--sticky ${sticky ? "sticky" : ""}`}>
                <div className="header-wrapper-14">
                    <div className="header-left">
                        <Link to="/" className="logo-area">

                            <span className="logo-text">Gate<span className="logo-accent">Force</span></span>
                        </Link>

                        <nav className="nav-main mainmenu-nav d-none d-xl-block">
                            <ul className="mainmenu">
                                {NAV_ITEMS.map(item => (
                                    <li key={item.href}>
                                        <a className="nav-link" href={item.href}>{item.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    <div className="header-right">
                        <Link
                            to="/login"
                            className="rts-btn btn-primary-4 six radius-6 quote-btn d-none d-md-flex"
                        >
                            <span>Portal de Gestión</span>
                            <ArrowIcon />
                        </Link>
                    </div>
                </div>
            </div>

            <div className={`gf-mobile-menu ${mobileOpen ? "open" : ""}`}>
                <ul>
                    {NAV_ITEMS.map(item => (
                        <li key={item.href}>
                            <a href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a>
                        </li>
                    ))}
                    <li>
                        <Link to="/login" onClick={() => setMobileOpen(false)} className="mobile-cta">
                            Portal de Gestión <ArrowIcon fill="#001D21" />
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Navbar;
