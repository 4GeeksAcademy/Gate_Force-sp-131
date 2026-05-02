import React from "react";
import EmployeeList from "../components/EmployeeList";
import { useNavigate } from "react-router-dom";

const ManageEmployees = () => {
    const navigate = useNavigate();

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Staff Management</h2>
                    <p className="text-muted">View, edit, and manage your company's workforce.</p>
                </div>
                <button
                    className="btn btn-primary fw-bold"
                    onClick={() => navigate("/create-employee")}
                >
                    <i className="bi bi-person-plus me-2"></i>Add New Employee
                </button>
            </div>

            <EmployeeList />
        </div>
    );
};

export default ManageEmployees;