import { useState, useEffect } from "react";

// Module-level singletons so the script is injected only once
let _loaded = false;
let _loading = false;
const _listeners = new Set();

export const useGoogleMaps = () => {
    const [loaded, setLoaded] = useState(_loaded);

    useEffect(() => {
        if (_loaded) {
            setLoaded(true);
            return;
        }

        const notify = () => setLoaded(true);
        _listeners.add(notify);

        if (!_loading) {
            _loading = true;
            const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!key) {
                console.warn("[useGoogleMaps] VITE_GOOGLE_MAPS_API_KEY is not set");
                return;
            }

            const cb = "__gMapsReady__";
            window[cb] = () => {
                _loaded = true;
                _loading = false;
                _listeners.forEach(fn => fn());
                _listeners.clear();
                delete window[cb];
            };

            const script = document.createElement("script");
            script.id = "google-maps-script";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=${cb}`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        return () => _listeners.delete(notify);
    }, []);

    return loaded;
};
