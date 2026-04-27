import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeesForm.jsx";

export default function EditEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [error, setError] = useState(null);

    const role = localStorage.getItem("role");

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({ msg: "Error en la operación" }));
            throw new Error(errorDetail.msg || `Error ${response.status}`);
        }

        return response;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await authFetch(`${API_URL}employees/${id}`);
                const data = await res.json();
                setEmployee(data);
                setSelectedCompanyId(String(data.company_id || ""));

                if (role === "admin") {
                    const companiesRes = await authFetch(`${API_URL}companies`);
                    const companiesData = await companiesRes.json();
                    setCompanies(Array.isArray(companiesData) ? companiesData : []);
                }
            } catch (err) {
                setError("No se pudo cargar la información del empleado.");
            }
        };

        fetchData();
    }, [id, role]);

    const handleUpdate = async (formData) => {
        try {
            const payload = {
                ...formData,
                ...(role === "admin" ? { company_id: selectedCompanyId } : {})
            };

            await authFetch(`${API_URL}employees/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            navigate("/employees");
        } catch (err) {
            alert("Error al actualizar: " + err.message);
        }
    };

    if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

    if (!employee) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4">
                <h2 className="mb-4 text-center">Editar Empleado</h2>

                {role === "admin" && (
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Empresa</label>
                        <select
                            className="form-select"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                        >
                            <option value="">Selecciona una empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.nombre_empresa}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <EmployeeForm
                    initialData={employee}
                    onSubmit={handleUpdate}
                    isEdit={true}
                />
            </div>
        </div>
    );
}
