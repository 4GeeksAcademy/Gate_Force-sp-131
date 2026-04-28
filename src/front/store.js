export const initialStore = () => {
  return {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    companyInfo: null,
    employeeInfo: null,
    managerInfo: null,
  };
};

const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: localStorage.getItem("token") || null,
      role: localStorage.getItem("role") || null,
      managerInfo: null,
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

      loginEmployee: async (email, password) => {
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";

        try {
          const resp = await fetch(`${API_URL}employee/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (resp.ok) {
            const data = await resp.json();

            setStore({
              token: data.token,
              role: data.role,
              employeeInfo: data.role === "employee" ? data : null,
              managerInfo: data.role === "manager" ? data : null,
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            if (data.role === "manager") {
              return { success: true, path: "/manager-dashboard" };
            }
            return { success: true, path: "/employee-dashboard" };
          }

          const errorData = await resp.json();
          return {
            success: false,
            msg: errorData.msg || "Error de credenciales",
          };
        } catch (error) {
          console.error("Error en login:", error);
          return { success: false, msg: "Error de conexión" };
        }
      },
      getManagerData: async () => {
        const store = getStore();
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";

        try {
          const res = await fetch(`${API_URL}manager/dashboard`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token || localStorage.getItem("token")}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setStore({ ...store, managerInfo: data });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error cargando datos del manager:", error);
          return false;
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

        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
        if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);
        const finalUrlb = `${baseUrl}/api/employee/dashboard`;
        console.log("Llamando a:", finalUrlb);
        try {
          const res = await fetch(finalUrlb, {
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
          managerInfo: null,
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
