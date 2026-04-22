import { useContext, useReducer, createContext } from "react";
import getState, { initialStore } from "../store";

export const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [store, dispatch] = useReducer((state, action) => {
        return { ...state, ...action };
    }, initialStore());

    const setStore = (updatedStore) => dispatch(updatedStore);

    const stateContext = getState({
        getStore: () => store,
        getActions: () => stateContext.actions,
        setStore: setStore
    });

    return (
        <StoreContext.Provider value={{ store, actions: stateContext.actions }}>
            {children}
        </StoreContext.Provider>
    );
}

export default function useGlobalReducer() {
    return useContext(StoreContext);
}