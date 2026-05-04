import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const MySchedules = () => {
    const { actions } = useGlobalReducer();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadSchedules = async () => {
        const { ok, data } = await actions.apiFetch("/my-schedules");
        if (ok) setSchedules(data);
        setLoading(false);
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-clock text-primary me-2"></i>
                        Mi Horario
                    </h5>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted text-uppercase">
                                <th className="ps-4">Día</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th className="text-end pe-4">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {schedules.length > 0 ? schedules.map((sch, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-uppercase">{sch.day}</td>
                                    <td>
                                        <span className="badge bg-success-subtle text-success px-3 py-2">
                                            <i className="bi bi-clock me-1"></i> {sch.start_time}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-danger-subtle text-danger px-3 py-2">
                                            <i className="bi bi-clock me-1"></i> {sch.end_time}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <span className="badge bg-light text-dark border">Oficial</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted small">
                                        No hay horarios asignados para esta semana.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MySchedules;