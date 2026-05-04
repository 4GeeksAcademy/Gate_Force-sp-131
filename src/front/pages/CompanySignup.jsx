import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CompanySignup = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre_empresa: "",
        email: "",
        password: "",
        region: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Llamamos a la acción del Flux
        const { ok, data } = await actions.signupCompany(formData);

        if (ok) {
            // Registro exitoso, mandamos al login con un mensaje
            alert("Company registered successfully! Please log in.");
            navigate("/login");
        } else {
            setError(data.msg || "Error creating company account.");
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100 bg-light">
            <div className="row h-100">
                {/* Lado Izquierdo: Diseño/Brand */}
                <div className="col-lg-6 d-none d-lg-flex bg-primary align-items-center justify-content-center text-white">
                    <div className="p-5 text-center">
                        <h1 className="display-3 fw-bold">GateForce</h1>
                        <p className="lead"></p>
                    </div>
                </div>

                {/* Lado Derecho: Formulario */}
                <div className="col-lg-6 d-flex align-items-center justify-content-center">
                    <div className="card p-4 shadow-lg border-0" style={{ maxWidth: "500px", width: "100%" }}>
                        <h2 className="fw-bold mb-2">Register your Company</h2>
                        <p className="text-muted mb-4">Start managing your employees today.</p>

                        {error && <div className="alert alert-danger p-2 small">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Company Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ACME Corp."
                                    onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">Business Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="admin@acme.com"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="••••••••"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Region</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Europe/US"
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2 fw-bold mt-2"
                                disabled={loading}
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <small className="text-muted">
                                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySignup;