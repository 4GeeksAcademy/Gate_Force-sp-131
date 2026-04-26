import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const LoginAdmin = () => {
    const { actions } = useGlobalReducer();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await actions.loginAdmin({ username, password });
        if (result.success) {
            navigate("/admin-dashboard");
        } else {
            setError(result.msg || "Credenciales incorrectas");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const res = await fetch(`${API_URL}admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess("Admin creado correctamente. Ya puedes hacer login.");
            setMode("login");
        } else {
            setError(data.msg || "Error al registrar");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
                <h2 className="text-center">{mode === "login" ? "Login Admin" : "Registro Admin"}</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Username"
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="form-control mb-2"
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-danger w-100 mt-2">
                        {mode === "login" ? "Entrar" : "Registrarse"}
                    </button>
                </form>

                <div className="text-center mt-3">
                    {mode === "login" ? (
                        <span>
                            ¿No tienes cuenta?{" "}
                            <button className="btn btn-link p-0" onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
                                Crear admin
                            </button>
                        </span>
                    ) : (
                        <span>
                            ¿Ya tienes cuenta?{" "}
                            <button className="btn btn-link p-0" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                                Iniciar sesión
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;