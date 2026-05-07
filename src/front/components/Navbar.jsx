import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ROLE_CONFIG = {
    ADMIN: { label: "Admin", dashboard: "/admin-dashboard" },
    COMPANY: { label: "Company", dashboard: "/company-dashboard" },
    EMPLOYEE: { label: "Employee", dashboard: "/employee-dashboard" },
};

const formatDateEs = (date) =>
    date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

export const Navbar = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { token, role, user } = store;
    const config = ROLE_CONFIG[role] || null;

    const displayName =
        role === "COMPANY"
            ? user?.nombre_empresa
            : role === "EMPLOYEE"
            ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
            : "Admin";

    const profileImage =
        role === "COMPANY" ? user?.logo_url : user?.profile_image;

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    const handleLogout = () => {
        setOpen(false);
        actions.logout();
        navigate("/login");
    };

    const goToDashboard = () => {
        setOpen(false);
        if (config) navigate(config.dashboard);
    };

    return (
        <header
            className="text-white px-4 d-flex align-items-center justify-content-between sticky-top shadow-sm"
            style={{ zIndex: 1020, backgroundColor: "rgb(26, 31, 46)", minHeight: 85, paddingTop: 17, paddingBottom: 17 }}
        >
            {/* LEFT: title + date */}
            <div className="d-flex align-items-center gap-3">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-light d-lg-none rounded-3"
                    aria-label="Open menu"
                >
                    <i className="bi bi-list fs-5"></i>
                </button>
                <div>
                    <h6 className="mb-0 fw-bold text-white">Dashboard</h6>
                    <small className="text-white-50 text-capitalize">
                        {formatDateEs(new Date())}
                    </small>
                </div>
            </div>

            {/* RIGHT: user pill + dropdown */}
            {token && config && (
                <div className="position-relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="btn d-flex align-items-center gap-2 text-white px-2 py-1 rounded-3"
                        style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                        }}
                        onClick={() => setOpen(o => !o)}
                        aria-haspopup="menu"
                        aria-expanded={open}
                    >
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden bg-secondary"
                            style={{ width: 32, height: 32 }}
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={displayName}
                                    className="w-100 h-100 object-fit-cover"
                                />
                            ) : (
                                <i className="bi bi-person-fill text-white" style={{ fontSize: 16 }}></i>
                            )}
                        </div>
                        <div className="text-start d-none d-sm-block">
                            <div className="small fw-semibold lh-1">
                                {displayName || "—"}
                            </div>
                            <div style={{ fontSize: "0.68rem", opacity: 0.6 }}>
                                {config.label}
                            </div>
                        </div>
                        <i
                            className="bi bi-chevron-down small ms-1"
                            style={{
                                transition: "transform 0.2s ease",
                                transform: open ? "rotate(180deg)" : "rotate(0)",
                            }}
                        ></i>
                    </button>

                    {open && (
                        <>
                            <div
                                className="position-fixed top-0 start-0 w-100 h-100"
                                style={{ zIndex: 1059 }}
                                onClick={() => setOpen(false)}
                            />
                            <div
                                className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg py-2 text-dark"
                                style={{ minWidth: 240, top: "100%", zIndex: 1060 }}
                                role="menu"
                            >
                                <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden bg-secondary"
                                        style={{ width: 42, height: 42 }}
                                    >
                                        {profileImage ? (
                                            <img src={profileImage} alt={displayName} className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            <i className="bi bi-person-fill text-white" style={{ fontSize: 20 }}></i>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="fw-semibold small text-dark text-truncate">{displayName || "—"}</div>
                                        <div className="text-muted text-truncate" style={{ fontSize: "0.72rem" }}>
                                            {user?.email || config.label}
                                        </div>
                                    </div>
                                </div>

                                <div className="py-1">
                                    <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2 px-4 py-2"
                                        onClick={goToDashboard}
                                    >
                                        <i className="bi bi-grid-1x2-fill text-muted"></i>
                                        <span className="small">My Dashboard</span>
                                    </button>
                                </div>

                                <div className="border-top pt-1">
                                    <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2 px-4 py-2 text-danger w-100 text-start"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right"></i>
                                        <span className="small">Log Out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};
