import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function EmployeesPage() {
    // Mantenemos tu lógica de URL intacta
    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorDetail = await response.json().catch(() => ({ msg: "Error interno del servidor" }));
                throw new Error(errorDetail.msg || `Error ${response.status}`);
            }
            return response;
        } catch (err) {
            console.error("Error en la comunicación:", err.message);
            throw err;
        }
    };

    const getEmployees = async () => {
        try {
            const res = await authFetch(`${API_URL}employees`);
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const deleteEmployee = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
            try {
                const res = await authFetch(`${API_URL}employees/${id}`, { method: "DELETE" });
                if (res.ok) getEmployees();
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    const toggleEmployee = async (id) => {
        try {
            const res = await authFetch(`${API_URL}employees/${id}/toggle`, { method: "PUT" });

            if (res.ok) {
                setEmployees(prev => prev.map(emp =>
                    emp.id === id ? { ...emp, is_active: !emp.is_active } : emp
                ));
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Plantilla de Empleados</h2>
                <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
                    <i className="fas fa-plus me-2"></i>Crear empleado
                </button>
            </div>

            <div className="table-responsive shadow-sm rounded">
                <table className="table table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Posición</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>{emp.first_name} {emp.last_name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.position || "—"}</td>
                                <td>
                                    <span className={`badge ${emp.is_active ? "bg-success" : "bg-danger"}`}>
                                        {emp.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-group">
                                        <button className="btn btn-sm btn-outline-warning" onClick={() => navigate(`/employees/edit/${emp.id}`)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleEmployee(emp.id)}>
                                            <i className={emp.is_active ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteEmployee(emp.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-info"
                                            onClick={() => navigate(`/horarios/${emp.id}`)}
                                        >
                                            Horarios
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                className="btn btn-outline-primary mb-3"
                onClick={() => navigate("/company-dashboard")}
            >
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Panel
            </button>
        </div>
    );
}