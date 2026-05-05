import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const StatCard = ({ icon, iconBg, label, value, sub }) => (
    <div className="col-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center gap-3 p-3">
                <div
                    className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${iconBg}`}
                    style={{ width: 48, height: 48 }}
                >
                    <i className={`bi ${icon} fs-5 text-white`}></i>
                </div>
                <div>
                    <div className="fw-bold fs-5 lh-1 mb-1">{value ?? "—"}</div>
                    <div className="text-muted small">{label}</div>
                </div>
            </div>
        </div>
    </div>
);

const CompanyDashboard = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        employees: 0,
        pendingVacations: 0,
        activeClocks: 0,
        unreadMessages: 0,
    });

    useEffect(() => {
        const loadStats = async () => {
            const [statsRes, chatRes] = await Promise.all([
                actions.apiFetch("/company/stats"),
                actions.apiFetch("/chat/unread-count"),
            ]);
            if (statsRes.ok) {
                setStats(prev => ({
                    ...prev,
                    employees:        statsRes.data.totalEmployees || 0,
                    pendingVacations: statsRes.data.totalPending   || 0,
                    activeClocks:     statsRes.data.activeClocks   || 0,
                }));
            }
            if (chatRes.ok) {
                const total = Array.isArray(chatRes.data)
                    ? chatRes.data.reduce((sum, d) => sum + d.unread, 0)
                    : 0;
                setStats(prev => ({ ...prev, unreadMessages: total }));
            }
        };

        loadStats();
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const companyName = store.user?.nombre_empresa || "Company";

    return (
        <>
            <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <h5 className="fw-bold mb-0">Welcome, {companyName}! 👋</h5>
                    <p className="text-muted small mb-0">Manage your workforce and operational tasks.</p>
                </div>
                <Link to="/create-employee" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                    <i className="bi bi-person-plus me-2"></i>Add Employee
                </Link>
            </div>

            <div className="row g-3 mb-4">
                <StatCard icon="bi-people-fill"            iconBg="bg-primary" label="Total Employees"   value={stats.employees} />
                <StatCard icon="bi-stopwatch-fill"         iconBg="bg-success" label="Currently Working" value={stats.activeClocks} />
                <StatCard icon="bi-hourglass-split"        iconBg="bg-warning" label="Pending Requests"  value={stats.pendingVacations} />
                <StatCard icon="bi-chat-dots-fill"         iconBg="bg-info"    label="Unread Messages"   value={stats.unreadMessages} />
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-dark text-white">
                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <div className="small text-white-50 text-uppercase fw-bold mb-1">Total Employees</div>
                                    <div className="display-5 fw-bold">{stats.employees}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 rounded-circle p-3">
                                    <i className="bi bi-people-fill fs-3"></i>
                                </div>
                            </div>
                            <button onClick={() => navigate("/manage-employees")} className="btn btn-light fw-bold text-dark rounded-pill">
                                Manage Staff <i className="bi bi-arrow-right-short fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <div className="small text-white-50 text-uppercase fw-bold mb-1">Currently Working</div>
                                    <div className="display-5 fw-bold">{stats.activeClocks}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 rounded-circle p-3">
                                    <i className="bi bi-stopwatch fs-3"></i>
                                </div>
                            </div>
                            <button onClick={() => navigate("/work-logs")} className="btn btn-light fw-bold text-primary rounded-pill">
                                View Live Logs <i className="bi bi-arrow-right-short fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <h6 className="fw-bold mb-3 text-muted text-uppercase small">Management Tools</h6>
            <div className="row g-3 mb-4">
                {[
                    { to: "/manage-approvals",    icon: "bi-ui-checks",      label: "Requests & Approvals", sub: "Review vacations and incidents",   color: "primary"  },
                    { to: "/payroll-hub",         icon: "bi-cash-stack",     label: "Upload Payrolls",      sub: "Distribute monthly documents",     color: "success"  },
                    { to: "/survey-builder",      icon: "bi-clipboard-data", label: "Climate Surveys",      sub: "Create and manage feedback",       color: "warning"  },
                    { to: "/AIRecommendationsHub",icon: "bi-stars",          label: "AI Insights",          sub: "Personalized team recommendations",color: "info"     },
                ].map(({ to, icon, label, sub, color }) => (
                    <div key={to} className="col-6 col-lg-3">
                        <Link to={to} className="text-decoration-none">
                            <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-4">
                                <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`}
                                    style={{ width: 52, height: 52 }}>
                                    <i className={`bi ${icon} fs-4`}></i>
                                </div>
                                <div className="fw-bold small text-dark mb-1">{label}</div>
                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>{sub}</div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <h6 className="fw-bold mb-3 text-muted text-uppercase small">Planning & Logs</h6>
            <div className="row g-3">
                {[
                    { to: "/schedule-planner", icon: "bi-calendar-week", label: "Weekly Schedules", sub: "Plan and assign shifts to your team" },
                    { to: "/work-logs",        icon: "bi-clock-history", label: "Work Records",     sub: "Full log of check-ins and check-outs" },
                    { to: "/company-chat", icon: "bi-chat-dots",     label: "Chat",             sub: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? "s" : ""}` : "Chat with your employees" },
                ].map(({ to, icon, label, sub }) => (
                    <div key={to} className="col-12 col-md-4">
                        <Link to={to} className="text-decoration-none">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4 d-flex align-items-center gap-3">
                                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 46, height: 46 }}>
                                        <i className={`bi ${icon} fs-5`}></i>
                                    </div>
                                    <div>
                                        <div className="fw-bold small text-dark">{label}</div>
                                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{sub}</div>
                                    </div>
                                    <i className="bi bi-chevron-right ms-auto text-muted"></i>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CompanyDashboard;