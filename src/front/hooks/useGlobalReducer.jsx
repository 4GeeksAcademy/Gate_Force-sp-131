import React, { useReducer, createContext, useContext, useMemo, useEffect } from "react";
import getState, { initialStore } from "../store";

export const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
    // 1. Reducer simple: solo combina el estado actual con los nuevos cambios
    const [store, dispatch] = useReducer((state, action) => {
        return { ...state, ...action };
    }, initialStore());

    // 2. Memorizamos las acciones para que no cambien nunca entre renderizados
    // Esto evita que los useEffect de tus componentes se disparen sin sentido
    const stateContext = useMemo(() => {
        return getState({
            getStore: () => store,
            getActions: () => stateContext.actions,
            setStore: (updatedStore) => dispatch(updatedStore)
        });
    }, [store]); // Solo se recalcula si el store cambia

    // 3. (Opcional) Sincronización inicial o logs de auditoría en desarrollo
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log("Current Global Store:", store);
        }
    }, [store]);

    return (
        <StoreContext.Provider value={stateContext}>
            {children}
        </StoreContext.Provider>
    );
};

/**
 * Custom Hook para acceder al Store y las Acciones
 * @returns {{ store: object, actions: object }}
 */
const useGlobalReducer = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useGlobalReducer must be used within a StoreProvider");
    }
    return context;
};

export default useGlobalReducer;