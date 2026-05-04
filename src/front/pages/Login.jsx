import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // Importamos Link
import useGlobalReducer from "../hooks/useGlobalReducer";

const Login = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (store.token) {
            const dashboardMap = {
                "ADMIN": "/admin-dashboard",
                "COMPANY": "/company-dashboard",
                "EMPLOYEE": "/employee-dashboard"
            };
            navigate(dashboardMap[store.role] || "/");
        }
    }, [store.token, store.role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await actions.login(email, password);

        if (result.success) {
            const from = location.state?.from?.pathname || {
                "ADMIN": "/admin-dashboard",
                "COMPANY": "/company-dashboard",
                "EMPLOYEE": "/employee-dashboard"
            }[result.role];

            navigate(from, { replace: true });
        } else {
            setError(result.msg || "Invalid credentials.");
            setLoading(false);
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card p-4 shadow-sm border-0" style={{ width: "100%", maxWidth: "400px" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">GateForce</h2>
                    <p className="text-muted small">Access your management portal</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 text-center" role="alert">
                        <small>{error}</small>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email / Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : "Sign In"}
                    </button>
                </form>

                {/* --- EL ANEXO DE REGISTRO --- */}
                <hr className="my-4 text-muted" />

                <div className="text-center">
                    <p className="small text-muted mb-1">Are you a new company?</p>
                    <Link to="/signup" className="text-primary fw-bold text-decoration-none">
                        Create a company account <i className="bi bi-arrow-right small"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;