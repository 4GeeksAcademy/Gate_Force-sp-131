import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashBoardCompany = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [pendingVacaciones, setPendingVacaciones] = useState([]);

    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const token = localStorage.getItem("token");

    const authFetch = (url, method = "GET", body = null) => {
        return fetch(url, {
            method,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            ...(body && { body: JSON.stringify(body) })
        });
    };

    const fetchPendingVacaciones = async () => {
        const res = await authFetch(`${API_URL}vacaciones`);
        const data = await res.json();
        if (Array.isArray(data)) setPendingVacaciones(data.filter(v => v.status === "pending" && v.start_date));
    };

    useEffect(() => {
        const init = async () => {
            try {
                const success = await actions.getCompanyData();
                if (!success) navigate("/login-company");
                await fetchPendingVacaciones();
            } catch (err) {
                setError("No se pudo cargar la información de la empresa.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleVacacionStatus = async (vacacion, newStatus) => {
        await authFetch(`${API_URL}employees/${vacacion.employee_id}/vacaciones/${vacacion.id}`, "PUT", { status: newStatus });
        fetchPendingVacaciones();
    };

    const handleLogout = () => { actions.logout(); navigate("/login-company"); };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !store.companyInfo?.id) return;
        setUploading(true);
        try {
            const { VITE_CLOUDINARY_CLOUD_NAME: cloudName, VITE_CLOUDINARY_UPLOAD_PRESET: uploadPreset } = import.meta.env;
            if (!cloudName || !uploadPreset) throw new Error("Faltan variables de Cloudinary");
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            const { secure_url } = await (await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData })).json();
            if (!secure_url) throw new Error("No se pudo subir la imagen");
            const res = await authFetch(`${API_URL}companies/${store.companyInfo.id}`, "PUT", { logo_url: secure_url });
            if (!res.ok) throw new Error("No se pudo guardar la imagen");
            await actions.getCompanyData();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status" />
        </div>
    );

    const company = store.companyInfo;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-end mb-3">
                <button onClick={handleLogout} className="btn btn-outline-danger">
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>
            {error && <div className="alert alert-danger text-center">{error}</div>}

            <div className="text-center mb-4">
                <div className="d-flex flex-column align-items-center mb-3">
                    {company?.logo_url ? (
                        <img src={company.logo_url} alt={company.nombre_empresa} className="rounded-circle border shadow-sm" style={{ width: "96px", height: "96px", objectFit: "cover" }} />
                    ) : (
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "96px", height: "96px", fontSize: "36px", fontWeight: "bold" }}>
                            {company?.nombre_empresa?.charAt(0) || "E"}
                        </div>
                    )}
                    <label className="btn btn-sm btn-outline-secondary mt-3">
                        {uploading ? "Subiendo..." : "Cambiar foto"}
                        <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleLogoUpload} />
                    </label>
                </div>
                <h1 className="display-5 fw-bold">Bienvenido, {company?.nombre_empresa || "Empresa"}</h1>
                <p className="lead text-muted">Panel de Gestión Administrativa</p>
            </div>

            <div className="row mt-4">
                {[
                    { title: "Empleados", text: "Gestiona tu equipo", btn: "btn-primary", path: "/employees", label: "Ver empleados" },
                    { title: "Vacaciones", text: "Controla días libres", btn: "btn-success", path: "/vacaciones", label: "Ver vacaciones" }
                ].map(({ title, text, btn, path, label }) => (
                    <div key={title} className="col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body text-center">
                                <h5 className="card-title">{title}</h5>
                                <p className="text-muted">{text}</p>
                                <button className={`btn ${btn}`} onClick={() => navigate(path)}>{label}</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5">
                <h4 className="fw-bold mb-3">
                    Solicitudes de Vacaciones Pendientes
                    {pendingVacaciones.length > 0 && <span className="badge bg-warning text-dark ms-2">{pendingVacaciones.length}</span>}
                </h4>
                {pendingVacaciones.length === 0 ? (
                    <p className="text-muted">No hay solicitudes pendientes.</p>
                ) : (
                    <ul className="list-group">
                        {pendingVacaciones.map(v => (
                            <li key={v.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Empleado ID: {v.employee_id}</strong>
                                    <div className="text-muted" style={{ fontSize: "0.9em" }}>
                                        {v.start_date} al {v.end_date} — {v.days_requested} dias
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-success" onClick={() => handleVacacionStatus(v, "approved")}>Aprobar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleVacacionStatus(v, "rejected")}>Rechazar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DashBoardCompany;