import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const SignupEmployee = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [status, setStatus] = useState({ type: "", msg: "" });

    const [formData, setFormData] = useState({
        company_id: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        position: ""
    });

    const authFetch = async (url, options = {}) => {
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/login-company");
    };

    useEffect(() => {
        const loadCompanyContext = async () => {
            if (role !== "admin" && role !== "company") return;

            try {
                if (role === "admin") {
                    setLoadingCompanies(true);
                    const res = await authFetch(`${API_URL}companies`);
                    const data = await res.json();

                    if (res.ok && Array.isArray(data)) {
                        setCompanies(data);
                    } else {
                        setStatus({ type: "danger", msg: "No se pudieron cargar las empresas." });
                    }
                }

                if (role === "company") {
                    const res = await authFetch(`${API_URL}company/dashboard`);
                    const data = await res.json();

                    if (res.ok && data?.id) {
                        setFormData(prev => ({
                            ...prev,
                            company_id: String(data.id)
                        }));
                        setCompanyName(data.nombre_empresa || "Empresa actual");
                    } else {
                        setStatus({ type: "danger", msg: "No se pudo identificar la empresa logueada." });
                    }
                }
            } catch (error) {
                setStatus({ type: "danger", msg: "Error al cargar datos de empresa." });
            } finally {
                setLoadingCompanies(false);
            }
        };

        loadCompanyContext();
    }, [role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await actions.signupEmployee(formData);

        if (result.success) {
            setStatus({ type: "success", msg: "Empleado creado correctamente." });
            setTimeout(() => navigate("/employees"), 1500);
        } else {
            setStatus({ type: "danger", msg: result.msg || "No se pudo crear el empleado." });
        }
    };

    if (role !== "admin" && role !== "company") {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    No tienes permisos para crear empleados.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto shadow" style={{ maxWidth: "500px" }}>
                <div className="text-center mb-4">
                    <div
                        className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "64px", height: "64px" }}
                    >
                        <span style={{ fontSize: "28px" }}>👤</span>
                    </div>
                    <h2 className="fw-bold">Crear Empleado</h2>
                    <p className="text-muted">Rellena los datos del nuevo empleado</p>
                </div>

                {role === "company" && companyName && (
                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                        <span>
                            Estas creando el empleado para <strong>{companyName}</strong>
                        </span>
                        <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={handleLogout}
                        >
                            No es tu empresa? Cierra sesion
                        </button>
                    </div>
                )}

                {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}

                <form onSubmit={handleSubmit}>
                    {role === "admin" && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Empresa</label>
                            <select
                                name="company_id"
                                className="form-select"
                                value={formData.company_id}
                                onChange={handleChange}
                                required
                                disabled={loadingCompanies}
                            >
                                <option value="">Selecciona una empresa</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.nombre_empresa}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Nombre</label>
                        <input
                            name="first_name"
                            type="text"
                            className="form-control"
                            placeholder="Juan"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Apellido</label>
                        <input
                            name="last_name"
                            type="text"
                            className="form-control"
                            placeholder="García"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Teléfono</label>
                        <input
                            name="phone"
                            type="text"
                            className="form-control"
                            placeholder="+34 600 000 000"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold">Cargo</label>
                        <input
                            name="position"
                            type="text"
                            className="form-control"
                            placeholder="Desarrollador"
                            value={formData.position}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn btn-dark w-100 mb-2">
                        Crear empleado
                    </button>

                    <button
                        type="button"
                        className="btn btn-link w-100"
                        onClick={() => navigate("/employees")}
                    >
                        Volver
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupEmployee;
