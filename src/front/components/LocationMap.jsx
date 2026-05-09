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

    // detectionId fuerza que el efecto se dispare en cada llamada a detect(), aunque las coordenadas no cambien
    // (ocurre cuando el GPS tiene el mismo fix pero el usuario pulsa "Update" tras cambiar la VPN)
    useEffect(() => {
        if (!mapsLoaded || !mapRef.current || !hasCoords) return;

        const pos = { lat, lng };
        let bounceTimeout;

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
                title: "Your location",
                animation: window.google.maps.Animation.DROP,
            });
        } else {
            mapInstanceRef.current.panTo(pos);
            markerRef.current.setPosition(pos);
            // Pequeño rebote para que el usuario vea que el mapa sí se actualizó, aunque la posición sea la misma
            markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
            bounceTimeout = setTimeout(() => markerRef.current?.setAnimation(null), 1400);
        }

        return () => {
            if (bounceTimeout) clearTimeout(bounceTimeout);
        };
    }, [mapsLoaded, coords, detectionId]);

    const apiKeyMissing = !import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-geo-alt-fill text-primary"></i>
                        Check-in Location
                    </h6>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-warning rounded-pill px-3"
                        onClick={onRefresh}
                        disabled={status === "loading"}
                    >
                        {status === "loading"
                            ? <span className="spinner-border spinner-border-sm me-1" />
                            : <i className="bi bi-crosshair me-1"></i>
                        }
                        {hasCoords ? "Update" : "Detect"}
                    </button>
                </div>

                {apiKeyMissing && (
                    <div className="alert alert-warning small py-2 mb-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env</code>.
                    </div>
                )}

                {status === "error" && (
                    <div className="alert alert-danger small py-2 mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        Could not get location. Check browser permissions or whether a VPN is blocking geolocation.
                    </div>
                )}

                {(status === "idle" || (status === "loading" && !hasCoords)) && (
                    <div
                        className="d-flex flex-column align-items-center justify-content-center bg-light rounded-3 text-muted"
                        style={{ height: 180 }}
                    >
                        {status === "loading"
                            ? <><div className="spinner-border text-primary mb-2" /><small>Getting location...</small></>
                            : <><i className="bi bi-map fs-1 mb-2"></i><small>Waiting for geolocation</small></>
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
                                <i className="bi bi-check-circle me-1"></i>Ready to clock in
                            </span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LocationMap;
