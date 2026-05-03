import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ImageUpload from "../components/ImageUpload";

const EditEmployee = () => {
    const { id } = useParams();
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null); // Empezamos en null para saber si cargó
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEmployee = async () => {
            const { ok, data } = await actions.apiFetch(`/employees/${id}`);
            if (ok) {
                setFormData(data);
                setError(null);
            } else {
                setError("Could not retrieve employee data. Verify the ID or your connection.");
            }
            setLoading(false);
        };
        loadEmployee();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { ok, data } = await actions.apiFetch(`/employees/${id}`, "PUT", formData);
        if (ok) {
            navigate("/manage-employees");
        } else {
            alert(data.msg || "Update failed");
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-grow text-primary" role="status"></div>
            <p className="mt-3 text-muted fw-bold">Synchronizing with server...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5">
            <div className="alert alert-danger shadow-sm border-0">{error}</div>
            <button className="btn btn-dark" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-lg">
                        <div className="card-header bg-dark text-white p-4">
                            <h4 className="mb-0 fw-bold">Edit Professional Profile</h4>
                            <small className="opacity-75">Modify information for ID: #{id}</small>
                        </div>
                        <div className="card-body p-4 bg-light">
                            <form onSubmit={handleSave}>
                                <div className="d-flex justify-content-center mb-4">
                                    <div className="text-center">
                                        <ImageUpload
                                            currentImage={formData.profile_image}
                                            onUpload={(url) => setFormData({ ...formData, profile_image: url })}
                                            size={90}
                                            label="Change profile photo"
                                        />
                                        <div className="small text-muted mt-2">Profile photo</div>
                                    </div>
                                </div>

                                <h6 className="text-primary fw-bold text-uppercase mb-4">Personal Information</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">First Name</label>
                                        <input type="text" className="form-control border-0 shadow-sm" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Last Name</label>
                                        <input type="text" className="form-control border-0 shadow-sm" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Email Address</label>
                                        <input type="email" className="form-control border-0 shadow-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Phone Number</label>
                                        <input type="text" className="form-control border-0 shadow-sm" value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>

                                <h6 className="text-primary fw-bold text-uppercase mb-4">Employment Details</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold">Position / Title</label>
                                        <input type="text" className="form-control border-0 shadow-sm" value={formData.position || ""} onChange={e => setFormData({ ...formData, position: e.target.value })} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Status</label>
                                        <select className="form-select border-0 shadow-sm" value={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.value === "true" })}>
                                            <option value="true">Active</option>
                                            <option value="false">Inactive / Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                    <button type="button" className="btn btn-outline-secondary px-4 fw-bold" onClick={() => navigate(-1)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow">Update Employee</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEmployee;