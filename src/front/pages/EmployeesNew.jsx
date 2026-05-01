import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeesForm from "../components/EmployeesForm.jsx";

export default function CreateEmployee() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [loadingCompanyContext, setLoadingCompanyContext] = useState(true);

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
        return response;
    };

    useEffect(() => {
        const loadContext = async () => {
            try {
                if (role === "admin") {
                    const res = await authFetch(`${API_URL}companies`);
                    const data = await res.json();
                    setCompanies(Array.isArray(data) ? data : []);
                }

                if (role === "company") {
                    const res = await authFetch(`${API_URL}company/dashboard`);
                    const data = await res.json();

                    if (res.ok && data?.id) {
                        setSelectedCompanyId(String(data.id));
                    }
                }
            } catch (error) {
                console.error("Error cargando contexto de empresa:", error);
            } finally {
                setLoadingCompanyContext(false);
            }
        };

        loadContext();
    }, [role]);

    const handleCreate = async (formData) => {
        try {
            const payload = {
                ...formData,
                company_id: selectedCompanyId
            };

            const res = await authFetch(`${API_URL}employees`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                navigate("/employees");
            } else {
                const errorData = await res.json();
                alert("Error: " + (errorData.msg || "No se pudo crear"));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (loadingCompanyContext) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {role === "admin" && (
                <div className="card shadow-sm p-4 mb-4">
                    <h5 className="mb-3">Asignar empresa</h5>
                    <select
                        className="form-select"
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Selecciona una empresa</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.nombre_empresa}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {role === "company" && (
                <div className="alert alert-info">
                    El empleado se creará en tu empresa actual.
                </div>
            )}

            <EmployeesForm onSubmit={handleCreate} />
        </div>
    );
}
