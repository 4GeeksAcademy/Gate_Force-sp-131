import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BG = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1920&auto=format&fit=crop";

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
            const map = { ADMIN: "/admin-dashboard", COMPANY: "/company-dashboard", EMPLOYEE: "/employee-dashboard" };
            navigate(map[store.role] || "/");
        }
    }, [store.token, store.role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const result = await actions.login(email, password);
        if (result.success) {
            const from = location.state?.from?.pathname || {
                ADMIN: "/admin-dashboard",
                COMPANY: "/company-dashboard",
                EMPLOYEE: "/employee-dashboard",
            }[result.role];
            navigate(from, { replace: true });
        } else {
            setError(result.msg || "Invalid credentials.");
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, overflow: "auto", background: "#fff" }}>
            <div className="container-fluid px-0">
                <div className="row g-0 min-vh-100">

                    {/* ── LEFT: hero ── */}
                    <div className="col-md-6">
                        <div className="d-flex align-items-center h-100"
                            style={{ position: "relative", minHeight: "100vh" }}>

                            {/* overlay — GateForce orange at 85% */}
                            <div style={{
                                position: "absolute", inset: 0, zIndex: 1,
                                background: "#ff6b00", opacity: 0.85
                            }} />

                            {/* background image */}
                            <div style={{
                                position: "absolute", inset: 0, zIndex: 0,
                                backgroundImage: `url('${BG}')`,
                                backgroundSize: "cover", backgroundPosition: "center"
                            }} />

                            {/* content */}
                            <div style={{
                                position: "relative", zIndex: 2,
                                width: "100%", minHeight: "100vh",
                                display: "flex", flexDirection: "column"
                            }}>
                                {/* welcome text — vertically centered */}
                                <div className="row g-0 my-auto">
                                    <div className="col-11 col-sm-10 col-lg-9 mx-auto">
                                        <h1 style={{
                                            fontSize: "clamp(2rem, 4vw, 3rem)",
                                            color: "#fff", fontWeight: 800, marginBottom: "1rem"
                                        }}>
                                            Welcome back!
                                        </h1>
                                        <p style={{
                                            fontSize: "1rem", color: "#fff",
                                            lineHeight: 1.8, opacity: 0.9, marginBottom: "3rem"
                                        }}>
                                            We are glad to see you again! Get access to your workforce
                                            management portal, payroll and team records.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ── LEFT end ── */}

                    {/* ── RIGHT: form ── */}
                    <div className="col-md-6 d-flex" style={{ background: "#fff" }}>
                        <div className="container my-auto py-5">
                            <div className="row g-0">
                                <div className="col-11 col-sm-10 col-lg-9 col-xl-8 mx-auto">

                                    {/* GateForce home link — replaces the hidden navbar */}
                                    <a href="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
                                        <i className="bi bi-shield-check-fill"
                                            style={{ fontSize: 22, color: "#ff6b00" }} />
                                        <span style={{ fontWeight: 800, fontSize: 18, color: "#212529", letterSpacing: -0.5 }}>
                                            GateForce
                                        </span>
                                    </a>

                                    <h3 style={{ fontWeight: 600, marginBottom: "1.5rem", color: "#212529" }}>
                                        Log In
                                    </h3>

                                    {error && (
                                        <div className="alert alert-danger py-2 small mb-3" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="emailAddress" className="form-label"
                                                style={{ color: "#212529" }}>
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="emailAddress"
                                                required
                                                placeholder="Enter Your Email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="loginPassword" className="form-label"
                                                style={{ color: "#212529" }}>
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="loginPassword"
                                                required
                                                placeholder="Enter Password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                            />
                                        </div>

                                        <div className="row mt-4">
                                            <div className="col">
                                                <div className="form-check">
                                                    <input
                                                        id="remember-me"
                                                        name="remember"
                                                        className="form-check-input"
                                                        type="checkbox"
                                                    />
                                                    <label className="form-check-label text-muted"
                                                        htmlFor="remember-me">
                                                        Remember Me
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col text-end">
                                                <a href="#!" style={{ color: "#ff6b00", textDecoration: "none" }}>
                                                    Forgot Password ?
                                                </a>
                                            </div>
                                        </div>

                                        <div className="d-grid my-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                style={{
                                                    background: "#ff6b00", color: "#fff",
                                                    border: "none", fontWeight: 600,
                                                    padding: "10px 0", borderRadius: 6,
                                                    fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "center", gap: 8
                                                }}
                                            >
                                                {loading && <span className="spinner-border spinner-border-sm" />}
                                                Login
                                            </button>
                                        </div>
                                    </form>

                                    <p className="text-center text-muted mb-0">
                                        Don't have an account?{" "}
                                        <Link to="/signup"
                                            style={{ color: "#ff6b00", fontWeight: 600, textDecoration: "none" }}>
                                            Sign Up
                                        </Link>
                                    </p>

                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ── RIGHT end ── */}

                </div>
            </div>
        </div>
    );
};

export default Login;
