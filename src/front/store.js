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
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") +
          "/company/login";
        try {
          const res = await fetch(API_URL, {
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
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const API_URL = `${base}/api/company/dashboard`.replace(
          "/api/api/",
          "/api/",
        );
        try {
          const res = await fetch(API_URL, {
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
          const errorData = await res
            .json()
            .catch(() => ({ msg: "Error no JSON" }));
          console.error("Error en Dashboard:", errorData.msg || res.statusText);
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
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") +
          "/employee/login";
        try {
          const res = await fetch(API_URL, {
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
        const API_URL =
          import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(
            /\/api$/,
            "",
          ) + "/api/";
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
        const token = store.token || localStorage.getItem("token");
        console.log("Token usado:", token); 
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const API_URL = `${base}/employee/dashboard`;
        try {
          const res = await fetch(API_URL, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setStore({ token: null, role: null, companyInfo: null });
        console.log("Sesión cerrada correctamente");
      },
    },
  };
};

export default getState;
