import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useGeolocation } from "../hooks/useGeolocation";
import TimeTracker from "../components/TimeTracker";
import LocationMap from "../components/LocationMap";

const StatCard = ({ icon, iconBg, label, value }) => (
    <div className="col-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-body d-flex align-items-center gap-3 p-3">
                <div
                    className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${iconBg}`}
                    style={{ width: 60, height: 60 }}
                >
                    {icon.startsWith('bi-') ? (
                        <i className={`bi ${icon} fs-4 text-white`}></i>
                    ) : (
                        <span style={{ fontSize: '28px', filter: 'drop-shadow(-8px -8px 12px rgba(0, 0, 0, 0.25))' }}>{icon}</span>
                    )}
                </div>
                <div>
                    <div className="fw-bold fs-5 lh-1 mb-1">{value ?? "—"}</div>
                    <div className="text-muted small">{label}</div>
                </div>
            </div>
        </div>
    </div>
);

const EmployeeDashboard = () => {
    const { store, actions } = useGlobalReducer();
    const { coords, detectionId, status, detect } = useGeolocation();

    const [stats, setStats] = useState({
        totalHours: null,
        pendingVacations: null,
        pendingIncidents: null,
        unreadMessages: null,
    });

    useEffect(() => { detect(); }, []);

    useEffect(() => {
        const fetchStats = async () => {
            const [hoursRes, vacRes, incRes, chatRes] = await Promise.all([
                actions.apiFetch("/work-records/my-summary"),
                actions.apiFetch("/vacaciones/my-pending-count"),
                actions.apiFetch("/incidents/my-pending-count"),
                actions.apiFetch("/chat/unread-count"),
            ]);
            setStats({
                totalHours: hoursRes.ok ? hoursRes.data.total_hours : "—",
                pendingVacations: vacRes.ok ? vacRes.data.count : "—",
                pendingIncidents: incRes.ok ? incRes.data.count : "—",
                unreadMessages: chatRes.ok ? chatRes.data.unread : "—",
            });
        };
        fetchStats();
    }, []);

    return (
        <div className="container py-4">
            <div className="row g-3 mb-4">
                <StatCard icon="⏱️" iconBg="bg-orange-500" label="Hours This Month" value={stats.totalHours !== null ? `${stats.totalHours}h` : "—"} />
                <StatCard icon="☀️" iconBg="bg-orange-500" label="Pending Vacations" value={stats.pendingVacations} />
                <StatCard icon="⚠️" iconBg="bg-orange-500" label="Open Incidents" value={stats.pendingIncidents} />
                <StatCard icon="💬" iconBg="bg-orange-500" label="Unread Messages" value={stats.unreadMessages} />
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12">
                    <TimeTracker getLocation={detect} />
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-6">
                    <LocationMap coords={coords} detectionId={detectionId} status={status} onRefresh={detect} />
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-4">Employee Services</h6>
                            <div className="row g-3">
                                {[
                                    { to: "/my-work-records", icon: "bi-clock-history", label: "Work Records" },
                                    { to: "/my-payroll", icon: "bi-file-earmark-pdf", label: "My Payrolls" },
                                    { to: "/my-schedules", icon: "bi-calendar3", label: "Schedule" },
                                    { to: "/report-request", icon: "bi-exclamation-triangle", label: "Report Incident" },
                                    { to: "/wellness-survey", icon: "bi-heart-pulse", label: "Wellness" },
                                    { to: "/survey", icon: "bi-clipboard-check", label: "Survey" },
                                ].map(({ to, icon, label }) => (
                                    <div key={to} className="col-6 col-sm-4">
                                        <Link
                                            to={to}
                                            className="btn w-100 rounded-3 d-flex flex-column align-items-center gap-1 py-3"
                                            style={{ backgroundColor: "#ff6b00", color: "black", fontSize: "0.8rem" }}
                                        >
                                            <i className={`bi ${icon} fs-5`}></i>
                                            {label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h6 className="fw-bold mb-0">My Schedule Today</h6>
                                <Link to="/my-schedules" className="btn btn-sm btn-light rounded-3 small">View All</Link>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { label: "Check-in",    time: "09:00 AM", icon: "bi-box-arrow-in-right", color: "success" },
                                    { label: "Lunch Break", time: "01:00 PM", icon: "bi-cup-hot",            color: "warning" },
                                    { label: "Check-out",   time: "06:00 PM", icon: "bi-box-arrow-right",    color: "danger"  },
                                ].map(({ label, time, icon, color }) => (
                                    <div key={label} className="d-flex align-items-center gap-3">
                                        <div
                                            className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 bg-${color} bg-opacity-10`}
                                            style={{ width: 38, height: 38 }}
                                        >
                                            <i className={`bi ${icon} text-${color}`}></i>
                                        </div>
                                        <div>
                                            <div className="small fw-semibold">{label}</div>
                                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>{time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h6 className="fw-bold mb-0">My Requests</h6>
                                <Link to="/report-request" className="btn btn-sm btn-light rounded-3 small">New</Link>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { label: "Vacation Request",  badge: "Pending",  color: "warning" },
                                    { label: "Remote Work Day",   badge: "Approved", color: "success" },
                                    { label: "Equipment Request", badge: "Rejected", color: "danger"  },
                                ].map(({ label, badge, color }) => (
                                    <div key={label} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                        <span className="small">{label}</span>
                                        <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color}`} style={{ fontSize: "0.65rem" }}>
                                            {badge}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4 d-flex flex-column">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h6 className="fw-bold mb-0">Messages</h6>
                                <Link to="/chat" className="btn btn-sm btn-light rounded-3 small">Open Chat</Link>
                            </div>
                            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center py-3">
                                <div
                                    className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-3"
                                    style={{ width: 56, height: 56 }}
                                >
                                    <i className="bi bi-chat-dots text-primary fs-4"></i>
                                </div>
                                <p className="small text-muted mb-3">Chat directly with your company.</p>
                                <Link to="/chat" className="btn btn-primary btn-sm rounded-3 px-4">
                                    {stats.unreadMessages > 0
                                        ? `View ${stats.unreadMessages} new message${stats.unreadMessages > 1 ? "s" : ""}`
                                        : "Open Chat"
                                    }
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;