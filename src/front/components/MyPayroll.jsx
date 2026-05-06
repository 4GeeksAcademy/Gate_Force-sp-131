import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const MyPayroll = () => {
    const { actions } = useGlobalReducer();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPayrolls = async () => {
            const { ok, data } = await actions.apiFetch("/payroll/mine");
            if (ok) setPayrolls(data);
            setLoading(false);
        };
        loadPayrolls();
    }, []);

    return (
        <div className="container py-4">
            <h2 className="mb-4 fw-bold">My Payslips</h2>
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 px-4">Period / Month</th>
                                <th className="border-0 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="2" className="text-center py-4">Loading payrolls...</td></tr>
                            ) : payrolls.length > 0 ? (
                                payrolls.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-4 fw-medium">{p.month}</td>
                                        <td className="text-center">
                                            <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                                                <i className="bi bi-download me-2"></i>Download PDF
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2" className="text-center py-4 text-muted">No payrolls found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyPayroll;