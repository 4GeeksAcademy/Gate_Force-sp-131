import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyManagersControl() {
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const token = localStorage.getItem("token");

    const fetchData = async () => {
        setLoading(true);
        const headers = { "Authorization": `Bearer ${token}` };
        try {
            const [resEmp, resMan] = await Promise.all([
                fetch(`${API_URL}employees`, { headers }),
                fetch(`${API_URL}managers`, { headers })
            ]);
            if (resEmp.ok) setEmployees(await resEmp.json());
            if (resMan.ok) setManagers(await resMan.json());
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // PROMOCIÓN DIRECTA: Sin pop-ups de texto
    const handlePromote = async (empId) => {
        const res = await fetch(`${API_URL}employees/${empId}/promote`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ position: "Manager" }) // Cargo por defecto
        });

        if (res.ok) {
            fetchData();
        }
    };

    // REVOCAR DIRECTO
    const handleToggleStatus = async (manId) => {
        const res = await fetch(`${API_URL}managers/${manId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchData();
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold"><i className="fas fa-user-shield me-2 text-primary"></i>Gestión de Rangos</h2>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>
            </div>

            <div className="row g-4">
                {/* LISTADO DE MANAGERS */}
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white py-3">Managers Activos</div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {managers.filter(m => m.is_active).length === 0 ? (
                                    <li className="list-group-item text-muted text-center py-4">No hay managers activos</li>
                                ) : (
                                    managers.filter(m => m.is_active).map(m => (
                                        <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                            <span className="fw-bold">{m.first_name} {m.last_name}</span>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleToggleStatus(m.id)}>
                                                Revocar
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* LISTADO DE EMPLEADOS PARA PROMOCIÓN */}
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white py-3">Promover a Manager</div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {employees.filter(e => !managers.some(m => m.employee_id === e.id && m.is_active)).map(e => (
                                    <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                        <span>{e.first_name} {e.last_name}</span>
                                        <button className="btn btn-success btn-sm" onClick={() => handlePromote(e.id)}>
                                            Promover
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}