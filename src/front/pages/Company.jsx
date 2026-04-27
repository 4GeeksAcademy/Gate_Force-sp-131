import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const navigate = useNavigate();

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

    const getCompanies = async () => {
        try {
            const res = await authFetch(`${API_URL}companies`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCompanies(data);
            } else {
                setCompanies([]);
            }
        } catch (error) {
            console.error("Error al obtener companies:", error);
            setCompanies([]);
        }
    };

    useEffect(() => {
        getCompanies();
    }, []);

    const deleteCompany = async (id) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta empresa?");
        if (!confirmDelete) return;

        try {
            const res = await authFetch(`${API_URL}companies/${id}`, { method: "DELETE" });
            if (res.ok) {
                getCompanies();
            } else {
                const errorData = await res.json();
                alert(errorData.msg || "No se pudo eliminar la empresa");
            }
        } catch (error) {
            console.error("Error al eliminar empresa:", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Empresas</h1>
                <button
                    className="btn btn-success"
                    onClick={() => navigate("/company/new")}
                >
                    <i className="fas fa-plus me-2"></i>Nueva empresa
                </button>
            </div>

            {companies.length === 0 ? (
                <div className="alert alert-info">No hay empresas registradas.</div>
            ) : (
                <div className="row">
                    {companies.map((company) => (
                        <div key={company.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold">{company.nombre_empresa}</h5>
                                    <p className="mb-2">
                                        <strong>Email:</strong> {company.email || "Sin email"}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Región:</strong> {company.region}
                                    </p>
                                    <p className="mb-3">
                                        <strong>Estado:</strong>{" "}
                                        <span className={`badge ${company.is_active ? "bg-success" : "bg-secondary"}`}>
                                            {company.is_active ? "Activa" : "Inactiva"}
                                        </span>
                                    </p>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-outline-primary w-100"
                                            onClick={() => navigate(`/company/edit/${company.id}`)}
                                        >
                                            <i className="fas fa-edit me-1"></i>Editar
                                        </button>
                                        <button
                                            className="btn btn-outline-danger w-100"
                                            onClick={() => deleteCompany(company.id)}
                                        >
                                            <i className="fas fa-trash-alt me-1"></i>Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
