import { useState } from "react";
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
        const result = await actions.loginEmployee({ email, password });
        if (result.success) {
            navigate("/employee-dashboard");
        } else {
            setError(result.msg || "Credenciales incorrectas");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
                <h2 className="text-center">Login Empleado</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        className="form-control mb-2"
                        placeholder="Email"
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="form-control mb-2"
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <div className="d-flex justify-content-between mt-3">
                        <button type="submit" className="btn btn-primary">Entrar</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate("/signup-employee")}
                        >
                            Registrarse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginEmployee;