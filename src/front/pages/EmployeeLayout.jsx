import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ImageUpload from "../components/ImageUpload";

const NAV_ITEMS = [
    { to: "/employee-dashboard", icon: "bi-speedometer2",         label: "Dashboard" },
    { to: "/my-work-records",    icon: "bi-clock-history",        label: "Work Records" },
    { to: "/my-payroll",         icon: "bi-file-earmark-pdf",     label: "My Payrolls" },
    { to: "/my-schedules",       icon: "bi-calendar3",            label: "Schedule" },
    { to: "/report-request",     icon: "bi-exclamation-triangle", label: "Report Incident" },
    { to: "/wellness-survey",    icon: "bi-heart-pulse",          label: "Wellness Survey" },
    { to: "/survey",             icon: "bi-clipboard-check",      label: "Employee Survey" },
    { to: "/chat",               icon: "bi-chat-dots",            label: "Chat" },
];

const SIDEBAR_W = 240;
const BG = "#1a1f2e";

const EmployeeLayout = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const displayName = `${store.user?.first_name ?? ""} ${store.user?.last_name ?? ""}`.trim();
    const avatar = store.user?.profile_image;

    const handleProfileImageUpload = async (url) => {
        const { ok } = await actions.apiFetch(`/employees/${store.user?.id}`, "PUT", { profile_image: url });
        if (ok) actions.updateUser({ profile_image: url });
    };

    const handleLogout = () => {
        actions.logout();
        navigate("/login");
        setDropdownOpen(false);
    };

    const today = new Date().toLocaleDateString("es-ES", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const pageLabel = NAV_ITEMS.find(n => location.pathname === n.to)?.label ?? "Dashboard";

    const AvatarCircle = ({ size = 34 }) => (
        <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden bg-secondary"
            style={{ width: size, height: size }}
        >
            {avatar
                ? <img src={avatar} className="w-100 h-100 object-fit-cover" alt="" />
                : <i className="bi bi-person-fill text-white" style={{ fontSize: size * 0.45 }}></i>
            }
        </div>
    );

    return (
        <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6fb" }}>

            {sidebarOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`flex-column text-white position-fixed top-0 start-0 h-100 ${sidebarOpen ? "d-flex" : "d-none d-lg-flex"}`}
                style={{ width: SIDEBAR_W, zIndex: 1050, overflowY: "auto", backgroundColor: BG }}
            >
                <div className="px-4 py-4 border-bottom border-secondary d-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock-fill text-primary fs-4"></i>
                    <span className="fw-bold fs-5 text-white">GateForce</span>
                </div>

                <div className="px-3 py-4 border-bottom border-secondary d-flex align-items-center gap-3">
                    <ImageUpload
                        currentImage={avatar}
                        onUpload={handleProfileImageUpload}
                        size={44}
                        label=""
                    />
                    <div className="overflow-hidden">
                        <div className="fw-semibold text-white text-truncate small">{displayName || "Employee"}</div>
                        <span className="badge bg-success bg-opacity-25 text-success border border-success" style={{ fontSize: "0.65rem" }}>
                            Employee
                        </span>
                    </div>
                </div>

                <nav className="flex-grow-1 px-2 py-3">
                    <ul className="nav flex-column gap-1">
                        {NAV_ITEMS.map(({ to, icon, label }) => {
                            const active = location.pathname === to;
                            return (
                                <li key={to} className="nav-item">
                                    <Link
                                        to={to}
                                        className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${active ? "bg-primary text-white" : "text-white-50"}`}
                                        style={{ transition: "background 0.15s" }}
                                        onClick={() => setSidebarOpen(false)}
                                        onMouseEnter={e => { if (!active) e.currentTarget.classList.add("bg-white", "bg-opacity-10"); }}
                                        onMouseLeave={e => { if (!active) e.currentTarget.classList.remove("bg-white", "bg-opacity-10"); }}
                                    >
                                        <i className={`bi ${icon}`}></i>
                                        <span className="small">{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            <div className="flex-grow-1" style={{ marginLeft: SIDEBAR_W }}>

                <header
                    className="text-white px-4 py-3 d-flex align-items-center justify-content-between sticky-top shadow-sm"
                    style={{ zIndex: 1020, backgroundColor: BG }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn btn-sm btn-outline-light d-lg-none rounded-3"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <i className="bi bi-list fs-5"></i>
                        </button>
                        <div>
                            <h6 className="mb-0 fw-bold text-white">{pageLabel}</h6>
                            <small className="text-white-50 text-capitalize">{today}</small>
                        </div>
                    </div>

                    <div className="position-relative">
                        <button
                            className="btn d-flex align-items-center gap-2 text-white px-2 py-1 rounded-3"
                            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                            onClick={() => setDropdownOpen(o => !o)}
                        >
                            <AvatarCircle size={32} />
                            <div className="text-start d-none d-sm-block">
                                <div className="small fw-semibold lh-1">{displayName || "—"}</div>
                                <div style={{ fontSize: "0.68rem", opacity: 0.6 }}>Employee</div>
                            </div>
                            <i className={`bi bi-chevron-${dropdownOpen ? "up" : "down"} small ms-1`}></i>
                        </button>

                        {dropdownOpen && (
                            <>
                                <div
                                    className="position-fixed top-0 start-0 w-100 h-100"
                                    style={{ zIndex: 1059 }}
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div
                                    className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg py-2"
                                    style={{ zIndex: 1060, minWidth: 220, top: "100%" }}
                                >
                                    <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom">
                                        <AvatarCircle size={42} />
                                        <div>
                                            <div className="fw-semibold small">{displayName || "—"}</div>
                                            <div className="text-muted" style={{ fontSize: "0.72rem" }}>{store.user?.email ?? ""}</div>
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <Link to="/my-work-records" className="dropdown-item d-flex align-items-center gap-2 px-4 py-2" onClick={() => setDropdownOpen(false)}>
                                            <i className="bi bi-clock-history text-muted"></i>
                                            <span className="small">Work Records</span>
                                        </Link>
                                        <Link to="/my-schedules" className="dropdown-item d-flex align-items-center gap-2 px-4 py-2" onClick={() => setDropdownOpen(false)}>
                                            <i className="bi bi-calendar3 text-muted"></i>
                                            <span className="small">My Schedule</span>
                                        </Link>
                                        <Link to="/my-payroll" className="dropdown-item d-flex align-items-center gap-2 px-4 py-2" onClick={() => setDropdownOpen(false)}>
                                            <i className="bi bi-file-earmark-pdf text-muted"></i>
                                            <span className="small">My Payrolls</span>
                                        </Link>
                                        <Link to="/chat" className="dropdown-item d-flex align-items-center gap-2 px-4 py-2" onClick={() => setDropdownOpen(false)}>
                                            <i className="bi bi-chat-dots text-muted"></i>
                                            <span className="small">Chat</span>
                                        </Link>
                                    </div>

                                    <div className="border-top pt-1">
                                        <button className="dropdown-item d-flex align-items-center gap-2 px-4 py-2 text-danger w-100 text-start" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right"></i>
                                            <span className="small">Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;