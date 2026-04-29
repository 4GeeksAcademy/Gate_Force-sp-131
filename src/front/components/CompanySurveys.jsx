import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanySurveys() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [surveys, setSurveys] = useState([]);
    const [expandedSurveyId, setExpandedSurveyId] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([
        { text: "", type: "RATING" }
    ]);
    const toggleExpand = (id) => {
        setExpandedSurveyId(expandedSurveyId === id ? null : id);
    };

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

    const fetchSurveys = async () => {
        try {
            const res = await authFetch(`${API_URL}surveys`);
            if (res.ok) {
                const data = await res.json();
                setSurveys(data);
            }
        } catch (error) {
            console.error("Error cargando encuestas:", error);
        }
    };

    useEffect(() => {
        fetchSurveys();
    }, []);


    const addQuestion = () => {
        setQuestions([...questions, { text: "", type: "TEXT" }]);
    };

    const removeQuestion = (indexToRemove) => {
        setQuestions(questions.filter((_, index) => index !== indexToRemove));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const invalidQuestion = questions.find(q => q.text.trim() === "");
        if (invalidQuestion) {
            alert("Por favor, completa el texto de todas las preguntas.");
            return;
        }

        const payload = {
            title,
            description,
            questions
        };

        const res = await authFetch(`${API_URL}surveys`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("¡Encuesta creada exitosamente!");
            setTitle("");
            setDescription("");
            setQuestions([{ text: "", type: "RATING" }]);
            fetchSurveys();
        } else {
            const err = await res.json();
            alert("Error al crear: " + err.msg);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="fas fa-poll me-2"></i>Creador de Encuestas</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>
            </div>

            {/* FORMULARIO DE CREACIÓN */}
            <div className="card shadow-sm p-4 mb-5 border-top border-primary border-3">
                <h4 className="mb-4">Armar nueva encuesta</h4>
                <form onSubmit={handleSubmit}>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Título de la encuesta</label>
                            <input
                                type="text" className="form-control"
                                placeholder="Ej: Clima Laboral Mayo 2026"
                                value={title} onChange={(e) => setTitle(e.target.value)} required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Descripción (Opcional)</label>
                            <input
                                type="text" className="form-control"
                                placeholder="Breve mensaje para los empleados..."
                                value={description} onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <h5 className="mb-3 text-secondary border-bottom pb-2">Preguntas</h5>

                    {/* Renderizado dinámico de las preguntas */}
                    {questions.map((q, index) => (
                        <div key={index} className="row g-2 align-items-end mb-3 bg-light p-3 rounded border">
                            <div className="col-md-1 text-center">
                                <span className="badge bg-secondary fs-6">{index + 1}</span>
                            </div>
                            <div className="col-md-7">
                                <label className="form-label fw-bold small">Pregunta</label>
                                <input
                                    type="text" className="form-control"
                                    placeholder="¿Cómo te sientes hoy?"
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small">Tipo de respuesta</label>
                                <select
                                    className="form-select"
                                    value={q.type}
                                    onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                                >
                                    <option value="RATING">Calificación (1 al 5)</option>
                                    <option value="YES_NO">Sí / No</option>
                                    <option value="TEXT">Comentario Abierto</option>
                                </select>
                            </div>
                            <div className="col-md-1 text-end">
                                {questions.length > 1 && (
                                    <button type="button" className="btn btn-outline-danger" onClick={() => removeQuestion(index)} title="Eliminar pregunta">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-outline-primary fw-bold" onClick={addQuestion}>
                            <i className="fas fa-plus me-2"></i>Añadir otra pregunta
                        </button>

                        <button type="submit" className="btn btn-success fw-bold px-5">
                            <i className="fas fa-paper-plane me-2"></i>Publicar Encuesta
                        </button>
                    </div>
                </form>
            </div>

            {/* LISTA DE ENCUESTAS */}
            <div className="card shadow-sm p-4">
                <h4 className="mb-3">Historial de Encuestas</h4>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Título</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Preguntas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-4 text-muted">Aún no has creado encuestas.</td></tr>
                            ) : (
                                surveys.map((s) => (
                                    <React.Fragment key={s.id}>
                                        <tr>
                                            <td className="fw-bold d-flex align-items-center">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary me-2"
                                                    onClick={() => toggleExpand(s.id)}
                                                    title="Ver preguntas"
                                                >
                                                    <i className={`fas ${expandedSurveyId === s.id ? 'fa-minus' : 'fa-plus'}`}></i>
                                                </button>
                                                {s.title}
                                            </td>
                                            <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}</td>
                                            <td>
                                                <span className={`badge ${s.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {s.is_active ? "Activa" : "Cerrada"}
                                                </span>
                                            </td>
                                            <td>{s.questions?.length || 0}</td>
                                        </tr>
                                        {/* FILA DESPLEGABLE */}
                                        {expandedSurveyId === s.id && (
                                            <tr className="bg-light">
                                                <td colSpan="4" className="p-3 border-bottom border-primary border-2">
                                                    <h6 className="fw-bold text-primary mb-2">Preguntas realizadas en esta encuesta:</h6>
                                                    <ul className="mb-0 text-muted small">
                                                        {s.questions?.map((q, i) => (
                                                            <li key={q.id}>
                                                                <strong>{i + 1}.</strong> {q.text} <span className="fst-italic text-secondary">({q.type})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}