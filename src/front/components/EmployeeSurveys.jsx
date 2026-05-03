import React, { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import Webcam from "react-webcam";

const EmployeeSurveys = () => {
    const { actions } = useGlobalReducer();
    const webcamRef = useRef(null);

    // Estados
    const [pendingSurveys, setPendingSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [answers, setAnswers] = useState({}); // Guardará { id_pregunta: "respuesta" }
    const [photo, setPhoto] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

    // 1. Cargar encuestas pendientes al iniciar
    const loadPendingSurveys = async () => {
        setLoading(true);
        const { ok, data } = await actions.apiFetch("/surveys/pending");
        if (ok && Array.isArray(data)) {
            setPendingSurveys(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPendingSurveys();
    }, []);

    // 2. Manejar las respuestas del formulario dinámico
    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    // Capturar foto si la encuesta lo requiere
    const capturePhoto = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setPhoto(imageSrc);
    }, [webcamRef]);

    // 3. Enviar la encuesta al Backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que todas las preguntas estén respondidas
        const allAnswered = selectedSurvey.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== "");
        if (!allAnswered) {
            setStatusMsg({ type: "danger", text: "Por favor, responde todas las preguntas antes de enviar." });
            return;
        }

        // Validar selfie si es requerido
        if (selectedSurvey.requires_biometrics && !photo) {
            setStatusMsg({ type: "danger", text: "Esta encuesta requiere un análisis biométrico. Por favor, tómate la foto." });
            return;
        }

        setIsSubmitting(true);
        setStatusMsg({ type: "", text: "" });

        // Preparamos el formato de respuestas para el backend
        const formattedAnswers = Object.keys(answers).map(qId => ({
            question_id: parseInt(qId),
            value: answers[qId]
        }));

        // Si hay biometría, generamos los datos simulados de la IA
        let biometricsData = {};
        if (selectedSurvey.requires_biometrics && photo) {
            biometricsData = {
                photo_url: photo,
                ai_joy: Math.random() * 100,
                ai_stress: Math.random() * 30,
                ai_sadness: Math.random() * 15,
                ai_calm: Math.random() * 80,
                final_wellness_score: (Math.random() * 40) + 60, // Nota aleatoria entre 60 y 100
                admin_recommendation: "Analizado automáticamente por IA de Encuesta."
            };
        }

        const payload = {
            answers: formattedAnswers,
            ...biometricsData
        };

        const { ok } = await actions.apiFetch(`/surveys/${selectedSurvey.id}/respond`, "POST", payload);

        setIsSubmitting(false);

        if (ok) {
            setStatusMsg({ type: "success", text: "¡Encuesta enviada con éxito! Gracias por tu feedback." });
            setTimeout(() => {
                setSelectedSurvey(null);
                setAnswers({});
                setPhoto(null);
                setStatusMsg({ type: "", text: "" });
                loadPendingSurveys(); // Recargamos la lista
            }, 3000);
        } else {
            setStatusMsg({ type: "danger", text: "Hubo un error al enviar la encuesta." });
        }
    };

    // --- VISTAS ---

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    // VISTA A: Lista de Encuestas Pendientes
    if (!selectedSurvey) {
        return (
            <div className="container py-5 max-w-md" style={{ maxWidth: "800px" }}>
                <h2 className="fw-bold mb-4"><i className="bi bi-ui-checks text-primary me-2"></i>Mis Encuestas Pendientes</h2>

                {pendingSurveys.length === 0 ? (
                    <div className="card border-0 shadow-sm p-5 text-center bg-light rounded-4">
                        <i className="bi bi-check2-circle text-success" style={{ fontSize: "4rem" }}></i>
                        <h4 className="fw-bold mt-3">¡Estás al día!</h4>
                        <p className="text-muted">No tienes encuestas pendientes de responder en este momento.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {pendingSurveys.map(survey => (
                            <div key={survey.id} className="col-md-6">
                                <div className="card border-0 shadow-sm h-100 rounded-4 hover-shadow transition">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold mb-0 text-dark">{survey.title}</h5>
                                            {survey.requires_biometrics && (
                                                <span className="badge bg-warning text-dark rounded-pill" title="Requiere cámara">
                                                    <i className="bi bi-camera-fill me-1"></i> Biometría
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted small mb-4">{survey.description || "Sin descripción adicional."}</p>
                                        <button
                                            className="btn btn-outline-primary w-100 rounded-pill fw-bold"
                                            onClick={() => setSelectedSurvey(survey)}
                                        >
                                            Comenzar Encuesta <i className="bi bi-arrow-right ms-1"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // VISTA B: Formulario de la Encuesta Seleccionada
    return (
        <div className="container py-5" style={{ maxWidth: "600px" }}>
            <button className="btn btn-link text-decoration-none p-0 mb-4" onClick={() => setSelectedSurvey(null)}>
                <i className="bi bi-arrow-left me-2"></i> Volver a mis encuestas
            </button>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="bg-dark text-white p-4">
                    <h3 className="fw-bold mb-1">{selectedSurvey.title}</h3>
                    <p className="mb-0 opacity-75 small">{selectedSurvey.description}</p>
                </div>

                <div className="card-body p-4 p-md-5">
                    {statusMsg.text && (
                        <div className={`alert alert-${statusMsg.type} shadow-sm border-0`} role="alert">
                            {statusMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Renderizado dinámico de Preguntas */}
                        {selectedSurvey.questions.map((q, index) => (
                            <div key={q.id} className="mb-4 bg-light p-4 rounded-4 border">
                                <label className="form-label fw-bold text-dark mb-3">
                                    {index + 1}. {q.text}
                                </label>

                                {q.type === "TEXT" && (
                                    <textarea
                                        className="form-control border-0 shadow-sm" rows="3" placeholder="Escribe tu respuesta..."
                                        value={answers[q.id] || ""} onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    ></textarea>
                                )}

                                {q.type === "RATING" && (
                                    <div>
                                        <div className="d-flex justify-content-between text-muted small fw-bold mb-1">
                                            <span>1 (Pésimo)</span><span>10 (Excelente)</span>
                                        </div>
                                        <input
                                            type="range" className="form-range" min="1" max="10"
                                            value={answers[q.id] || 5} onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        />
                                        <div className="text-center mt-2 fw-bold text-primary fs-5">{answers[q.id] || 5}</div>
                                    </div>
                                )}

                                {q.type === "BOOLEAN" && (
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name={`q_${q.id}`} id={`q_${q.id}_yes`}
                                                checked={answers[q.id] === "Sí"} onChange={() => handleAnswerChange(q.id, "Sí")} />
                                            <label className="form-check-label" htmlFor={`q_${q.id}_yes`}>Sí</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name={`q_${q.id}`} id={`q_${q.id}_no`}
                                                checked={answers[q.id] === "No"} onChange={() => handleAnswerChange(q.id, "No")} />
                                            <label className="form-check-label" htmlFor={`q_${q.id}_no`}>No</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Módulo Biométrico Automático */}
                        {selectedSurvey.requires_biometrics && (
                            <div className="mb-4 text-center p-4 border border-warning rounded-4 bg-warning-subtle">
                                <h6 className="fw-bold text-dark mb-2"><i className="bi bi-camera-fill me-2"></i>Análisis Biométrico Requerido</h6>
                                <p className="small text-muted mb-3">Esta encuesta necesita validar tu estado a través de un selfie rápido.</p>

                                <div className="bg-dark rounded-3 overflow-hidden position-relative mb-3 mx-auto shadow-sm" style={{ height: "200px", maxWidth: "300px" }}>
                                    {photo ? (
                                        <img src={photo} alt="Selfie" className="img-fluid w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-100 h-100 object-fit-cover" videoConstraints={{ facingMode: "user" }} />
                                    )}
                                </div>

                                {photo ? (
                                    <button type="button" className="btn btn-outline-danger btn-sm rounded-pill px-4" onClick={() => setPhoto(null)}>
                                        <i className="bi bi-arrow-counterclockwise me-1"></i> Repetir foto
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" onClick={capturePhoto}>
                                        <i className="bi bi-camera me-1"></i> Capturar Foto
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Botón Enviar */}
                        <button type="submit" className="btn btn-dark w-100 fw-bold py-3 rounded-pill shadow" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span> Procesando...</>
                            ) : (
                                <><i className="bi bi-send-check me-2"></i> Enviar Respuestas</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSurveys;