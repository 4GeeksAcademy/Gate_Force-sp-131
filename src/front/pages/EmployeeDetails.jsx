import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EmployeeDetails = () => {
    const { id } = useParams();
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const getInfo = async () => {
            const { ok, data } = await actions.apiFetch(`/employees/${id}`);
            if (ok) setEmployee(data);
        };
        getInfo();
    }, [id]);

    if (!employee) return <div className="text-center p-5 font-monospace">Loading employee profile...</div>;

    return (
        <div className="container py-4">
            <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i> Back to list
            </button>
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="bg-primary p-4 text-white">
                    <h3 className="fw-bold mb-0">{employee.first_name} {employee.last_name}</h3>
                    <span className="badge bg-white text-primary mt-2">{employee.position || "Employee"}</span>
                </div>
                <div className="card-body p-4">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold text-uppercase">Contact Information</label>
                            <p className="mb-1"><i className="bi bi-envelope me-2"></i> {employee.email}</p>
                            <p className="mb-0"><i className="bi bi-telephone me-2"></i> {employee.phone || "No phone registered"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold text-uppercase">System Status</label>
                            <p className="mb-1">Status: <span className={employee.is_active ? "text-success" : "text-danger"}>{employee.is_active ? "Active" : "Inactive"}</span></p>
                            <p className="mb-0">ID: #00{employee.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;