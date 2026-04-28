import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCompany() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre_empresa: "",
        email: "",
        password: "",
        region: "",
        is_active: true
    });

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

    const handleChange = (e) => {
        const value = e.target.name === "is_active"
            ? e.target.value === "true"
            : e.target.value;

        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            const res = await authFetch(`${API_URL}companies`, {
                method: "POST",
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                navigate("/company");
            } else {
                const errorData = await res.json();
                alert("Error: " + (errorData.msg || "No se pudo crear la empresa"));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4">
                <h2 className="mb-4 text-center">Crear Empresa</h2>

                <form onSubmit={handleCreate}>
                    <div className="mb-3">
                        <label className="form-label">Nombre de la empresa</label>
                        <input
                            type="text"
                            name="nombre_empresa"
                            className="form-control"
                            value={formData.nombre_empresa}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Región</label>
                        <input
                            type="text"
                            name="region"
                            className="form-control"
                            value={formData.region}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Estado</label>
                        <select
                            name="is_active"
                            className="form-select"
                            value={String(formData.is_active)}
                            onChange={handleChange}
                        >
                            <option value="true">Activa</option>
                            <option value="false">Inactiva</option>
                        </select>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success w-100">
                            Crear empresa
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
    );
}
