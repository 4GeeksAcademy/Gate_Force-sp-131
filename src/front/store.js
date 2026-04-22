export const initialStore = () => {
  return {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    companyInfo: null,
  };
};

const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: localStorage.getItem("token") || null,
      role: localStorage.getItem("role") || null,
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
            setStore({
              ...store,
              companyInfo: data,
            });
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

      signupCompany: async (nombre, password, region) => {
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
              password: password,
              region: region,
            }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          return { success: res.ok, msg: data.msg };
        } catch (error) {
          return { success: false, msg: "Error de red" };
        }
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setStore({
          token: null,
          role: null,
          companyInfo: null,
        });

        console.log("Sesión cerrada correctamente");
      },
    },
  };
};

export default getState;
