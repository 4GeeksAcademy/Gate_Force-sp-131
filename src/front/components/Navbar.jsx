import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ROLE_CONFIG = {
    ADMIN: {
        label: "Admin",
        badgeClass: "border-danger text-danger",
        dashboard: "/admin-dashboard",
    },
    COMPANY: {
        label: "Company",
        badgeClass: "border-primary text-primary",
        dashboard: "/company-dashboard",
    },
    EMPLOYEE: {
        label: "Employee",
        badgeClass: "border-success text-success",
        dashboard: "/employee-dashboard",
    },
};

export const Navbar = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        actions.logout();
        navigate("/login");
    };

    return (
        <nav
            className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top"
            style={{ zIndex: 1030 }}
        >
            <div className="container-fluid px-4">
                {/* Brand */}
                <span
                    className="navbar-brand fw-black text-dark d-flex align-items-center gap-2 mb-0"
                    style={{ cursor: "default", letterSpacing: "-0.5px" }}
                >
                    <i className="bi bi-shield-lock-fill text-primary"></i>
                    GateForce
                </span>

                {/* Right side: user info + logout */}
                {token && config ? (
                    <div className="ms-auto d-flex align-items-center gap-3">
                        {/* Clickable user pill → goes to dashboard */}
                        <button
                            type="button"
                            className="btn btn-light border rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                            onClick={() => navigate(config.dashboard)}
                            title={`Go to ${config.label} dashboard`}
                        >
                            {/* Avatar */}
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={displayName}
                                    className="rounded-circle object-fit-cover"
                                    style={{ width: 30, height: 30 }}
                                />
                            ) : (
                                <div
                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 30, height: 30 }}
                                >
                                    <i
                                        className="bi bi-person-fill text-white"
                                        style={{ fontSize: 14 }}
                                    ></i>
                                </div>
                            )}

                            {/* Name */}
                            <span className="fw-semibold text-dark small d-none d-sm-inline">
                                {displayName || "—"}
                            </span>

                            {/* Role badge */}
                            <span
                                className={`badge border fw-semibold ${config.badgeClass}`}
                                style={{ fontSize: "0.7rem" }}
                            >
                                {config.label}
                            </span>
                        </button>

                        {/* Logout */}
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                            onClick={handleLogout}
                            title="Log out"
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            <span className="d-none d-sm-inline">Logout</span>
                        </button>
                    </div>
                ) : (
                    /* Not logged in: nothing shown on the right */
                    <div className="ms-auto" />
                )}
            </div>
        </nav>
    );
};
