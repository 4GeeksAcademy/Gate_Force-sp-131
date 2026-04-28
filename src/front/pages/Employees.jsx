import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeesPage() {
    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [companyName, setCompanyName] = useState("");
    const role = localStorage.getItem("role");

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
            let currentCompanyName = "";

            if (role === "company") {
                const companyRes = await authFetch(`${API_URL}company/dashboard`);
                const companyData = await companyRes.json();
                currentCompanyName = companyData.nombre_empresa || "";
                setCompanyName(currentCompanyName);
            }

            const res = await authFetch(`${API_URL}employees`);
            const data = await res.json();
            const employeesData = Array.isArray(data) ? data : [];

            if (role === "company") {
                setEmployees(
                    employeesData.filter(emp => emp.nombre_empresa === currentCompanyName)
                );
            } else {
                setEmployees(employeesData);
            }
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
                <h2 className="fw-bold">
                    {role === "company" ? `Plantilla de: ${companyName}` : "Plantilla de Empleados"}
                </h2>
                <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
                    <i className="fas fa-plus me-2"></i>Crear empleado
                </button>
            </div>

            <div className="table-responsive shadow-sm rounded">
                <table className="table table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Foto</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Posición</th>
                            <th>Empresa</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>
                                    {emp.profile_image ? (
                                        <img
                                            src={emp.profile_image}
                                            alt={`${emp.first_name} ${emp.last_name}`}
                                            className="rounded-circle border"
                                            style={{ width: "44px", height: "44px", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: "44px", height: "44px", fontSize: "14px", fontWeight: "bold" }}
                                        >
                                            {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                                        </div>
                                    )}
                                </td>
                                <td>{emp.first_name} {emp.last_name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.position || "—"}</td>
                                <td>{emp.nombre_empresa || "Sin empresa"}</td>
                                <td>
                                    <span className={`badge ${emp.is_active ? "bg-success" : "bg-danger"}`}>
                                        {emp.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-group">
                                        <button
                                            className="btn btn-sm btn-outline-warning"
                                            onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => toggleEmployee(emp.id)}
                                        >
                                            <i className={emp.is_active ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => deleteEmployee(emp.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-info"
                                            onClick={() => navigate(`/horarios/${emp.id}`)}
                                        >
                                            Horarios
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/mis-nominas?employee_id=${emp.id}`)}
                                        >
                                            Nóminas
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => navigate(`/nominas/new?employee_id=${emp.id}`)}
                                        >
                                            Subir nómina
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
