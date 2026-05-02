export const initialStore = () => {
  return {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null, // ADMIN, COMPANY, EMPLOYEE
    user: JSON.parse(localStorage.getItem("user")) || null,
  };
};

const getState = ({ getStore, getActions, setStore }) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  return {
    store: initialStore(),

    actions: {
      // HELPER: Una sola función para manejar fetch con headers y auth
      apiFetch: async (endpoint, method = "GET", body = null) => {
    const store = getStore();
    const token = store.token || localStorage.getItem("token");

    const params = {
        method,
        headers: { "Content-Type": "application/json" },
    };

    if (token) {
        params.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) params.body = JSON.stringify(body);

    try {
        const resp = await fetch(`${baseUrl}/api${endpoint}`, params);
        
        // 1. Manejo del error 401 (Token expirado)
        if (resp.status === 401) {
            console.error("Sesión expirada o token inválido");
            getActions().logout();
            return { ok: false, data: { msg: "Session expired. Please login again." } };
        }

        // 2. Manejo del error 500 (Caída del servidor)
        if (resp.status === 500) {
            console.error("El backend ha reportado un Error 500.");
            return { ok: false, data: { msg: "Error interno del servidor. Revisa la terminal de Flask." } };
        }

        // 3. Procesamos la respuesta solo si sabemos que es segura
        const data = await resp.json();
        return { ok: resp.ok, data };

    } catch (error) {
        console.error("Error en la petición (Posible error de red o JSON inválido):", error);
        return { ok: false, data: { msg: "Network error or invalid server response" } };
    }
},

      // AUTH: Login unificado para todos los roles
      login: async (email, password) => {
        const actions = getActions();
        const { ok, data } = await actions.apiFetch("/login", "POST", {
          email,
          password,
        });

        if (ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("user", JSON.stringify(data.user));

          setStore({
            token: data.token,
            role: data.role,
            user: data.user,
          });
          return { success: true, role: data.role };
        }
        return { success: false, msg: data.msg };
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setStore({ token: null, role: null, user: null });
      },

      // COMPANIES
      signupCompany: async (formData) => {
        const actions = getActions();
        return await actions.apiFetch("/companies", "POST", formData);
      },

      // EMPLOYEES
      createEmployee: async (employeeData) => {
        const actions = getActions();
        return await actions.apiFetch("/employees", "POST", employeeData);
      },

      getEmployees: async () => {
        const actions = getActions();
        const { ok, data } = await actions.apiFetch("/employees");
        return ok ? data : [];
      },

      // WORK RECORDS (TIME TRACKING)
      clockIn: async () => {
        const actions = getActions();
        return await actions.apiFetch("/clock-in", "POST");
      },

      clockOut: async () => {
        const actions = getActions();
        return await actions.apiFetch("/clock-out", "PUT");
      },

      // INCIDENTS & VACATIONS
      reportIncident: async (incidentData) => {
        const actions = getActions();
        return await actions.apiFetch("/incidents", "POST", incidentData);
      },

      requestVacation: async (vacationData) => {
        const actions = getActions();
        return await actions.apiFetch(
          "/vacations/request",
          "POST",
          vacationData,
        );
      },

      // SURVEYS
      getPendingSurveys: async () => {
        const actions = getActions();
        const { ok, data } = await actions.apiFetch("/surveys/pending");
        return ok ? data : [];
      },

      submitSurvey: async (surveyId, answers) => {
        const actions = getActions();
        return await actions.apiFetch(`/surveys/${surveyId}/respond`, "POST", {
          answers,
        });
      },
    },
  };
};

export default getState;
