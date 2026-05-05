import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
const RECONNECT_EVERY = 30;

const Chat = () => {
    const { store, actions } = useGlobalReducer();
    const { employeeId } = useParams();
    const { role, user } = store;

    const [messages, setMessages]         = useState([]);
    const [newMessage, setNewMessage]     = useState("");
    const [loading, setLoading]           = useState(false);
    const [sending, setSending]           = useState(false);
    const [employeeName, setEmployeeName] = useState("");
    const [countdown, setCountdown]       = useState(RECONNECT_EVERY);
    const [connected, setConnected]       = useState(false);

    const bottomRef   = useRef(null);
    const socketRef   = useRef(null);
    const timerRef    = useRef(null);
    const countRef    = useRef(null);

    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const getRoomData = () => {
        if (role === "EMPLOYEE") {
            return { company_id: user?.company_id, employee_id: user?.id };
        }
        return { company_id: user?.id, employee_id: Number(employeeId) };
    };

    const connectSocket = () => {
        if (socketRef.current) socketRef.current.disconnect();

        const socket = io(BACKEND_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            setConnected(true);
            socket.emit("join_chat", getRoomData());
        });

        socket.on("disconnect", () => setConnected(false));

        socket.on("new_message", (msg) => {
            setMessages(prev => {
                const exists = prev.find(m => m.id === msg.id);
                return exists ? prev : [...prev, msg];
            });
        });

        setCountdown(RECONNECT_EVERY);
    };

    const startCountdown = () => {
        clearInterval(countRef.current);
        countRef.current = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    connectSocket();
                    return RECONNECT_EVERY;
                }
                return c - 1;
            });
        }, 1000);
    };

    const loadMessages = async () => {
        setLoading(true);
        const endpoint = role === "EMPLOYEE"
            ? "/chat/messages"
            : `/chat/messages?employee_id=${employeeId}`;
        const { ok, data } = await actions.apiFetch(endpoint);
        if (ok) setMessages(data);
        setLoading(false);
    };

    const loadEmployeeName = async () => {
        if (role === "COMPANY" && employeeId) {
            const { ok, data } = await actions.apiFetch(`/employees/${employeeId}`);
            if (ok) setEmployeeName(`${data.first_name} ${data.last_name}`);
        }
    };

    const sendMessage = async () => {
        const content = newMessage.trim();
        if (!content) return;
        setSending(true);

        const body = role === "EMPLOYEE"
            ? { content }
            : { content, employee_id: Number(employeeId) };

        const { ok, data } = await actions.apiFetch("/chat/messages", "POST", body);
        if (ok) {
            setMessages(prev => [...prev, data]);
            setNewMessage("");
            if (socketRef.current?.connected) {
                socketRef.current.emit("send_message", { ...data, ...getRoomData() });
            }
        }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    useEffect(() => {
        if (role === "COMPANY" && !employeeId) return;
        loadMessages();
        loadEmployeeName();
        connectSocket();
        startCountdown();

        return () => {
            socketRef.current?.disconnect();
            clearInterval(timerRef.current);
            clearInterval(countRef.current);
        };
    }, [employeeId]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const isOwn = (msg) =>
        (role === "EMPLOYEE" && msg.sender_role === "EMPLOYEE") ||
        (role === "COMPANY"  && msg.sender_role === "COMPANY");

    const contactName    = role === "EMPLOYEE" ? "Tu Empresa" : (employeeName || "Empleado");
    const contactInitial = contactName.charAt(0).toUpperCase();

    const groupedMessages = () => {
        const groups = [];
        let lastDate = null;
        messages.forEach(msg => {
            const date = msg.created_at?.split(" ")[0];
            if (date !== lastDate) {
                groups.push({ type: "date", label: date });
                lastDate = date;
            }
            groups.push({ type: "msg", msg });
        });
        return groups;
    };

    if (role === "COMPANY" && !employeeId) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 text-center p-5">
                <div>
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 72, height: 72 }}>
                        <i className="bi bi-chat-dots text-primary fs-2"></i>
                    </div>
                    <p className="text-muted">Selecciona un empleado para iniciar el chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>

            <div className="px-4 py-3 bg-white border-bottom d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                        <div
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: 44, height: 44, fontSize: 18 }}
                        >
                            {contactInitial}
                        </div>
                        <span
                            className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${connected ? "bg-success" : "bg-secondary"}`}
                            style={{ width: 12, height: 12 }}
                        />
                    </div>
                    <div>
                        <div className="fw-semibold">{contactName}</div>
                        <div className={`${connected ? "text-success" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                            {connected ? "Conectado en tiempo real" : "Reconectando..."}
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <div className="text-muted small d-none d-sm-flex align-items-center gap-1">
                        <i className="bi bi-arrow-repeat"></i>
                        {/* Reconexión en */}
                        <span
                            className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2"
                            style={{ minWidth: 32, fontVariantNumeric: "tabular-nums" }}
                        >
                            {/* {String(countdown).padStart(2, "0")}s */}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1 overflow-auto px-4 py-3" style={{ backgroundColor: "#f0f2f7" }}>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                        <i className="bi bi-chat-square-text fs-1 mb-2 opacity-25"></i>
                        <small>No hay mensajes aún. ¡Sé el primero en escribir!</small>
                    </div>
                ) : (
                    groupedMessages().map((item, i) => {
                        if (item.type === "date") {
                            return (
                                <div key={`date-${i}`} className="d-flex justify-content-center my-3">
                                    <span className="badge bg-white text-muted border px-3 py-2 rounded-pill" style={{ fontSize: "0.75rem" }}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        }

                        const { msg } = item;
                        const own = isOwn(msg);

                        return (
                            <div key={msg.id} className={`d-flex mb-2 align-items-end gap-2 ${own ? "justify-content-end" : "justify-content-start"}`}>
                                {!own && (
                                    <div
                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                        style={{ width: 32, height: 32, fontSize: 13 }}
                                    >
                                        {contactInitial}
                                    </div>
                                )}
                                <div style={{ maxWidth: "65%" }}>
                                    <div
                                        className={`px-3 py-2 ${own ? "text-white rounded-4 rounded-bottom-end-0" : "bg-white rounded-4 rounded-bottom-start-0 border"}`}
                                        style={{
                                            wordBreak: "break-word",
                                            backgroundColor: own ? "#316AFF" : undefined,
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                    <div className={`text-muted mt-1 ${own ? "text-end" : ""}`} style={{ fontSize: "0.7rem" }}>
                                        {msg.created_at?.split(" ")[1]?.slice(0, 5)}
                                    </div>
                                </div>
                                {own && (
                                    <div
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white flex-shrink-0"
                                        style={{ width: 32, height: 32 }}
                                    >
                                        <i className="bi bi-person-fill" style={{ fontSize: 14 }}></i>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <div className="bg-white border-top px-4 py-3 d-flex align-items-center gap-3">
                <textarea
                    className="form-control border rounded-4 bg-light"
                    rows={1}
                    placeholder="Type message"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ resize: "none", fontSize: "0.9rem" }}
                />
                <button
                    className="btn btn-primary rounded-4 px-4 d-flex align-items-center gap-2 flex-shrink-0"
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    style={{ backgroundColor: "#316AFF", borderColor: "#316AFF" }}
                >
                    {sending
                        ? <span className="spinner-border spinner-border-sm"></span>
                        : <>
                            <span className="d-none d-sm-inline small fw-semibold">Send</span>
                            <i className="bi bi-send-fill"></i>
                          </>
                    }
                </button>
            </div>
        </div>
    );
};

export default Chat;