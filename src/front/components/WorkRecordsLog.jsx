import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const WorkRecordsLog = () => {
    const { actions } = useGlobalReducer();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            const { ok, data } = await actions.apiFetch("/work-records");
            if (ok && Array.isArray(data)) {
                setLogs(data);
            }
            setLoading(false);
        };
        loadLogs();
    }, []);

    // MAGIA: Agrupamos los registros por empleado
    const groupedLogs = logs.reduce((acc, log) => {
        // Si el empleado no existe en nuestro objeto agrupado, lo creamos
        if (!acc[log.employee_id]) {
            acc[log.employee_id] = {
                name: log.employee_name || "Usuario Desconocido",
                records: [],
                isWorkingNow: false // Indicador para el Admin
            };
        }

        // Guardamos el registro dentro de este empleado
        acc[log.employee_id].records.push(log);

        // Si hay un registro sin check_out, es que está trabajando ahora
        if (!log.check_out) {
            acc[log.employee_id].isWorkingNow = true;
        }

        return acc;
    }, {});

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Cargando registros...</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4">
                <i className="bi bi-people-fill me-2"></i>Live Work Logs
            </h2>

            {Object.keys(groupedLogs).length > 0 ? (
                <div className="accordion shadow-sm rounded-4 overflow-hidden" id="employeeLogsAccordion">
                    {/* Iteramos sobre los empleados agrupados */}
                    {Object.values(groupedLogs).map((employee, index) => (
                        <div className="accordion-item border-0 border-bottom" key={index}>
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button collapsed fw-bold text-dark bg-white py-3"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-${index}`}
                                >
                                    <i className="bi bi-person-circle me-3 text-primary fs-4"></i>
                                    {employee.name}

                                    {/* Insignia si está trabajando en tiempo real */}
                                    {employee.isWorkingNow && (
                                        <span className="badge bg-success ms-3 pulse">
                                            <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.4rem" }}></i>
                                            En turno
                                        </span>
                                    )}

                                    {/* Contador de registros */}
                                    <span className="badge bg-light text-dark border ms-auto me-2">
                                        {employee.records.length} registros
                                    </span>
                                </button>
                            </h2>
                            <div id={`collapse-${index}`} className="accordion-collapse collapse" data-bs-parent="#employeeLogsAccordion">
                                <div className="accordion-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0 border-top">
                                            <thead className="bg-light text-muted small text-uppercase">
                                                <tr>
                                                    <th className="ps-4">Fecha</th>
                                                    <th>Entrada</th>
                                                    <th>Salida</th>
                                                    <th>Total Hrs</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employee.records.map(log => (
                                                    <tr key={log.id}>
                                                        <td className="ps-4 fw-medium text-dark">
                                                            {new Date(log.check_in).toLocaleDateString()}
                                                        </td>
                                                        <td className="text-success fw-bold">
                                                            {new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td>
                                                            {log.check_out ? (
                                                                <span className="text-danger fw-bold">
                                                                    {new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            ) : (
                                                                <span className="text-primary small fw-bold">Activo...</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {log.total_hours ? (
                                                                <span className="badge bg-light text-dark border">
                                                                    {log.total_hours.toFixed(2)}h
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">---</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${log.status?.toUpperCase() === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                {log.status?.toUpperCase() || 'PENDING'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card border-0 shadow-sm text-center py-5 rounded-4">
                    <p className="text-muted mb-0">No hay registros de jornada disponibles en este momento.</p>
                </div>
            )}
        </div>
    );
};

export default WorkRecordsLog;