import React, { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

const PayrollHub = () => {
    const { actions } = useGlobalReducer();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ employee_id: "", month_name: "", year: String(currentYear), url: "" });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await actions.getEmployees();
            setEmployees(data);
        };
        loadEmployees();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setFileName(file.name);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
                { method: "POST", body: fd }
                
            );
            const data = await res.json();
            if (data.secure_url) {
                console.log("CLOUDINARY URL:", data.secure_url);
                setFormData(prev => ({ ...prev, url: data.secure_url }));
            } else {
                alert("Upload failed. Check Cloudinary settings.");
                setFileName("");
            }
        } catch {
            alert("Upload error.");
            setFileName("");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.url) { alert("Please upload a document first."); return; }
        setLoading(true);
        const month = `${formData.month_name} ${formData.year}`;
        const { ok } = await actions.apiFetch("/payroll/upload", "POST", {
            employee_id: formData.employee_id,
            month,
            url: formData.url,
        });
        if (ok) {
            alert("Payroll uploaded successfully!");
            setFormData({ employee_id: "", month_name: "", year: String(currentYear), url: "" });
            setFileName("");
            if (fileInputRef.current) fileInputRef.current.value = "";
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

                    <div className="row mb-3">
                        <div className="col-7">
                            <label className="form-label small fw-bold">Month</label>
                            <select
                                className="form-select"
                                value={formData.month_name}
                                onChange={e => setFormData({ ...formData, month_name: e.target.value })}
                                required
                            >
                                <option value="">Select month...</option>
                                {MONTHS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-5">
                            <label className="form-label small fw-bold">Year</label>
                            <select
                                className="form-select"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                required
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={String(y)}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold">Payroll Document</label>
                        <div
                            className="border rounded-3 p-3 text-center"
                            style={{ cursor: "pointer", borderStyle: "dashed !important", background: "#f8f9fa" }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {uploading ? (
                                <div className="d-flex align-items-center justify-content-center gap-2 text-primary">
                                    <div className="spinner-border spinner-border-sm" />
                                    <span className="small">Uploading…</span>
                                </div>
                            ) : formData.url ? (
                                <div className="d-flex align-items-center justify-content-center gap-2 text-success">
                                    <i className="bi bi-check-circle-fill fs-5"></i>
                                    <span className="small text-truncate" style={{ maxWidth: 300 }}>{fileName || "Document uploaded"}</span>
                                </div>
                            ) : (
                                <div className="text-muted small">
                                    <i className="bi bi-cloud-upload fs-4 d-block mb-1"></i>
                                    Click to upload PDF or image
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="d-none"
                            onChange={handleFileUpload}
                        />
                        {formData.url && (
                            <div className="mt-1 d-flex justify-content-between align-items-center">
                                <a href={formData.url} target="_blank" rel="noreferrer" className="small text-primary">
                                    <i className="bi bi-box-arrow-up-right me-1"></i>Preview
                                </a>
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm text-danger p-0"
                                    onClick={() => { setFormData(prev => ({ ...prev, url: "" })); setFileName(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                >
                                    <i className="bi bi-x-circle me-1"></i>Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading || uploading} className="btn btn-primary w-100 fw-bold mt-3">
                        {loading ? "Processing..." : "Assign Payroll"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PayrollHub;
