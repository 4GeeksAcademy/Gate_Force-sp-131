import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EmployeeSurveys() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const token = localStorage.getItem("token");

    const [surveys, setSurveys] = useState([]);
    const [answers, setAnswers] = useState({}); // Guardará { questionId: valor }
    const [loading, setLoading] = useState(true);

    const authFetch = (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...options.headers
            }
        });
    };

    const fetchPendingSurveys = async () => {
        try {
            const res = await authFetch(`${API_URL}employees/${employeeId}/pending-surveys`);
            if (res.ok) {
                const data = await res.json();
                setSurveys(data);
            }
        } catch (error) {
            console.error("Error cargando encuestas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) {
            fetchPendingSurveys();
        }
    }, [employeeId]);

    // Función para actualizar la respuesta de una pregunta específica
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async (e, survey) => {
        e.preventDefault();

        // Armamos el arreglo de respuestas tal como lo espera el backend
        const formattedAnswers = survey.questions.map(q => ({
            question_id: q.id,
            answer_value: answers[q.id] || ""
        }));

        // Validamos que todas las preguntas de ESTA encuesta tengan respuesta
        const missing = formattedAnswers.find(a => a.answer_value.toString().trim() === "");
        if (missing) {
            alert("Por favor, responde todas las preguntas de esta encuesta.");
            return;
        }

        const res = await authFetch(`${API_URL}employees/${employeeId}/surveys/${survey.id}/respond`, {
            method: "POST",
            body: JSON.stringify({ answers: formattedAnswers })
        });

        if (res.ok) {
            alert("¡Gracias por tu participación!");
            // Volvemos a cargar las pendientes (esto hará que la que acabamos de responder desaparezca)
            fetchPendingSurveys();
        } else {
            const err = await res.json();
            alert("Error al enviar: " + err.msg);
        }
    };

    // Función para renderizar el campo (input) adecuado según el tipo de pregunta
    const renderQuestionInput = (question) => {
        const value = answers[question.id] || "";

        switch (question.type) {
            case "RATING":
                return (
                    <select
                        className="form-select"
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        required
                    >
                        <option value="">Selecciona del 1 al 5...</option>
                        <option value="5">5 - Excelente</option>
                        <option value="4">4 - Muy bien</option>
                        <option value="3">3 - Normal</option>
                        <option value="2">2 - Mal</option>
                        <option value="1">1 - Pésimo</option>
                    </select>
                );
            case "YES_NO":
                return (
                    <select
                        className="form-select"
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        required
                    >
                        <option value="">Selecciona una opción...</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                    </select>
                );
            case "TEXT":
            default:
                return (
                    <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Escribe tu respuesta aquí..."
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        required
                    ></textarea>
                );
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="fas fa-clipboard-list me-2"></i>Mis Encuestas</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/employee-dashboard")}>
                    <i className="fas fa-arrow-left me-2"></i>Volver al Dashboard
                </button>
            </div>

            {surveys.length === 0 ? (
                <div className="alert alert-success shadow-sm text-center p-5">
                    <h4><i className="fas fa-check-circle me-2"></i>¡Estás al día!</h4>
                    <p className="mb-0">No tienes ninguna encuesta pendiente por responder en este momento.</p>
                </div>
            ) : (
                surveys.map(survey => (
                    <div key={survey.id} className="card shadow-sm mb-5 border-top border-info border-3">
                        <div className="card-header bg-white pb-0 border-0 pt-4 px-4">
                            <h4 className="fw-bold text-dark">{survey.title}</h4>
                            {survey.description && <p className="text-muted">{survey.description}</p>}
                        </div>
                        <div className="card-body px-4">
                            <form onSubmit={(e) => handleSubmit(e, survey)}>
                                {survey.questions?.map((q, index) => (
                                    <div key={q.id} className="mb-4 bg-light p-3 rounded border">
                                        <label className="form-label fw-bold d-block">
                                            <span className="text-info me-2">{index + 1}.</span>
                                            {q.text}
                                        </label>
                                        <div className="mt-2">
                                            {renderQuestionInput(q)}
                                        </div>
                                    </div>
                                ))}
                                <div className="text-end">
                                    <button type="submit" className="btn btn-info text-dark fw-bold px-4">
                                        <i className="fas fa-paper-plane me-2"></i>Enviar Respuestas
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}