import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PayrollModal = ({ employee, onClose, actions }) => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPayrolls = async () => {
        const { ok, data } = await actions.apiFetch(`/payroll/employee/${employee.id}`);
        if (ok) setPayrolls(data);
        setLoading(false);
    };

    const handleDelete = async (payrollId) => {
        const { ok } = await actions.apiFetch(`/payroll/${payrollId}`, "DELETE");
        if (ok) setPayrolls(prev => prev.filter(p => p.id !== payrollId));
    };

    useEffect(() => { loadPayrolls(); }, []);

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0 px-4 pt-4">
                        <div>
                            <h5 className="modal-title fw-bold mb-0">
                                <i className="bi bi-file-earmark-pdf me-2 text-primary"></i>
                                Payrolls — {employee.first_name} {employee.last_name}
                            </h5>
                            <small className="text-muted">{employee.email}</small>
                        </div>
                        <button className="btn-close ms-auto" onClick={onClose}></button>
                    </div>

                    <div className="modal-body px-4 py-3">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : payrolls.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                No payrolls uploaded for this employee.
                            </div>
                        ) : (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 px-3">Period</th>
                                        <th className="border-0 text-center">View</th>
                                        <th className="border-0 text-end px-3">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-3 fw-medium">{p.month}</td>
                                            <td className="text-center">
                                                <a
                                                    href={p.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-sm btn-outline-warning rounded-3"
                                                >
                                                    <i className="bi bi-download me-1"></i>Download
                                                </a>
                                            </td>
                                            <td className="text-end px-3">
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-3"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="modal-footer border-0 px-4 pb-4">
                        <button className="btn btn-light rounded-3" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmployeeList = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState(null);
    const [payrollEmployee, setPayrollEmployee] = useState(null);

    useEffect(() => {
        const loadEmployees = async () => {
            const { ok, data } = await actions.apiFetch("/employees");
            if (ok) setEmployees(data);
            setLoading(false);
        };
        loadEmployees();
    }, []);

    const handleDeactivate = async (id) => {
        const { ok } = await actions.apiFetch(`/employees/${id}`, "DELETE");
        if (ok) {
            setEmployees(prev => prev.map(emp =>
                emp.id === id ? { ...emp, is_active: false } : emp
            ));
            setConfirmingId(null);
        }
    };

    if (loading) return (
        <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <>
            {payrollEmployee && (
                <PayrollModal
                    employee={payrollEmployee}
                    onClose={() => setPayrollEmployee(null)}
                    actions={actions}
                />
            )}

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Empleado</th>
                                <th>Puesto</th>
                                <th>Estado</th>
                                <th>Phone</th>
                                <th className="text-end px-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            {emp.profile_image ? (
                                                <img
                                                    src={emp.profile_image}
                                                    alt={emp.first_name}
                                                    className="rounded-circle object-fit-cover"
                                                    style={{ width: 36, height: 36 }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                                                    style={{ width: 36, height: 36 }}
                                                >
                                                    <i className="bi bi-person-fill text-white" style={{ fontSize: 16 }}></i>
                                                </div>
                                            )}
                                            <div>
                                                <span className="fw-bold text-dark">{emp.first_name} {emp.last_name}</span>
                                                <div className="small text-muted">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{emp.position || "Staff"}</td>
                                    <td>
                                        <span className={`badge ${emp.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                            {emp.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>{emp.phone || '---'}</td>
                                    <td className="text-end px-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            {confirmingId === emp.id ? (
                                                <>
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => handleDeactivate(emp.id)}
                                                        title="Confirmar baja"
                                                    >
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setConfirmingId(null)}
                                                        title="Cancelar"
                                                    >
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => navigate(`/edit-employee/${emp.id}`)}
                                                        title="Editar"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-warning btn-sm"
                                                        onClick={() => navigate(`/employee-details/${emp.id}`)}
                                                        title="Ver detalles"
                                                    >
                                                        <i className="fa-solid fa-circle-info"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => setPayrollEmployee(emp)}
                                                        title="Payrolls"
                                                    >
                                                        <i className="bi bi-file-earmark-pdf">📂</i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-info btn-sm"
                                                        onClick={() => navigate(`/company-chat/${emp.id}`)}
                                                        title="Chatear"
                                                    >
                                                        <i className="fa-solid fa-comments"></i>
                                                    </button>
                                                    {emp.is_active && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => setConfirmingId(emp.id)}
                                                            title="Dar de baja"
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default EmployeeList;