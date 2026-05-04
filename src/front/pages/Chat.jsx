import React, { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";

const Chat = () => {
    const { store, actions } = useGlobalReducer();
    const { employeeId } = useParams(); // Obtener employeeId de la URL para compañías
    const { role } = store;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [employeeName, setEmployeeName] = useState("");
    const bottomRef = useRef(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadEmployeeName = async () => {
        if (role === "COMPANY" && employeeId) {
            const { ok, data } = await actions.apiFetch(`/employees/${employeeId}`);
            if (ok) {
                setEmployeeName(`${data.first_name} ${data.last_name}`);
            }
        }
    };

    const loadMessages = async () => {
        setLoading(true);
        const endpoint =
            role === "EMPLOYEE"
                ? "/chat/messages"
                : `/chat/messages?employee_id=${employeeId}`;
        const { ok, data } = await actions.apiFetch(endpoint);
        if (ok) {
            setMessages(data);
            setUnread(0);
        }
        setLoading(false);
    };

    const checkUnread = async () => {
        const { ok, data } = await actions.apiFetch("/chat/unread-count");
        if (!ok) return;
        if (role === "EMPLOYEE") {
            setUnread(data.unread || 0);
        } else {
            const found = data.find(d => d.employee_id === employeeId);
            setUnread(found ? found.unread : 0);
        }
    };

    const sendMessage = async () => {
        const content = newMessage.trim();
        if (!content) return;
        setSending(true);
        const body =
            role === "EMPLOYEE"
                ? { content }
                : { content, employee_id: employeeId };
        const { ok, data } = await actions.apiFetch("/chat/messages", "POST", body);
        if (ok) {
            setMessages(prev => [...prev, data]);
            setNewMessage("");
        }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (role === "COMPANY" && !employeeId) return;
        loadMessages();
        loadEmployeeName();
    }, [employeeId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const senderLabel = (msg) => {
        if (role === "EMPLOYEE") {
            return msg.sender_role === "EMPLOYEE" ? "Tú" : "Empresa";
        }
        return msg.sender_role === "COMPANY" ? "Tú" : employeeName || "Empleado";
    };

    const isOwn = (msg) => {
        return (role === "EMPLOYEE" && msg.sender_role === "EMPLOYEE") ||
               (role === "COMPANY"  && msg.sender_role === "COMPANY");
    };

    if (role === "COMPANY" && !employeeId) {
        return (
            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex align-items-center justify-content-center p-5">
                <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
                <p className="text-muted">Selecciona un empleado para iniciar el chat.</p>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column" style={{ height: "600px" }}>
            <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between px-4 py-3 border-0">
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-chat-dots-fill text-primary"></i>
                    <span className="fw-bold">
                        {role === "EMPLOYEE" ? "Chat con tu empresa" : `Chat con ${employeeName}`}
                    </span>
                </div>
                <button
                    className="btn btn-sm btn-outline-light rounded-pill d-flex align-items-center gap-2"
                    onClick={checkUnread}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Nuevos mensajes
                    {unread > 0 && (
                        <span className="badge bg-danger rounded-pill">{unread}</span>
                    )}
                </button>
            </div>

            <div className="flex-grow-1 overflow-auto px-4 py-3 bg-light">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                        <i className="bi bi-chat-square-text fs-1 mb-2"></i>
                        <small>No hay mensajes aún. ¡Sé el primero en escribir!</small>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`d-flex mb-3 ${isOwn(msg) ? "justify-content-end" : "justify-content-start"}`}
                        >
                            {!isOwn(msg) && (
                                <div
                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0 me-2"
                                    style={{ width: 36, height: 36 }}
                                >
                                    <i className="bi bi-person-fill text-white" style={{ fontSize: 14 }}></i>
                                </div>
                            )}
                            <div style={{ maxWidth: "70%" }}>
                                <div className={`small fw-semibold mb-1 ${isOwn(msg) ? "text-end text-primary" : "text-muted"}`}>
                                    {senderLabel(msg)}
                                </div>
                                <div
                                    className={`rounded-4 px-3 py-2 ${
                                        isOwn(msg)
                                            ? "bg-primary text-white rounded-top-end-0"
                                            : "bg-white border rounded-top-start-0"
                                    }`}
                                    style={{ wordBreak: "break-word" }}
                                >
                                    {msg.content}
                                </div>
                                <div className={`small text-muted mt-1 ${isOwn(msg) ? "text-end" : ""}`}>
                                    {msg.created_at}
                                </div>
                            </div>
                            {isOwn(msg) && (
                                <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0 ms-2"
                                    style={{ width: 36, height: 36 }}
                                >
                                    <i className="bi bi-person-fill text-white" style={{ fontSize: 14 }}></i>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            <div className="card-footer bg-white border-top px-4 py-3">
                <div className="input-group">
                    <textarea
                        className="form-control border-0 bg-light rounded-start-4"
                        rows={1}
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ resize: "none" }}
                    />
                    <button
                        className="btn btn-primary rounded-end-4 px-4"
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                    >
                        {sending
                            ? <span className="spinner-border spinner-border-sm"></span>
                            : <i className="bi bi-send-fill"></i>
                        }
                    </button>
                </div>
                <div className="text-muted small mt-1">Enter para enviar · Shift+Enter para nueva línea</div>
            </div>
        </div>
    );
};

export default Chat;