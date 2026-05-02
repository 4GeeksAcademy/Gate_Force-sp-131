import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CreateEmployee = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "EMPLOYEE" // Por defecto
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Usamos el endpoint que definimos en el backend: POST /employees
        const { ok, data } = await actions.apiFetch("/employees", "POST", formData);

        if (ok) {
            alert("Employee created successfully!");
            navigate("/company-dashboard");
        } else {
            setError(data.msg || "Error creating employee.");
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h2 className="fw-bold mb-4">Add New Employee</h2>
                
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold">First Name</label>
                            <input 
                                type="text" className="form-control" placeholder="John"
                                onChange={e => setFormData({...formData, first_name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold">Last Name</label>
                            <input 
                                type="text" className="form-control" placeholder="Doe"
                                onChange={e => setFormData({...formData, last_name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email Address</label>
                        <input 
                            type="email" className="form-control" placeholder="employee@company.com"
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold">Temporary Password</label>
                            <input 
                                type="password" className="form-control" placeholder="••••••••"
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold">Role</label>
                            <select 
                                className="form-select"
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button 
                            type="button" 
                            className="btn btn-light flex-grow-1"
                            onClick={() => navigate("/company-dashboard")}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary flex-grow-1 fw-bold"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Register Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployee;