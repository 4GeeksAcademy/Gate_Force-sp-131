import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const SignupEmployee = () => {
    const { actions } = useGlobalReducer();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        position: ""
    });
    const [status, setStatus] = useState({ type: "", msg: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await actions.signupEmployee(formData);
        if (result.success) {
            setStatus({ type: "success", msg: "¡Cuenta creada! Redirigiendo al login..." });
            setTimeout(() => navigate("/login-employee"), 2000);
        } else {
            setStatus({ type: "danger", msg: result.msg });
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto shadow" style={{ maxWidth: "400px" }}>
                <div className="text-center mb-4">
                    <div className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "64px", height: "64px" }}>
                        <span style={{ fontSize: "28px" }}>👤</span>
                    </div>
                    <h2 className="fw-bold">Registro Empleado</h2>
                    <p className="text-muted">Crea tu cuenta para continuar</p>
                </div>
                {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Nombre</label>
                        <input name="first_name" type="text" className="form-control" placeholder="Juan" value={formData.first_name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Apellido</label>
                        <input name="last_name" type="text" className="form-control" placeholder="García" value={formData.last_name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <input name="email" type="email" className="form-control" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Contraseña</label>
                        <input name="password" type="password" className="form-control" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Teléfono</label>
                        <input name="phone" type="text" className="form-control" placeholder="+34 600 000 000" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Cargo</label>
                        <input name="position" type="text" className="form-control" placeholder="Desarrollador" value={formData.position} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-dark w-100 mb-2">
                        Crear Cuenta
                    </button>
                    <button type="button" className="btn btn-link w-100" onClick={() => navigate("/login-employee")}>
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupEmployee;