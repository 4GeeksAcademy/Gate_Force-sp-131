import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CompanyManagement = () => {
    const { actions } = useGlobalReducer();
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const { ok, data } = await actions.apiFetch("/companies");
            if (ok) setCompanies(data);
        };
        fetchCompanies();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        // Endpoint para activar/desactivar empresa
        const { ok } = await actions.apiFetch(`/companies/${id}`, "PUT", { is_active: !currentStatus });
        if (ok) {
            setCompanies(companies.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        }
    };

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4">Client Portfolio</h2>
            <div className="card border-0 shadow-sm overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="px-4">Company Name</th>
                            <th>Email / Contact</th>
                            <th>Region</th>
                            <th className="text-center">Status</th>
                            <th className="text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c.id}>
                                <td className="px-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "40px", height: "40px"}}>
                                            {c.nombre_empresa.charAt(0)}
                                        </div>
                                        <span className="fw-bold">{c.nombre_empresa}</span>
                                    </div>
                                </td>
                                <td>{c.email}</td>
                                <td>{c.region}</td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill ${c.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                        {c.is_active ? 'ACTIVE' : 'SUSPENDED'}
                                    </span>
                                </td>
                                <td className="text-end px-4">
                                    <button 
                                        className={`btn btn-sm ${c.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                        onClick={() => toggleStatus(c.id, c.is_active)}
                                    >
                                        {c.is_active ? 'Suspend' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyManagement;