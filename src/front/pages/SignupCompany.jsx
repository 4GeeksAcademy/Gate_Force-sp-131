import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const SignupCompany = () => {
    const { actions } = useGlobalReducer();
    const [nombre, setNombre] = useState("");
    const [password, setPassword] = useState("");
    const [region, setRegion] = useState("");
    const [status, setStatus] = useState({ type: "", msg: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await actions.signupCompany(nombre, password, region);


        if (result.success) {
            setStatus({ type: "success", msg: "¡Empresa creada! Redirigiendo al login..." });
            setTimeout(() => navigate("/login-company"), 2000);
        } else {
            setStatus({ type: "danger", msg: result.msg });
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <div className="card p-4 shadow">
                <h3 className="text-center mb-4">Registrar Empresa</h3>
                {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre de la Empresa"
                        className="form-control mb-3"
                        onChange={e => setNombre(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="form-control mb-3"
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Región / Ciudad"
                        className="form-control mb-3"
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-success w-100">
                        Crear Cuenta de Empresa
                    </button>
                </form>
                <button className="btn btn-link w-100 mt-2" onClick={() => navigate("/login-company")}>
                    ¿Ya tienes cuenta? Logueate
                </button>
            </div>
        </div>
    );
};

export default SignupCompany;