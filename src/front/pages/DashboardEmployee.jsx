import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashboardEmployee = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [error, setError] = useState(null); // Estado para manejar errores visuales

    useEffect(() => {
        const load = async () => {
            try {
                // Solo cargamos si no tenemos ya la info en el store
                if (!store.employeeInfo) {
                    const result = await actions.getEmployeeData();
                    // Si el resultado es explícitamente falso (ej: 401 Unauthorized)
                    if (result === false) {
                        navigate("/login-employee");
                    }
                }
            } catch (err) {
                console.error("Error en el dashboard:", err);
                setError("No se pudo conectar con el servidor.");
            }
        };
        load();
    }, [store.employeeInfo]); // Dependencia para re-renderizar si cambia la info

    const emp = store.employeeInfo;

    const handleLogout = () => {
        actions.logout();
        navigate("/login-employee");
    };

    // Si hay un error de conexión, mostramos un botón de reintento
    if (error) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Portal Empleado</h2>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar sesión
                </button>
            </div>

            {emp ? (
                <div className="card shadow p-4 mb-4" style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <div className="row align-items-center mb-4">
                        <div className="col-auto">
                            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px", fontSize: "35px" }}>
                                {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                            </div>
                        </div>
                        <div className="col">
                            <h3 className="fw-bold mb-0">{emp.first_name} {emp.last_name}</h3>
                            <p className="text-primary mb-1">
                                <i className="fas fa-building me-1"></i> {emp.nombre_empresa || "Empresa no asignada"}
                            </p>
                            <span className={`badge ${emp.is_active ? "bg-success" : "bg-danger"}`}>
                                {emp.is_active ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        <div className="col-auto text-end">
                            <Link to="/employees/schedules" className="btn btn-info btn-sm mb-2 d-block">
                                <i className="fas fa-calendar-alt me-2"></i>Mi Horario
                            </Link>
                            <Link to="/mis-nominas" className="btn btn-info btn-sm mb-2 d-block">
                                <i className="fas fa-file-alt me-2"></i>Mi Nóminas
                            </Link>

                            <Link to="/work-records" className="btn btn-dark btn-sm d-block">
                                <i className="fas fa-clock me-2"></i>Fichajes
                            </Link>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-6">
                            <div className="p-3 border rounded bg-light">
                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Email</small>
                                <span>{emp.email}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-3 border rounded bg-light">
                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Teléfono</small>
                                <span>{emp.phone || "—"}</span>
                            </div>
                        </div>
                        {/* ... Resto de campos con el mismo estilo ... */}
                    </div>
                </div>
            ) : (
                <div className="text-center text-muted mt-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3">Sincronizando con el servidor...</p>
                </div>
            )}
        </div>
    );
};

export default DashboardEmployee;