import { useEffect, useRef } from "react";
import { useGoogleMaps } from "../hooks/useGoogleMaps";

const LocationMap = ({ coords, detectionId, status, onRefresh }) => {
    const mapsLoaded = useGoogleMaps();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    const lat = coords ? Number(coords.split(",")[0]) : null;
    const lng = coords ? Number(coords.split(",")[1]) : null;
    const hasCoords = lat !== null && !isNaN(lat);

    // Runs on every detect() call thanks to detectionId in deps,
    // even when coords string hasn't changed (same GPS fix after VPN toggle)
    useEffect(() => {
        if (!mapsLoaded || !mapRef.current || !hasCoords) return;

        const pos = { lat, lng };

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                center: pos,
                zoom: 15,
                disableDefaultUI: true,
                zoomControl: true,
                gestureHandling: "cooperative",
            });
            markerRef.current = new window.google.maps.Marker({
                position: pos,
                map: mapInstanceRef.current,
                title: "Tu ubicación",
                animation: window.google.maps.Animation.DROP,
            });
            return;
        }

        mapInstanceRef.current.panTo(pos);
        markerRef.current.setPosition(pos);
        // Bounce to confirm the map refreshed, even if coords are identical
        markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
        const bounceTimer = setTimeout(() => markerRef.current?.setAnimation(null), 1400);
        return () => clearTimeout(bounceTimer);
    }, [mapsLoaded, coords, detectionId]); // detectionId ensures this fires on every refresh

    const apiKeyMissing = !import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-geo-alt-fill text-primary"></i>
                        Ubicación del fichaje
                    </h6>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={onRefresh}
                        disabled={status === "loading"}
                    >
                        {status === "loading"
                            ? <span className="spinner-border spinner-border-sm me-1" />
                            : <i className="bi bi-crosshair me-1"></i>
                        }
                        {hasCoords ? "Actualizar" : "Detectar"}
                    </button>
                </div>

                {apiKeyMissing && (
                    <div className="alert alert-warning small py-2 mb-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Configura <code>VITE_GOOGLE_MAPS_API_KEY</code> en <code>.env</code>.
                    </div>
                )}

                {status === "error" && (
                    <div className="alert alert-danger small py-2 mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        No se pudo obtener la ubicación. Revisa los permisos del navegador
                        o si la VPN bloquea la geolocalización.
                    </div>
                )}

                {(status === "idle" || (status === "loading" && !hasCoords)) && (
                    <div
                        className="d-flex flex-column align-items-center justify-content-center bg-light rounded-3 text-muted"
                        style={{ height: 180 }}
                    >
                        {status === "loading"
                            ? <><div className="spinner-border text-primary mb-2" /><small>Obteniendo ubicación...</small></>
                            : <><i className="bi bi-map fs-1 mb-2"></i><small>Esperando geolocalización</small></>
                        }
                    </div>
                )}

                <div
                    ref={mapRef}
                    style={{
                        width: "100%",
                        height: hasCoords ? 200 : 0,
                        borderRadius: 10,
                        transition: "height 0.3s ease",
                        overflow: "hidden",
                    }}
                />

                {hasCoords && (
                    <p className="text-muted small mt-2 mb-0">
                        <i className="bi bi-pin-map me-1"></i>
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                        {status === "success" && (
                            <span className="ms-2 text-success fw-semibold">
                                <i className="bi bi-check-circle me-1"></i>Lista para el fichaje
                            </span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LocationMap;
