import { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../hooks/useGoogleMaps";
import { getCached, setCached } from "../utils/geocodeCache";

const LocationCell = ({ location }) => {
    const mapsLoaded = useGoogleMaps();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [address, setAddress] = useState(null);
    const [showMap, setShowMap] = useState(false);

    const parts = location ? location.split(",").map(Number) : [];
    const lat = parts[0];
    const lng = parts[1];
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    // Reverse geocode — reads/writes shared cache to avoid redundant API calls
    useEffect(() => {
        if (!hasCoords || !mapsLoaded) return;

        const cached = getCached(lat, lng);
        if (cached) { setAddress(cached); return; }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const resolved =
                status === "OK" && results[0]
                    ? results[0].formatted_address
                    : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setCached(lat, lng, resolved);
            setAddress(resolved);
        });
    }, [hasCoords, mapsLoaded, location]);

    // Init mini-map once on first show; reuse on subsequent toggles
    useEffect(() => {
        if (!showMap || !mapRef.current || !mapsLoaded || !hasCoords) return;
        if (mapInstanceRef.current) {
            const resizeTimer = setTimeout(() => mapInstanceRef.current.invalidateSize?.(), 50);
            return () => clearTimeout(resizeTimer);
        }
        const pos = { lat, lng };
        const map = new window.google.maps.Map(mapRef.current, {
            center: pos,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
            scrollwheel: false,
            gestureHandling: "cooperative",
        });
        new window.google.maps.Marker({
            position: pos,
            map,
            title: address || "Ubicación de fichaje",
            animation: window.google.maps.Animation.DROP,
        });
        mapInstanceRef.current = map;
    }, [showMap, mapsLoaded]);

    if (!hasCoords) return <span className="text-muted small">—</span>;

    return (
        <>
            <button
                type="button"
                className="btn btn-link p-0 text-start text-decoration-none small d-flex align-items-center gap-1"
                onClick={() => setShowMap(v => !v)}
                title={showMap ? "Ocultar mapa" : "Ver en mapa"}
            >
                <i className={`bi bi-geo-alt${showMap ? "-fill" : ""} text-primary`}></i>
                <span className="text-dark">
                    {address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                </span>
                <i className={`bi bi-chevron-${showMap ? "up" : "down"} text-muted ms-1`} style={{ fontSize: "0.65rem" }}></i>
            </button>

            <div
                ref={mapRef}
                style={{
                    display: showMap ? "block" : "none",
                    width: "100%",
                    height: 200,
                    borderRadius: 8,
                    marginTop: 8,
                    border: "1px solid #dee2e6",
                    overflow: "hidden",
                }}
            />
        </>
    );
};

export default LocationCell;
