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

            // 1. Guardamos lo básico primero
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            setStore({
              token: data.token,
              role: data.role,
            });

            // 2. LLAMADA CRÍTICA: Esperamos a que los datos del empleado se carguen
            // Usamos el getActions() para llamar a la función que ya tienes
            const actions = getActions();
            const loaded = await actions.getEmployeeData();

            if (loaded) {
              return {
                success: true,
                path:
                  data.role === "manager"
                    ? "/manager-dashboard"
                    : "/employee-dashboard",
              };
            }
          }
          return { success: false, msg: "Error en la carga de datos" };
        } catch (error) {
          return { success: false, msg: "Error de red" };
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
        const store = getStore();
        const token = store.token || localStorage.getItem("token");
        if (!token) return false;

        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";

        try {
          const res = await fetch(`${API_URL}employee/dashboard`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setStore({ employeeInfo: data });
            return true;
          }
          return false;
        } catch (error) {
          return false;
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
