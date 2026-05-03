import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const AIRecommendationsHub = () => {
    const { actions } = useGlobalReducer();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadInsights = async () => {
        setLoading(true);
        try {
            const { ok, data } = await actions.apiFetch("/company/ai-insights");
            
            // Validamos que exista 'data' y el array 'history'
            if (ok && data && Array.isArray(data.history)) {
                // 🛡️ Filtro de seguridad: Eliminamos cualquier elemento nulo que mande el backend
                const cleanData = data.history.filter(item => item !== null);
                setInsights(cleanData);
            } else {
                setInsights([]);
            }
        } catch (error) {
            console.error("Error cargando insights:", error);
            setInsights([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    // --- FUNCIÓN PARA DAR COLOR SEGÚN LA NOTA ---
    const getScoreStyle = (score) => {
        const value = score ?? 0; // Si es null o undefined, tratamos como 0
        if (value === 0) return { color: "secondary", icon: "bi-dash-circle", text: "Sin datos" };
        if (value < 60) return { color: "danger", icon: "bi-exclamation-octagon-fill", text: "Atención Requerida" };
        if (value < 80) return { color: "warning", icon: "bi-exclamation-triangle-fill", text: "Precaución" };
        return { color: "success", icon: "bi-shield-check", text: "Saludable" };
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
        </div>
    );

    return (
        <div className="container py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <div className="bg-primary-subtle text-primary d-inline-block p-3 rounded-circle mb-3 shadow-sm">
                        <i className="bi bi-robot fs-1"></i>
                    </div>
                    <h2 className="fw-bold text-dark mb-1">Radar de IA y Recomendaciones</h2>
                    <p className="text-muted mb-0">Priorización automática basada en el análisis biométrico y emocional.</p>
                </div>
                <button className="btn btn-outline-secondary rounded-pill shadow-sm" onClick={loadInsights}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Refrescar
                </button>
            </div>

            {/* Lista de Insights */}
            {insights.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-light">
                    <i className="bi bi-stars text-secondary mb-3" style={{ fontSize: "3rem" }}></i>
                    <h4 className="fw-bold">No hay análisis disponibles</h4>
                    <p className="text-muted">Asegúrate de que los empleados estén realizando sus Wellness Checks.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {insights.map((insight, idx) => {
                        // 🛡️ Segundo filtro de seguridad por si acaso
                        if (!insight) return null;

                        const status = getScoreStyle(insight.final_wellness_score);

                        return (
                            <div key={insight.id || idx} className="col-12 col-xl-6">
                                <div className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden border-start border-4 border-${status.color}`}>
                                    <div className="card-body p-4">
                                        <div className="row">
                                            {/* Columna Izquierda: Foto */}
                                            <div className="col-sm-4 text-center mb-3 mb-sm-0 border-end-sm pe-sm-3">
                                                <div className="position-relative d-inline-block mb-3">
                                                    <div className="rounded-circle overflow-hidden shadow-sm" style={{ width: "90px", height: "90px", margin: "0 auto" }}>
                                                        {insight.photo_url ? (
                                                            <img src={insight.photo_url} alt="User" className="w-100 h-100 object-fit-cover" />
                                                        ) : (
                                                            <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
                                                                <i className="bi bi-person fs-1"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`position-absolute bottom-0 start-50 translate-middle-x badge bg-${status.color} rounded-pill border border-2 border-white shadow-sm`}>
                                                        {Math.round(insight.final_wellness_score || 0)}/100
                                                    </span>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">{insight.employee_name || "Empleado"}</h6>
                                                <div className="small text-muted mb-2">Análisis de IA</div>
                                            </div>

                                            {/* Columna Derecha: Diagnóstico */}
                                            <div className="col-sm-8 ps-sm-4 d-flex flex-column justify-content-center">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`${status.icon} text-${status.color} fs-5 me-2`}></i>
                                                    <span className={`fw-bold text-${status.color} text-uppercase small`}>
                                                        {status.text}
                                                    </span>
                                                    <span className="ms-auto text-muted small">
                                                        <i className="bi bi-calendar2 me-1"></i>
                                                        {insight.created_at?.split(" ")[0]}
                                                    </span>
                                                </div>

                                                <h6 className="fw-bold text-dark small mt-2">Sugerencia del sistema:</h6>
                                                <p className="text-muted small bg-light p-3 rounded-3 border">
                                                    "{insight.admin_recommendation || "Sin recomendaciones adicionales."}"
                                                </p>

                                                {/* Métricas rápidas */}
                                                <div className="row g-2 mt-auto">
                                                    <div className="col-6">
                                                        <div className="small text-muted mb-1" style={{ fontSize: "0.7rem" }}>
                                                            Estrés ({Math.round(insight.ai_stress || 0)}%)
                                                        </div>
                                                        <div className="progress" style={{ height: "4px" }}>
                                                            <div className="progress-bar bg-danger" 
                                                                 style={{ width: `${insight.ai_stress || 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="small text-muted mb-1" style={{ fontSize: "0.7rem" }}>
                                                            Alegría ({Math.round(insight.ai_joy || 0)}%)
                                                        </div>
                                                        <div className="progress" style={{ height: "4px" }}>
                                                            <div className="progress-bar bg-success" 
                                                                 style={{ width: `${insight.ai_joy || 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AIRecommendationsHub;