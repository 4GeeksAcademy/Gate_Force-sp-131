import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [uploadingId, setUploadingId] = useState(null);
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

    const handleLogoUpload = async (e, companyId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(companyId);

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const cloudinaryData = await cloudinaryRes.json();

            if (!cloudinaryRes.ok || !cloudinaryData.secure_url) {
                throw new Error("No se pudo subir la imagen");
            }

            const updateRes = await authFetch(`${API_URL}companies/${companyId}`, {
                method: "PUT",
                body: JSON.stringify({
                    logo_url: cloudinaryData.secure_url
                })
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json().catch(() => ({}));
                throw new Error(errorData.msg || "No se pudo guardar el logo");
            }

            getCompanies();
        } catch (error) {
            console.error("Error al subir logo:", error);
            alert(error.message || "Error al subir logo");
        } finally {
            setUploadingId(null);
            e.target.value = "";
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
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        {company.logo_url ? (
                                            <img
                                                src={company.logo_url}
                                                alt={company.nombre_empresa}
                                                className="rounded-circle border"
                                                style={{ width: "64px", height: "64px", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div
                                                className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: "64px", height: "64px", fontSize: "24px", fontWeight: "bold" }}
                                            >
                                                {company.nombre_empresa?.charAt(0)}
                                            </div>
                                        )}

                                        <div>
                                            <h5 className="card-title fw-bold mb-1">{company.nombre_empresa}</h5>
                                            <span className={`badge ${company.is_active ? "bg-success" : "bg-secondary"}`}>
                                                {company.is_active ? "Activa" : "Inactiva"}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mb-2">
                                        <strong>Email:</strong> {company.email || "Sin email"}
                                    </p>
                                    <p className="mb-3">
                                        <strong>Región:</strong> {company.region}
                                    </p>

                                    <div className="d-grid gap-2 mb-3">
                                        <label className="btn btn-outline-secondary btn-sm">
                                            {uploadingId === company.id ? "Subiendo logo..." : "Cambiar logo"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => handleLogoUpload(e, company.id)}
                                                disabled={uploadingId === company.id}
                                            />
                                        </label>
                                    </div>

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
export default CompaniesPage;
