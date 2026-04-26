import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const LoginAdmin = () => {
    const { actions } = useGlobalReducer();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await actions.loginAdmin({ username, password });
        if (result.success) {
            navigate("/admin-dashboard");
        } else {
            setError(result.msg || "Credenciales incorrectas");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
                <h2 className="text-center">Login Admin</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
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
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;