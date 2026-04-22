import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashboardEmployee = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const ok = await actions.getEmployeeData();
            if (!ok) navigate("/login-employee");
        };
        load();
    }, []);

    const emp = store.employeeInfo;

    const handleLogout = () => {
        actions.logout();
        navigate("/login-employee");
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Portal Empleado</h2>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>

            {emp ? (
                <>
                    <div className="card shadow p-4 mb-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="d-flex align-items-center mb-4 gap-3">
                            <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "72px", height: "72px", fontSize: "32px" }}>
                                👤
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">{emp.first_name} {emp.last_name}</h4>
                                <p className="text-muted mb-0">{emp.position || "Sin cargo asignado"}</p>
                            </div>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Email</span>
                                <span>{emp.email}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Teléfono</span>
                                <span>{emp.phone || "—"}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Cargo</span>
                                <span>{emp.position || "—"}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Rol</span>
                                <span>{emp.role || "—"}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Incidencias</span>
                                <span>{emp.incidents?.length || 0} registradas</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Vacaciones disponibles</span>
                                <span>
                                    {emp.vacaciones?.length > 0
                                        ? emp.vacaciones[emp.vacaciones.length - 1].available_vacations ?? 0
                                        : 0} días
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Nóminas</span>
                                <span>{emp.nominas?.length || 0} registradas</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted fw-semibold">Registros de trabajo</span>
                                <span>{emp.work_records?.length || 0} registros</span>
                            </li>
                        </ul>
                    </div>

                </>
            ) : (
                <div className="text-center text-muted mt-5">
                    <div className="spinner-border" role="status"></div>
                    <p className="mt-3">Cargando información...</p>
                </div>
            )}
        </div>
    );
};

export default DashboardEmployee;