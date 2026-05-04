import React, { useState, useRef } from "react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ImageUpload = ({ currentImage, onUpload, size = 100, label = "Change photo" }) => {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef();

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            if (data.secure_url) onUpload(data.secure_url);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="position-relative d-inline-block" style={{ width: size, height: size }}>
            {currentImage ? (
                <img
                    src={currentImage}
                    alt="Profile"
                    className="rounded-circle border border-2 border-light shadow-sm object-fit-cover"
                    style={{ width: size, height: size, cursor: "pointer", opacity: uploading ? 0.5 : 1 }}
                    onClick={() => inputRef.current?.click()}
                />
            ) : (
                <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: size, height: size, cursor: "pointer", opacity: uploading ? 0.5 : 1 }}
                    onClick={() => inputRef.current?.click()}
                >
                    <i className="bi bi-person-fill text-white" style={{ fontSize: size * 0.45 }}></i>
                </div>
            )}

            {uploading ? (
                <div
                    className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: 28, height: 28 }}
                >
                    <div className="spinner-border spinner-border-sm text-primary" style={{ width: 16, height: 16 }} />
                </div>
            ) : (
                <button
                    type="button"
                    className="position-absolute bottom-0 end-0 btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                    style={{ width: 28, height: 28 }}
                    onClick={() => inputRef.current?.click()}
                    title={label}
                >
                    <i className="bi bi-camera-fill" style={{ fontSize: 12 }}></i>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleFile}
            />
        </div>
    );
};

export default ImageUpload;
