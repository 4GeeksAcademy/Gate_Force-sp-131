import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CompanyManagement = () => {
    const { actions } = useGlobalReducer();
    const [companies, setCompanies] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [employeesMap, setEmployeesMap] = useState({});
    const [loadingEmployees, setLoadingEmployees] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            const { ok, data } = await actions.apiFetch("/companies");
            if (ok) setCompanies(data);
        };
        fetchCompanies();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const { ok } = await actions.apiFetch(`/companies/${id}`, "PUT", { is_active: !currentStatus });
        if (ok) setCompanies(companies.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    };

    const toggleEmployees = async (companyId) => {
        if (expandedId === companyId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(companyId);
        if (employeesMap[companyId]) return; // already fetched
        setLoadingEmployees(companyId);
        const { ok, data } = await actions.apiFetch(`/companies/${companyId}/employees`);
        if (ok) setEmployeesMap(prev => ({ ...prev, [companyId]: data }));
        setLoadingEmployees(null);
    };

    const colSpan = 6;

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4">Client Portfolio</h2>
            <div className="card border-0 shadow-sm overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="px-4">Company</th>
                            <th>Email / Contact</th>
                            <th>Region</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Employees</th>
                            <th className="text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <React.Fragment key={c.id}>
                                {/* MAIN ROW */}
                                <tr>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center gap-3">
                                            {c.logo_url ? (
                                                <img
                                                    src={c.logo_url}
                                                    alt={c.nombre_empresa}
                                                    className="rounded-circle object-fit-cover flex-shrink-0"
                                                    style={{ width: 40, height: 40 }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                                    style={{ width: 40, height: 40 }}
                                                >
                                                    {c.nombre_empresa.charAt(0).toUpperCase()}
                                                </div>
                                            )}
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
                                    <td className="text-center">
                                        <button
                                            className={`btn btn-sm btn-outline-primary rounded-pill px-3`}
                                            onClick={() => toggleEmployees(c.id)}
                                        >
                                            <i className={`bi bi-people${expandedId === c.id ? '-fill' : ''} me-1`}></i>
                                            {expandedId === c.id ? 'Hide' : 'View'}
                                        </button>
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

                                {/* EXPANDED EMPLOYEES ROW */}
                                {expandedId === c.id && (
                                    <tr className="bg-light">
                                        <td colSpan={colSpan} className="p-0">
                                            <div className="px-4 py-3">
                                                <p className="small fw-bold text-secondary text-uppercase mb-2">
                                                    <i className="bi bi-people-fill me-1 text-primary"></i>
                                                    Employees — {c.nombre_empresa}
                                                </p>

                                                {loadingEmployees === c.id ? (
                                                    <div className="text-center py-3">
                                                        <div className="spinner-border spinner-border-sm text-primary" />
                                                    </div>
                                                ) : (employeesMap[c.id] ?? []).length === 0 ? (
                                                    <p className="text-muted small mb-0">No employees registered.</p>
                                                ) : (
                                                    <div className="d-flex flex-wrap gap-3">
                                                        {(employeesMap[c.id] ?? []).map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="d-flex align-items-center gap-2 bg-white rounded-pill px-3 py-2 border shadow-sm"
                                                            >
                                                                {emp.profile_image ? (
                                                                    <img
                                                                        src={emp.profile_image}
                                                                        alt={emp.first_name}
                                                                        className="rounded-circle object-fit-cover"
                                                                        style={{ width: 30, height: 30 }}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                                                        style={{ width: 30, height: 30 }}
                                                                    >
                                                                        <i className="bi bi-person-fill text-white" style={{ fontSize: 14 }}></i>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="small fw-semibold text-dark lh-1">
                                                                        {emp.first_name} {emp.last_name}
                                                                    </div>
                                                                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                                                        {emp.position || 'Staff'}
                                                                        {!emp.is_active && <span className="ms-1 text-danger">(inactive)</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyManagement;
