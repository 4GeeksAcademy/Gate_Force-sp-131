import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashboardEmployee = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    useEffect(() => {
        const load = async () => {
            try {
                if (!store.employeeInfo) {
                    const result = await actions.getEmployeeData();
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
    }, [store.employeeInfo, actions, navigate]);

    const emp = store.employeeInfo;

    const handleLogout = () => {
        actions.logout();
        navigate("/login-employee");
    };

    const handleProfileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !emp?.id) return;

        setUploading(true);
        setError(null);

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                throw new Error("Faltan variables de Cloudinary en el .env");
            }

            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("upload_preset", uploadPreset);

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: uploadData
                }
            );

            const cloudinaryJson = await cloudinaryRes.json();

            if (!cloudinaryRes.ok || !cloudinaryJson.secure_url) {
                throw new Error("No se pudo subir la imagen a Cloudinary");
            }

            const token = localStorage.getItem("token");
            const saveRes = await fetch(`${API_URL}employees/${emp.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    profile_image: cloudinaryJson.secure_url
                })
            });

            const saveJson = await saveRes.json().catch(() => ({}));

            if (!saveRes.ok) {
                throw new Error(saveJson.msg || "No se pudo guardar la foto");
            }

            await actions.getEmployeeData();
        } catch (err) {
            console.error(err);
            setError(err.message || "No se pudo subir la foto de perfil.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

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
                        <div className="col-auto text-center">
                            {emp.profile_image ? (
                                <img
                                    src={emp.profile_image}
                                    alt="Foto de perfil"
                                    className="rounded-circle border"
                                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                />
                            ) : (
                                <div
                                    className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "80px", height: "80px", fontSize: "35px" }}
                                >
                                    {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                                </div>
                            )}

                            <label className="btn btn-sm btn-outline-secondary mt-2">
                                {uploading ? "Subiendo..." : "Cambiar foto"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    disabled={uploading}
                                    onChange={handleProfileUpload}
                                />
                            </label>
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
                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                                    Email
                                </small>
                                <span>{emp.email}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-3 border rounded bg-light">
                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                                    Teléfono
                                </small>
                                <span>{emp.phone || "—"}</span>
                            </div>
                        </div>
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
