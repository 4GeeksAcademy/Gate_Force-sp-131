import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const SurveyBuilder = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();

    // Estado para navegar entre pestañas
    const [activeTab, setActiveTab] = useState("HISTORY"); // "CREATE", "HISTORY", o "RESULTS"

    // Estados de Creación
    const [survey, setSurvey] = useState({ title: "", description: "", requires_biometrics: false, questions: [{ text: "", type: "TEXT" }] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: "", msg: "" });

    // Estados de Historial y Resultados
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedResults, setSelectedResults] = useState(null); // Guardará los detalles de la encuesta clickeada
    const [isLoadingResults, setIsLoadingResults] = useState(false);

    const loadSurveyHistory = async () => {
        setIsLoadingHistory(true);
        const { ok, data } = await actions.apiFetch("/company/surveys");
        if (ok && Array.isArray(data)) setHistory(data);
        setIsLoadingHistory(false);
    };

    useEffect(() => {
        if (activeTab === "HISTORY") loadSurveyHistory();
    }, [activeTab]);

    // --- NUEVO: FUNCIÓN PARA VER RESULTADOS ---
    const handleViewResults = async (surveyId) => {
        setActiveTab("RESULTS");
        setIsLoadingResults(true);
        const { ok, data } = await actions.apiFetch(`/company/surveys/${surveyId}/results`, "GET");

        if (ok && data) {
            setSelectedResults(data);
        } else {
            alert("No se pudieron cargar los resultados.");
            setActiveTab("HISTORY");
        }
        setIsLoadingResults(false);
    };

    // Funciones de Creación
    const addQuestion = () => setSurvey({ ...survey, questions: [...survey.questions, { text: "", type: "TEXT" }] });
    const removeQuestion = (index) => {
        if (survey.questions.length === 1) return;
        const newQs = survey.questions.filter((_, i) => i !== index);
        setSurvey({ ...survey, questions: newQs });
    };
    const updateQuestion = (index, field, value) => {
        const newQs = [...survey.questions];
        newQs[index][field] = value;
        setSurvey({ ...survey, questions: newQs });
    };

    const saveSurvey = async () => {
        if (!survey.title.trim()) return setStatus({ type: "error", msg: "Título obligatorio." });
        if (survey.questions.some(q => !q.text.trim())) return setStatus({ type: "error", msg: "No dejes preguntas en blanco." });

        setIsSubmitting(true);
        setStatus({ type: "", msg: "" });

        const { ok } = await actions.apiFetch("/surveys", "POST", survey);
        setIsSubmitting(false);

        if (ok) {
            setStatus({ type: "success", msg: "¡Encuesta lanzada!" });
            setTimeout(() => {
                setSurvey({ title: "", description: "", requires_biometrics: false, questions: [{ text: "", type: "TEXT" }] });
                setStatus({ type: "", msg: "" });
                setActiveTab("HISTORY");
            }, 2000);
        } else {
            setStatus({ type: "error", msg: "Error al crear la encuesta." });
        }
    };

    // --- UTILIDAD PARA BUSCAR EL TEXTO DE LA PREGUNTA ---
    const getQuestionText = (questionId, questionsArray) => {
        const q = questionsArray.find(q => q.id === questionId);
        return q ? q.text : "Pregunta no encontrada";
    };

    return (
        <div className="container py-5 max-w-md" style={{ maxWidth: "900px" }}>
            <div className="text-center mb-4">
                <div className="bg-primary-subtle text-primary d-inline-block p-3 rounded-circle mb-3">
                    <i className="bi bi-clipboard-data fs-1"></i>
                </div>
                <h2 className="fw-bold text-dark mb-1">Centro de Encuestas</h2>
                <p className="text-muted">Gestiona el feedback de tu equipo y crea nuevas evaluaciones</p>
            </div>

            {/* Pestañas (Solo se muestran si no estamos viendo resultados detallados) */}
            {activeTab !== "RESULTS" && (
                <ul className="nav nav-pills justify-content-center mb-4 gap-2">
                    <li className="nav-item">
                        <button className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'HISTORY' ? 'active shadow-sm' : 'bg-light text-dark'}`} onClick={() => setActiveTab('HISTORY')}>
                            <i className="bi bi-clock-history me-2"></i>Historial
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'CREATE' ? 'active shadow-sm' : 'bg-light text-dark'}`} onClick={() => setActiveTab('CREATE')}>
                            <i className="bi bi-plus-circle me-2"></i>Crear Nueva
                        </button>
                    </li>
                </ul>
            )}

            <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">

                {/* --- VISTA 1: HISTORIAL --- */}
                {activeTab === "HISTORY" && (
                    <div>
                        <h5 className="fw-bold text-secondary text-uppercase small mb-4">Encuestas Activas y Pasadas</h5>
                        {isLoadingHistory ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light text-secondary small text-uppercase">
                                        <tr>
                                            <th>Título</th>
                                            <th>Fecha</th>
                                            <th className="text-center">Tipo</th>
                                            <th className="text-center">Participación</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length > 0 ? history.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-bold text-dark">{item.title}</td>
                                                <td className="text-muted small">{item.created_at?.split(" ")[0]}</td>
                                                <td className="text-center">
                                                    {item.requires_biometrics ? <span className="badge bg-warning text-dark rounded-pill"><i className="bi bi-camera me-1"></i> Biométrica</span> : <span className="badge bg-secondary rounded-pill">Estándar</span>}
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-success-subtle text-success fs-6 rounded-pill px-3">
                                                        <i className="bi bi-people-fill me-1"></i> {item.response_count || 0}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {/* CONECTAMOS EL BOTÓN AQUÍ */}
                                                    <button
                                                        className="btn btn-sm btn-outline-warning rounded-pill"
                                                        onClick={() => handleViewResults(item.id)}
                                                    >
                                                        Ver Resultados <i className="bi bi-arrow-right ms-1"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-5 text-muted">Aún no has creado encuestas.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- VISTA 2: CREADOR (Oculta para resumir, es la misma que ya tenía) --- */}
                {activeTab === "CREATE" && (
                    <div className="animate__animated animate__fadeIn">
                        {status.msg && (
                            <div className={`alert alert-${status.type === "success" ? "success" : "danger"} d-flex align-items-center mb-4`} role="alert">
                                <i className={`bi bi-${status.type === "success" ? "check-circle-fill" : "exclamation-triangle-fill"} me-2 fs-5`}></i>
                                <div>{status.msg}</div>
                            </div>
                        )}

                        <h5 className="fw-bold text-secondary text-uppercase small mb-3">Configuración General</h5>
                        <div className="bg-light p-4 rounded-4 mb-4 border">
                            <input
                                className="form-control form-control-lg border-0 shadow-sm mb-3 fw-bold"
                                placeholder="Título de la Encuesta (ej. Clima Laboral Q3)"
                                value={survey.title}
                                onChange={e => setSurvey({ ...survey, title: e.target.value })}
                            />
                            <textarea
                                className="form-control border-0 shadow-sm mb-3"
                                rows="2"
                                placeholder="Breve descripción o instrucciones para los empleados..."
                                value={survey.description}
                                onChange={e => setSurvey({ ...survey, description: e.target.value })}
                            ></textarea>

                            <div className="form-check form-switch mt-3 bg-white p-3 rounded-3 shadow-sm border d-flex align-items-center">
                                <input
                                    className="form-check-input fs-4 ms-0 me-3" type="checkbox" role="switch" id="biometricSwitch"
                                    checked={survey.requires_biometrics} onChange={e => setSurvey({ ...survey, requires_biometrics: e.target.checked })}
                                />
                                <label className="form-check-label fw-bold text-dark d-flex flex-column" htmlFor="biometricSwitch">
                                    <span>Requerir Análisis Biométrico (Selfie)</span>
                                    <span className="small text-muted fw-normal">Los empleados deberán encender su cámara para evaluar su estado emocional.</span>
                                </label>
                            </div>
                        </div>

                        <h5 className="fw-bold text-secondary text-uppercase small mb-3">Preguntas del Formulario</h5>
                        {survey.questions.map((q, index) => (
                            <div key={index} className="card border mb-3 rounded-3 shadow-sm">
                                <div className="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                                    <span className="badge bg-secondary rounded-pill">Pregunta #{index + 1}</span>
                                    <button className="btn btn-sm text-danger" onClick={() => removeQuestion(index)} disabled={survey.questions.length === 1}>
                                        <i className="bi bi-trash3-fill"></i>
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <input className="form-control" placeholder="Escribe tu pregunta aquí..." value={q.text} onChange={e => updateQuestion(index, "text", e.target.value)} />
                                        </div>
                                        <div className="col-md-4">
                                            <select className="form-select" value={q.type} onChange={e => updateQuestion(index, "type", e.target.value)}>
                                                <option value="TEXT">Texto Libre</option>
                                                <option value="RATING">Puntuación (1-10)</option>
                                                <option value="BOOLEAN">Sí / No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="d-flex flex-column flex-md-row gap-3 mt-4">
                            <button className="btn btn-outline-warning rounded-pill px-4 fw-bold shadow-sm" onClick={addQuestion}>
                                <i className="bi bi-plus-circle me-2"></i>Añadir Pregunta
                            </button>
                            <button className="btn btn-warning ms-md-auto rounded-pill px-5 fw-bold shadow-sm" onClick={saveSurvey} disabled={isSubmitting}>
                                {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span> Lanzando...</> : <><i className="bi bi-rocket-takeoff me-2"></i> Lanzar Encuesta</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- NUEVA VISTA 3: RESULTADOS DETALLADOS --- */}
                {activeTab === "RESULTS" && (
                    <div className="animate__animated animate__fadeIn">
                        <button className="btn btn-link text-decoration-none p-0 mb-4" onClick={() => setActiveTab("HISTORY")}>
                            <i className="bi bi-arrow-left me-2"></i> Volver al historial
                        </button>

                        {isLoadingResults || !selectedResults ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : (
                            <div>
                                <div className="bg-dark text-white p-4 rounded-4 mb-4 shadow-sm">
                                    <h3 className="fw-bold mb-1">{selectedResults.survey_info.title}</h3>
                                    <p className="mb-2 opacity-75">{selectedResults.survey_info.description}</p>
                                    <span className="badge bg-light text-dark rounded-pill me-2">
                                        <i className="bi bi-people-fill me-1"></i> {selectedResults.responses.length} Respuestas
                                    </span>
                                </div>

                                {selectedResults.responses.length === 0 ? (
                                    <div className="text-center p-5 border rounded-4 bg-light text-muted">
                                        <i className="bi bi-hourglass-split fs-1 d-block mb-3 opacity-50"></i>
                                        Nadie ha respondido esta encuesta todavía.
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {selectedResults.responses.map((resp, i) => (
                                            <div key={i} className="col-12">
                                                <div className="card border shadow-sm rounded-4 overflow-hidden">
                                                    <div className="card-header bg-light border-bottom-0 d-flex justify-content-between align-items-center py-3">
                                                        <div className="fw-bold text-dark"><i className="bi bi-person-circle me-2"></i>{resp.employee_name}</div>
                                                        <div className="text-muted small">{resp.submitted_at?.split(" ")[0]}</div>
                                                    </div>

                                                    <div className="card-body row g-0">
                                                        {/* Respuestas Escritas */}
                                                        <div className={`col-md-${selectedResults.survey_info.requires_biometrics ? '8' : '12'} pe-md-4`}>
                                                            <h6 className="fw-bold text-secondary small text-uppercase mb-3">Respuestas:</h6>
                                                            {resp.answers.map((ans, j) => (
                                                                <div key={j} className="mb-3 border-bottom pb-2">
                                                                    <div className="fw-bold text-dark small mb-1">
                                                                        {getQuestionText(ans.question_id, selectedResults.survey_info.questions)}
                                                                    </div>
                                                                    <div className="text-muted">{ans.answer_value}</div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Bloque Biométrico (Solo si aplica) */}
                                                        {selectedResults.survey_info.requires_biometrics && (
                                                            <div className="col-md-4 border-start-md ps-md-4 mt-4 mt-md-0 d-flex flex-column align-items-center justify-content-center bg-light rounded-3 p-3">
                                                                <h6 className="fw-bold text-secondary small text-uppercase mb-3 w-100 text-center">Análisis IA</h6>

                                                                <div className="rounded-circle overflow-hidden shadow-sm border border-3 border-white mb-3" style={{ width: "100px", height: "100px" }}>
                                                                    {resp.biometrics?.photo_url ? (
                                                                        <img src={resp.biometrics.photo_url} alt="Selfie" className="w-100 h-100 object-fit-cover" />
                                                                    ) : (
                                                                        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
                                                                            <i className="bi bi-person-x fs-1"></i>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="text-center w-100">
                                                                    <div className="fs-3 fw-bold text-dark">
                                                                        {resp.biometrics?.score ? Math.round(resp.biometrics.score) : "--"}<span className="fs-6 text-muted">/100</span>
                                                                    </div>
                                                                    <div className="small text-muted mb-2">Wellness Score</div>

                                                                    {resp.biometrics?.recommendation && (
                                                                        <div className="alert alert-info py-1 px-2 mb-0" style={{ fontSize: "0.75rem" }}>
                                                                            <i className="bi bi-robot me-1"></i> {resp.biometrics.recommendation}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurveyBuilder;