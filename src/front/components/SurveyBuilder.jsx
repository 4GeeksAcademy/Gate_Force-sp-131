import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const SurveyBuilder = () => {
    const { actions } = useGlobalReducer();
    const [survey, setSurvey] = useState({ title: "", description: "", questions: [{ text: "", type: "TEXT" }] });

    const addQuestion = () => {
        setSurvey({ ...survey, questions: [...survey.questions, { text: "", type: "TEXT" }] });
    };

    const saveSurvey = async () => {
        const { ok } = await actions.apiFetch("/surveys", "POST", survey);
        if (ok) alert("Survey launched to all employees!");
    };

    return (
        <div className="container py-4">
            <div className="card border-0 shadow-sm p-4">
                <h2 className="fw-bold mb-4 text-center">Create New Survey</h2>
                <input
                    className="form-control form-control-lg mb-2"
                    placeholder="Survey Title (e.g., Monthly Satisfaction)"
                    onChange={e => setSurvey({ ...survey, title: e.target.value })}
                />
                <textarea
                    className="form-control mb-4"
                    placeholder="Short description..."
                    onChange={e => setSurvey({ ...survey, description: e.target.value })}
                ></textarea>

                <h5 className="fw-bold">Questions</h5>
                {survey.questions.map((q, index) => (
                    <div key={index} className="input-group mb-2">
                        <input
                            className="form-control"
                            placeholder={`Question #${index + 1}`}
                            onChange={e => {
                                let newQs = [...survey.questions];
                                newQs[index].text = e.target.value;
                                setSurvey({ ...survey, questions: newQs });
                            }}
                        />
                    </div>
                ))}

                <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-outline-primary" onClick={addQuestion}>+ Add Question</button>
                    <button className="btn btn-success flex-grow-1" onClick={saveSurvey}>Launch Survey</button>
                </div>
            </div>
        </div>
    );
};

export default SurveyBuilder;