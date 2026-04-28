import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashBoardCompany = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    useEffect(() => {
        const init = async () => {
            try {
                const success = await actions.getCompanyData();
                if (!success) {
                    navigate("/login-company");
                }
            } catch (error) {
                console.error("ERROR:", error);
                setError("No se pudo cargar la información de la empresa.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [actions, navigate]);

    const handleLogout = () => {
        actions.logout();
        navigate("/login-company");
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !store.companyInfo?.id) return;

        setUploading(true);
        setError(null);

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                throw new Error("Faltan variables de Cloudinary en el .env");
            }

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
                throw new Error("No se pudo subir la imagen a Cloudinary");
            }

            const token = localStorage.getItem("token");

            const saveRes = await fetch(`${API_URL}companies/${store.companyInfo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    logo_url: cloudinaryData.secure_url
                })
            });

            const saveJson = await saveRes.json().catch(() => ({}));

            if (!saveRes.ok) {
                throw new Error(saveJson.msg || "No se pudo guardar la imagen");
            }

            await actions.getCompanyData();
        } catch (err) {
            console.error(err);
            setError(err.message || "No se pudo subir la foto de perfil.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    const company = store.companyInfo;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-end mb-3">
                <button onClick={handleLogout} className="btn btn-outline-danger shadow-sm">
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>

            {error && (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            )}

            <div className="text-center mb-4">
                <div className="d-flex flex-column align-items-center mb-3">
                    {company?.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company?.nombre_empresa || "Empresa"}
                            className="rounded-circle border shadow-sm"
                            style={{ width: "96px", height: "96px", objectFit: "cover" }}
                        />
                    ) : (
                        <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: "96px", height: "96px", fontSize: "36px", fontWeight: "bold" }}
                        >
                            {company?.nombre_empresa?.charAt(0) || "E"}
                        </div>
                    )}

                    <label className="btn btn-sm btn-outline-secondary mt-3">
                        {uploading ? "Subiendo..." : "Cambiar foto"}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={uploading}
                            onChange={handleLogoUpload}
                        />
                    </label>
                </div>

                <h1 className="display-5 fw-bold">
                    Bienvenido, {company?.nombre_empresa || "Empresa"}
                </h1>
                <p className="lead text-muted">Panel de Gestión Administrativa</p>
            </div>

            <div className="row g-4 mb-5 justify-content-center">
                {/* Tarjeta de Empleados */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title">Empleados</h5>
                            <p className="text-muted">Gestiona tu equipo</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/employees")}
                            >
                                Ver empleados
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Vacaciones */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title">Vacaciones</h5>
                            <p className="text-muted">Controla días libres</p>
                            <button
                                className="btn btn-success"
                                onClick={() => navigate("/vacaciones")}
                            >
                                Ver vacaciones
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Incidencias */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title">Incidencias</h5>
                            <p className="text-muted">Atiende reportes y problemas</p>
                            <button
                                className="btn btn-warning text-dark fw-bold"
                                onClick={() => navigate("/incidents")}
                            >
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Ver incidencias
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Managers */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title">Managers</h5>
                            <p className="text-muted">Promociones y jerarquía</p>
                            <button
                                className="btn btn-dark fw-bold"
                                onClick={() => navigate("/manage-roles")}
                            >
                                <i className="fas fa-user-shield me-2"></i>
                                Gestionar Rangos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Encuestas */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title">Encuestas</h5>
                            <p className="text-muted">Gestiona encuestas y feedback</p>
                            <button
                                className="btn btn-info text-dark fw-bold"
                                onClick={() => navigate("/surveys")}
                            >
                                <i className="fas fa-poll me-2"></i>
                                Ver encuestas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashBoardCompany;
