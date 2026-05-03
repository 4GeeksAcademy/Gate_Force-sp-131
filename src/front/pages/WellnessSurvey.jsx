import React, { useState, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const WellnessSurvey = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();
    const webcamRef = useRef(null);

    // Estados del formulario
    const [mood, setMood] = useState(5); // Valor por defecto en el medio
    const [comment, setComment] = useState("");
    const [photo, setPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Capturar la foto
    const capturePhoto = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setPhoto(imageSrc);
    }, [webcamRef]);

    // Enviar al Backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            alert("Por favor, tómate un selfie para continuar con el análisis.");
            return;
        }

        setIsSubmitting(true);

        // 🤖 MOCK AI: Simulamos los resultados de una Inteligencia Artificial para probar el algoritmo
        // En el futuro, enviaremos la foto a una API real aquí y esperaremos la respuesta.
        const mockAiData = {
            ai_joy: Math.random() * 100,
            ai_stress: Math.random() * 40, // Estrés entre 0 y 40
            ai_sadness: Math.random() * 20,
            ai_calm: Math.random() * 80
        };

        const payload = {
            mood: mood,
            comment: comment,
            photo_url: photo, // Enviamos el base64 de la foto temporalmente
            ...mockAiData
        };

        const { ok, data } = await actions.apiFetch("/wellness-check", "POST", payload);

        setIsSubmitting(false);

        if (ok) {
            setSuccessMsg("¡Check-in completado con éxito! Gracias por compartir cómo te sientes.");
            setTimeout(() => navigate("/employee-dashboard"), 3000); // Volver al dashboard tras 3 seg
        } else {
            alert("Hubo un error al enviar el formulario.");
        }
    };

    return (
        <div className="container py-5 max-w-md" style={{ maxWidth: "600px" }}>
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div className="bg-primary text-white text-center py-4">
                    <h3 className="fw-bold mb-0"><i className="bi bi-heart-pulse me-2"></i>Radar de Bienestar</h3>
                    <p className="mb-0 small opacity-75">Tu bienestar es nuestra prioridad</p>
                </div>

                {successMsg ? (
                    <div className="card-body text-center py-5">
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                        <h4 className="mt-3 text-dark fw-bold">¡Recibido!</h4>
                        <p className="text-muted">{successMsg}</p>
                    </div>
                ) : (
                    <div className="card-body p-4 p-md-5">
                        <form onSubmit={handleSubmit}>

                            {/* 1. Nivel de Energía (Auto-reportado) */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark">
                                    ¿Cómo calificarías tu nivel de energía y ánimo hoy? (1 al 10)
                                </label>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <i className="bi bi-emoji-frown text-danger fs-4"></i>
                                    <span className="fw-bold fs-3 text-primary">{mood}</span>
                                    <i className="bi bi-emoji-sunglasses text-success fs-4"></i>
                                </div>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="1" max="10"
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                />
                            </div>

                            {/* 2. Selfie / Análisis Biométrico */}
                            <div className="mb-4 text-center">
                                <label className="form-label fw-bold text-dark w-100 text-start">
                                    Análisis Biométrico
                                </label>
                                <p className="small text-muted text-start mb-3">
                                    Necesitamos un selfie rápido para ayudar a nuestra IA a entender tu estado emocional. Solo será usado para este chequeo.
                                </p>

                                <div className="bg-dark rounded-4 overflow-hidden position-relative mb-3 shadow-sm" style={{ minHeight: "250px" }}>
                                    {photo ? (
                                        <img src={photo} alt="Selfie" className="img-fluid w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className="w-100 h-100 object-fit-cover"
                                            videoConstraints={{ facingMode: "user" }} // Usa la cámara frontal en móviles
                                        />
                                    )}
                                </div>

                                {photo ? (
                                    <button type="button" className="btn btn-outline-danger btn-sm rounded-pill px-4" onClick={() => setPhoto(null)}>
                                        <i className="bi bi-arrow-counterclockwise me-1"></i> Tomar de nuevo
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-primary rounded-pill px-4" onClick={capturePhoto}>
                                        <i className="bi bi-camera me-1"></i> Capturar Foto
                                    </button>
                                )}
                            </div>

                            {/* 3. Comentarios opcionales */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark">Comentarios (Opcional)</label>
                                <textarea
                                    className="form-control bg-light border-0"
                                    rows="3"
                                    placeholder="¿Hay algo específico afectando tu día?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Botón Enviar */}
                            <button
                                type="submit"
                                className="btn btn-dark w-100 fw-bold py-2 rounded-pill shadow-sm"
                                disabled={isSubmitting || !photo}
                            >
                                {isSubmitting ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span> Analizando...</>
                                ) : (
                                    <><i className="bi bi-send me-2"></i> Enviar Evaluación</>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WellnessSurvey;