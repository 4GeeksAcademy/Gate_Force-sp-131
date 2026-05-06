import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
const RECONNECT_EVERY = 30;

const Chat = () => {
    const { store, actions } = useGlobalReducer();
    const { employeeId: paramEmployeeId } = useParams();
    const navigate = useNavigate();
    const { role, user } = store;

    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [countdown, setCountdown] = useState(RECONNECT_EVERY);
    const [connected, setConnected] = useState(false);
    const [unreadMap, setUnreadMap] = useState({});
    const [search, setSearch] = useState("");

    const bottomRef = useRef(null);
    const socketRef = useRef(null);
    const countRef = useRef(null);

    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const getRoomData = (contact) => {
        if (role === "EMPLOYEE") {
            return { company_id: user?.company_id, employee_id: user?.id };
        }
        return { company_id: user?.id, employee_id: contact?.id };
    };

    const connectSocket = (contact) => {
        if (socketRef.current) socketRef.current.disconnect();
        const socket = io(BACKEND_URL, { transports: ["websocket"] });
        socketRef.current = socket;
        socket.on("connect", () => {
            setConnected(true);
            socket.emit("join_chat", getRoomData(contact));
        });
        socket.on("disconnect", () => setConnected(false));
        socket.on("new_message", (msg) => {
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        });
        setCountdown(RECONNECT_EVERY);
    };

    const startCountdown = (contact) => {
        clearInterval(countRef.current);
        countRef.current = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { connectSocket(contact); return RECONNECT_EVERY; }
                return c - 1;
            });
        }, 1000);
    };

    const loadContacts = async () => {
        if (role === "COMPANY") {
            const { ok, data } = await actions.apiFetch("/employees");
            if (ok) setContacts(data);
        }
    };

    const loadUnreadCounts = async () => {
        const { ok, data } = await actions.apiFetch("/chat/unread-count");
        if (!ok) return;
        if (role === "EMPLOYEE") {
            setUnreadMap({ company: data.unread || 0 });
        } else {
            const map = {};
            data.forEach(d => { map[d.employee_id] = d.unread; });
            setUnreadMap(map);
        }
    };

    const loadMessages = async (contact) => {
        setLoading(true);
        const endpoint = role === "EMPLOYEE"
            ? "/chat/messages"
            : `/chat/messages?employee_id=${contact.id}`;
        const { ok, data } = await actions.apiFetch(endpoint);
        if (ok) setMessages(data);
        setLoading(false);
    };

    const selectContact = (contact) => {
        setActiveContact(contact);
        loadMessages(contact);
        connectSocket(contact);
        startCountdown(contact);
        setUnreadMap(prev => ({ ...prev, [contact.id]: 0 }));
    };

    const sendMessage = async () => {
        const content = newMessage.trim();
        if (!content || !activeContact) return;
        setSending(true);
        const body = role === "EMPLOYEE"
            ? { content }
            : { content, employee_id: activeContact.id };
        const { ok, data } = await actions.apiFetch("/chat/messages", "POST", body);
        if (ok) {
            setMessages(prev => [...prev, data]);
            setNewMessage("");
            socketRef.current?.emit("send_message", { ...data, ...getRoomData(activeContact) });
        }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    useEffect(() => {
        loadUnreadCounts();
        if (role === "COMPANY") {
            loadContacts();
        } else {
            const companyContact = {
                id: user?.company_id,
                first_name: user?.nombre_empresa || "Tu",
                last_name: "Empresa",
                profile_image: user?.logo_url || user?.company_logo || user?.company?.logo_url || user?.profile_image || null,
                logo_url: user?.logo_url || user?.company_logo || user?.company?.logo_url || user?.profile_image || null,
            };
            setContacts([companyContact]);
            selectContact(companyContact);
        }
        return () => {
            socketRef.current?.disconnect();
            clearInterval(countRef.current);
        };
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const isOwn = (msg) =>
        (role === "EMPLOYEE" && msg.sender_role === "EMPLOYEE") ||
        (role === "COMPANY" && msg.sender_role === "COMPANY");

    const groupedMessages = () => {
        const groups = [];
        let lastDate = null;
        messages.forEach(msg => {
            const date = msg.created_at?.split(" ")[0];
            if (date !== lastDate) { groups.push({ type: "date", label: date }); lastDate = date; }
            groups.push({ type: "msg", msg });
        });
        return groups;
    };

    const getContactName = (c) => {
        if (!c) return "";
        if (c.nombre_empresa) return c.nombre_empresa;
        return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
    };

    const getInitial = (c) => getContactName(c).charAt(0).toUpperCase();

    const getLastMessage = (c) => {
        return "";
    };

    const filteredContacts = contacts.filter(c =>
        getContactName(c).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "row", margin: "0 50px" }}
        >
            <div className="border-end d-flex flex-column" style={{ width: 300, minWidth: 300, backgroundColor: "#fff" }}>
                <div className="p-3 border-bottom">
                    <div className="input-group">
                        <span className="input-group-text bg-light border-0 rounded-start-4">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control bg-light border-0 rounded-end-4"
                            placeholder="Search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-grow-1 overflow-auto">
                    {filteredContacts.map(contact => {
                        const name = getContactName(contact);
                        const initial = getInitial(contact);
                        const unread = unreadMap[contact.id] || 0;
                        const active = activeContact?.id === contact.id;

                        return (
                            <div
                                key={contact.id}
                                className={`d-flex align-items-center gap-3 px-3 py-3 cursor-pointer border-bottom ${active ? "bg-primary bg-opacity-10" : ""}`}
                                style={{ cursor: "pointer", transition: "background 0.15s" }}
                                onClick={() => selectContact(contact)}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f8f9fa"; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}
                            >
                                <div className="position-relative flex-shrink-0">
                                    {(contact.profile_image || contact.logo_url || contact.company_logo)
                                        ? <img src={contact.profile_image || contact.logo_url || contact.company_logo} className="rounded-circle object-fit-cover" style={{ width: 46, height: 46 }} alt="" />
                                        : (
                                            <div
                                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 46, height: 46, fontSize: 18 }}
                                            >
                                                {initial}
                                            </div>
                                        )
                                    }
                                    <span
                                        className="position-absolute bottom-0 end-0 rounded-circle bg-success border border-white"
                                        style={{ width: 11, height: 11 }}
                                    />
                                </div>

                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-semibold small text-truncate">{name}</span>
                                    </div>
                                    <div className="text-muted text-truncate" style={{ fontSize: "0.75rem" }}>
                                        Haz clic para abrir el chat
                                    </div>
                                </div>

                                {unread > 0 && (
                                    <span className="badge bg-primary rounded-pill flex-shrink-0">{unread}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                {!activeContact ? (
                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-3" style={{ width: 72, height: 72 }}>
                            <i className="bi bi-chat-dots text-primary fs-2"></i>
                        </div>
                        <p className="mb-0">Selecciona un contacto para chatear</p>
                    </div>
                ) : (
                    <>
                        <div className="px-4 py-3 bg-white border-bottom d-flex align-items-center justify-content-between flex-shrink-0">
                            <div className="d-flex align-items-center gap-3">
                                <div className="position-relative">
                                    {(activeContact.profile_image || activeContact.logo_url || activeContact.company_logo)
                                        ? <img src={activeContact.profile_image || activeContact.logo_url || activeContact.company_logo} className="rounded-circle object-fit-cover" style={{ width: 42, height: 42 }} alt="" />
                                        : (
                                            <div
                                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 42, height: 42, fontSize: 17 }}
                                            >
                                                {getInitial(activeContact)}
                                            </div>
                                        )
                                    }
                                    <span
                                        className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${connected ? "bg-success" : "bg-secondary"}`}
                                        style={{ width: 11, height: 11 }}
                                    />
                                </div>
                                <div>
                                    <div className="fw-semibold">{getContactName(activeContact)}</div>
                                    <div className={connected ? "text-success" : "text-muted"} style={{ fontSize: "0.72rem" }}>
                                        {connected ? "Conectado" : "Reconectando..."}
                                        <span className="text-muted ms-2" style={{ fontSize: "0.68rem" }}>
                                            · reconexión en {String(countdown).padStart(2, "0")}s
                                        </span>
                                    </div>
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
                                    <small>No hay mensajes aún.</small>
                                </div>
                            ) : (
                                groupedMessages().map((item, i) => {
                                    if (item.type === "date") {
                                        return (
                                            <div key={`d-${i}`} className="d-flex justify-content-center my-3">
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
                                                    style={{ width: 30, height: 30, fontSize: 12 }}
                                                >
                                                    {getInitial(activeContact)}
                                                </div>
                                            )}
                                            <div style={{ maxWidth: "65%" }}>
                                                <div
                                                    className={`px-3 py-2 ${own ? "text-white rounded-4 rounded-bottom-end-0" : "bg-white rounded-4 rounded-bottom-start-0 border"}`}
                                                    style={{ wordBreak: "break-word", backgroundColor: own ? "#316AFF" : undefined, fontSize: "0.9rem" }}
                                                >
                                                    {msg.content}
                                                </div>
                                                <div className={`text-muted mt-1 ${own ? "text-end" : ""}`} style={{ fontSize: "0.68rem" }}>
                                                    {msg.created_at?.split(" ")[1]?.slice(0, 5)}
                                                </div>
                                            </div>
                                            {own && (
                                                <div
                                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white flex-shrink-0"
                                                    style={{ width: 30, height: 30 }}
                                                >
                                                    <i className="bi bi-person-fill" style={{ fontSize: 12 }}></i>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="bg-white border-top px-4 py-3 d-flex align-items-center gap-3 flex-shrink-0">
                            <input
                                type="text"
                                className="form-control border-0 bg-light rounded-4"
                                placeholder="Type message"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{ fontSize: "0.9rem" }}
                            />
                            <button
                                className="btn btn-warning rounded-4 px-4 d-flex align-items-center gap-2 flex-shrink-0"
                                onClick={sendMessage}
                                disabled={sending || !newMessage.trim()}
                                style={{ backgroundColor: "#316AFF", borderColor: "#316AFF" }}
                            >
                                {sending
                                    ? <span className="spinner-border spinner-border-sm"></span>
                                    : <><span className="small fw-semibold">Send</span><i className="bi bi-send-fill"></i></>
                                }
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;