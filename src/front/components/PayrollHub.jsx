import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PayrollHub = () => {
    const { actions } = useGlobalReducer();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ employee_id: "", month: "", url: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await actions.getEmployees();
            setEmployees(data);
        };
        loadEmployees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { ok } = await actions.apiFetch("/payroll/upload", "POST", formData);
        if (ok) {
            alert("Payroll uploaded successfully!");
            setFormData({ employee_id: "", month: "", url: "" });
        }
        setLoading(false);
    };

    return (
        <div className="container py-4">
            <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h2 className="fw-bold mb-4"><i className="bi bi-file-earmark-pdf me-2"></i>Payroll Distribution</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Select Employee</label>
                        <select
                            className="form-select"
                            value={formData.employee_id}
                            onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                            required
                        >
                            <option value="">Choose an employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold">Month / Year</label>
                            <input
                                type="text" className="form-control" placeholder="e.g. October 2026"
                                value={formData.month}
                                onChange={e => setFormData({ ...formData, month: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold">Document URL (PDF)</label>
                            <input
                                type="url" className="form-control" placeholder="https://storage.com/doc.pdf"
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-100 fw-bold mt-3">
                        {loading ? "Processing..." : "Assign Payroll"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PayrollHub;