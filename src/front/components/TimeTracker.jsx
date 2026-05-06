import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

// getLocation: () => Promise<string|null> — called on check-in for fresh coords
const TimeTracker = ({ getLocation = null }) => {
    const { actions } = useGlobalReducer();
    const [isOnClock, setIsOnClock] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionStart, setSessionStart] = useState(null); // Guardará la hora de entrada local
    const [currentTime, setCurrentTime] = useState(new Date()); // Reloj en vivo

    // Efecto para el reloj en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Verificamos el estado al cargar
    useEffect(() => {
        const checkStatus = async () => {
            const { ok, data } = await actions.apiFetch("/work-records/status");
            if (ok) {
                setIsOnClock(data.is_on_clock);
                // Si está trabajando, extraemos la fecha del servidor y la pasamos a hora local
                if (data.is_on_clock && data.session && data.session.check_in) {
                    setSessionStart(new Date(data.session.check_in));
                }
            }
            setLoading(false);
        };
        checkStatus();
    }, []);

    const handleClockAction = async () => {
        setLoading(true);
        if (!isOnClock) {
            // Get a fresh GPS fix right at the moment of check-in
            const freshLocation = getLocation ? await getLocation() : null;
            const body = freshLocation ? { location: freshLocation } : {};
            const { ok, data } = await actions.apiFetch("/work-records/check-in", "POST", body);
            if (ok) {
                setIsOnClock(true);
                if (data) setSessionStart(new Date(data.check_in));
            }
        } else {
            const { ok } = await actions.apiFetch("/work-records/check-out", "POST");
            if (ok) {
                setIsOnClock(false);
                setSessionStart(null);
            }
        }
        setLoading(false);
    };

    if (loading) return <div className="spinner-border spinner-border-sm text-primary"></div>;

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="row align-items-center">
                <div className="col-md-7 mb-3 mb-md-0">
                    <div className="d-flex align-items-center gap-3">
                        <div className={`p-3 rounded-circle ${isOnClock ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                            <i className="bi bi-clock-history fs-3"></i>
                        </div>
                        <div>
                            <h5 className="fw-bold mb-1">Registro de Jornada</h5>
                            <div className="d-flex align-items-center gap-2 mt-1">
                                <span className={`badge ${isOnClock ? 'bg-success' : 'bg-secondary'}`}>
                                    {isOnClock ? "En turno" : "Fuera de servicio"}
                                </span>
                                {/* Mostramos la hora a la que entró formateada bonita */}
                                {isOnClock && sessionStart && (
                                    <small className="text-muted fw-medium border-start ps-2">
                                        Entrada: {sessionStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-5 d-flex justify-content-md-end align-items-center gap-4">
                    {/* Reloj en vivo */}
                    <div className="d-none d-sm-block text-end">
                        <div className="fs-4 fw-bold text-dark font-monospace">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                    <button
                        onClick={handleClockAction}
                        disabled={loading}
                        className={`btn btn-lg fw-bold px-4 rounded-pill shadow-sm ${isOnClock ? "btn-outline-danger" : "btn-warning text-dark"}`}
                    >
                        <i className={`bi ${isOnClock ? "bi-stop-circle" : "bi-play-circle"} me-2`}></i>
                        {isOnClock ? "Fichar Salida" : "Fichar Entrada"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeTracker;