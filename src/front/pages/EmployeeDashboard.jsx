import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useGeolocation } from "../hooks/useGeolocation";
import TimeTracker from "../components/TimeTracker";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import ImageUpload from "../components/ImageUpload";
import LocationMap from "../components/LocationMap";

const EmployeeDashboard = () => {
    const { store, actions } = useGlobalReducer();
    const { coords, detectionId, status, detect } = useGeolocation();

    // Auto-detect location on mount
    useEffect(() => { detect(); }, []);

    const handleProfileImageUpload = async (url) => {
        const { ok } = await actions.apiFetch(`/employees/${store.user?.id}`, "PUT", { profile_image: url });
        if (ok) actions.updateUser({ profile_image: url });
    };

    return (
        <div className="container py-4">
            <LogoutButton />

            <header className="mb-4 d-flex align-items-center gap-3">
                <ImageUpload
                    currentImage={store.user?.profile_image}
                    onUpload={handleProfileImageUpload}
                    size={72}
                    label="Update profile photo"
                />
                <div>
                    <h1 className="h3 mb-0">Welcome back, {store.user?.first_name}!</h1>
                    <p className="text-muted mb-0">Here's what's happening today.</p>
                </div>
            </header>

            <div className="row g-4 mb-4">
                {/* WIDGET FICHAJE — getLocation obtiene GPS fresco justo al fichar */}
                <div className="col-12">
                    <TimeTracker getLocation={detect} />
                </div>
            </div>

            <div className="row g-4 mb-5">
                {/* MAPA — presentacional, state owned aquí */}
                <div className="col-12 col-lg-6">
                    <LocationMap
                        coords={coords}
                        detectionId={detectionId}
                        status={status}
                        onRefresh={detect}
                    />
                </div>

                {/* ACCESOS RÁPIDOS */}
                <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Employee Services</h5>
                            <div className="d-flex flex-wrap gap-2">
                                <Link to="/my-work-records" className="btn btn-outline-secondary">
                                    <i className="bi bi-clock-history me-2"></i>My Work Records
                                </Link>
                                <Link to="/my-payroll" className="btn btn-outline-secondary">
                                    <i className="bi bi-file-earmark-pdf me-2"></i>My Payrolls
                                </Link>
                                <Link to="/report-request" className="btn btn-outline-secondary">
                                    <i className="bi bi-exclamation-triangle me-2"></i>Report Incident
                                </Link>
                                <Link to="/my-schedules" className="btn btn-outline-secondary">
                                    <i className="bi bi-calendar3 me-2"></i>View Schedule
                                </Link>
                                <Link to="/wellness-survey" className="btn btn-outline-secondary">
                                    <i className="bi bi-heart-pulse me-2"></i>Wellness Survey
                                </Link>
                                <Link to="/survey" className="btn btn-outline-secondary">
                                    <i className="bi bi-clipboard-check me-2"></i>Employee Survey
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
