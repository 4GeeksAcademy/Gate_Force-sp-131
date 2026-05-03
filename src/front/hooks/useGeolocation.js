import { useState, useCallback } from "react";
import { clearEntry } from "../utils/geocodeCache";

export const useGeolocation = () => {
    // id increments on every detect() call, guaranteeing a re-render
    // even when coords haven't changed (same GPS fix after VPN toggle)
    const [snapshot, setSnapshot] = useState({ coords: null, id: 0 });
    const [status, setStatus] = useState("idle");

    const detect = useCallback(() => {
        if (!navigator.geolocation) {
            setStatus("error");
            return Promise.resolve(null);
        }
        setStatus("loading");
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    const loc = `${latitude},${longitude}`;
                    clearEntry(latitude, longitude);
                    setSnapshot(prev => ({ coords: loc, id: prev.id + 1 }));
                    setStatus("success");
                    resolve(loc);
                },
                () => {
                    setStatus("error");
                    resolve(null);
                },
                {
                    enableHighAccuracy: false, // IP-based → changes with VPN
                    timeout: 15000,
                    maximumAge: 0,             // never serve a cached position
                }
            );
        });
    }, []);

    return {
        coords: snapshot.coords,
        detectionId: snapshot.id,
        status,
        detect,
    };
};
