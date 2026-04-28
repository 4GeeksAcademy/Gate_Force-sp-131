export const initialStore = () => {
  return {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    companyInfo: null,
    employeeInfo: null,
  };
};

const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: localStorage.getItem("token") || null,
      role: localStorage.getItem("role") || null,
      employeeInfo: null,
    },

    actions: {
      loginCompany: async (credentials) => {
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";
        try {
          const res = await fetch(`${API_URL}company/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "company");
            setStore({ token: data.token, role: "company" });
            return { success: true };
          }
          return { success: false, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      getCompanyData: async () => {
        const store = getStore();
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";
        try {
          const res = await fetch(`${API_URL}company/dashboard`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token || localStorage.getItem("token")}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setStore({ ...store, companyInfo: data });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error de conexión:", error);
          return false;
        }
      },

      signupCompany: async (nombre, password, region, email) => {
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";
        try {
          const res = await fetch(`${API_URL}company/signup`, {
            method: "POST",
            body: JSON.stringify({
              nombre_empresa: nombre,
              password,
              region,
              email,
            }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          return { success: res.ok, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      loginEmployee: async (credentials) => {
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";
        try {
          const res = await fetch(`${API_URL}employee/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "employee");
            localStorage.setItem("username", data.first_name || "Empleado");
            setStore({ token: data.token, role: "employee" });
            return { success: true };
          }
          return { success: false, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      signupEmployee: async (formData) => {
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";

        const token = localStorage.getItem("token");

        try {
          const res = await fetch(`${API_URL}employee/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          return { success: res.ok, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      getEmployeeData: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        let baseUrl = import.meta.env.VITE_BACKEND_URL;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
        if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);

        const finalUrl = `${baseUrl}/api/employee/me`;
        console.log("Llamando a:", finalUrl);

        let baseUrl = import.meta.env.VITE_BACKEND_URL;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1); 
        if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4); 
        const finalUrl = `${baseUrl}/api/employee/dashboard`;
        console.log("Llamando a:", finalUrl); 
        try {
          const res = await fetch(finalUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const text = await res.text();
            console.error(
              "Error del servidor (HTML recibido):",
              text.substring(0, 100),
            );
            return;
          }

          const data = await res.json();
          setStore({ employeeInfo: data });
        } catch (error) {
          console.error("Error de conexión:", error);
        }
      },

      loginAdmin: async (credentials) => {
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";
        try {
          const res = await fetch(`${API_URL}admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "admin");
            localStorage.setItem("username", credentials.username);
            setStore({ token: data.token, role: "admin" });
            return { success: true };
          }
          return { success: false, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        setStore({
          token: null,
          role: null,
          companyInfo: null,
          employeeInfo: null,
        });
        console.log("Sesión cerrada correctamente");
      },

      toggleEmployee: async (id) => {
        const store = getStore();

        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const API_URL = `${base}/api/employees/${id}/toggle`.replace(
          "/api/api/",
          "/api/",
        );

        try {
          const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${store.token || localStorage.getItem("token")}`,
            },
          });

          if (res.ok) {
            return true;
          }
        } catch (error) {
          console.error("Error al cambiar estado del empleado:", error);
        }
        return false;
      },

      loadEverything: async () => {
        const actions = getActions();
        if (actions.getEmployeeData) {
          await actions.getEmployeeData();
        }
      },
    },
  };
};

export default getState;
