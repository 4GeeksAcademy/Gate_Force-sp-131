import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditCompany() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Estado para los campos de la empresa
    const [formData, setFormData] = useState({
        nombre_empresa: "",
        email: "",
        region: "",
        is_active: true
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Cargar los datos actuales de la empresa
    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await authFetch(`${API_URL}companies/${id}`);
                const data = await res.json();
                setFormData({
                    nombre_empresa: data.nombre_empresa || "",
                    email: data.email || "",
                    region: data.region || "",
                    is_active: data.is_active ?? true
                });
                setLoading(false);
            } catch (err) {
                setError("No se pudo cargar la información de la empresa.");
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authFetch(`${API_URL}companies/${id}`, {
                method: "PUT",
                body: JSON.stringify(formData)
            });
            // Te manda de vuelta a la lista de empresas que me pasaste
            navigate("/company"); 
        } catch (err) {
            alert("Error al actualizar: " + err.message);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm p-4">
                        <h2 className="mb-4 text-center">Editar Empresa</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="nombre_empresa"
                                    value={formData.nombre_empresa}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Email de Contacto</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Región</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4 form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_active"
                                    id="isActiveCheck"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="isActiveCheck">
                                    Empresa Activa
                                </label>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary w-100">
                                    Guardar Cambios
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => navigate("/company")}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}