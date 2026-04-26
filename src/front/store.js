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
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
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
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
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
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
        try {
          const res = await fetch(`${API_URL}company/signup`, {
            method: "POST",
            body: JSON.stringify({ nombre_empresa: nombre, password, region, email }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          return { success: res.ok, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      loginEmployee: async (credentials) => {
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
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
            setStore({ token: data.token, role: "employee" });
            return { success: true };
          }
          return { success: false, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },

      signupEmployee: async (formData) => {
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
        try {
          const res = await fetch(`${API_URL}employee/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
        try {
          const res = await fetch(`${API_URL}employee/dashboard`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token || localStorage.getItem("token")}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setStore({ ...store, employeeInfo: data });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error de conexión:", error);
          return false;
        }
      },

      loginAdmin: async (credentials) => {
        const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
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
        setStore({ token: null, role: null, companyInfo: null, employeeInfo: null });
        console.log("Sesión cerrada correctamente");
      },
    },
  };
};

export default getState;