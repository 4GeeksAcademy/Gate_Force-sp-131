import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const LoginEmployee = () => {
    const { actions } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await actions.loginEmployee({
            email: email,
            password: password
        });
        if (result.success) {
            navigate("/employee-dashboard");
        } else {
            setError(result.msg || "Credenciales incorrectas");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto shadow" style={{ maxWidth: "400px" }}>
                <div className="text-center mb-4">
                    <div className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "64px", height: "64px" }}>
                        <span style={{ fontSize: "28px" }}>👤</span>
                    </div>
                    <h2 className="fw-bold">Portal Empleado</h2>
                    <p className="text-muted">Inicia sesión para continuar</p>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="tu@email.com"
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100 mb-2">
                        Entrar
                    </button>
                    <button
                        type="button"
                        className="btn btn-link w-100"
                        onClick={() => navigate("/signup-employee")}
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </form>
                <div>
                    <button className="btn btn-secondary mt-3 btn btn-dark w-100 mb-2" onClick={() => navigate("/")}>
                        <i className="fas fa-arrow-left me-2"></i>Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginEmployee;