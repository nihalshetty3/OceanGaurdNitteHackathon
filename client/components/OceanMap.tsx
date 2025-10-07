import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import type { LatLngExpression } from "leaflet";
import type { AlertType } from "./AlertCard";

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  title: string;
  type: AlertType;
  severity?: "low" | "medium" | "high" | "critical";
  confidence?: number;
  reportedAt?: string;
}

// Create custom icons for different hazard types
const createCustomIcon = (type: AlertType, severity?: string) => {
  const getColor = (type: AlertType, severity?: string) => {
    if (severity === "critical") return "#dc2626"; // red
    if (severity === "high") return "#ea580c"; // orange
    if (severity === "medium") return "#d97706"; // amber
    if (severity === "low") return "#16a34a"; // green
    
    // Default colors by type
    switch (type.toLowerCase()) {
      case "oil spill": return "#dc2626";
      case "flood": return "#2563eb";
      case "earthquake": return "#7c2d12";
      case "cyclone": return "#7c3aed";
      case "tsunami": return "#0891b2";
      case "marine life distress": return "#059669";
      case "poaching": return "#be123c";
      case "unauthorized vessel": return "#be185d";
      case "unusual algae": return "#16a34a";
      default: return "#6b7280";
    }
  };

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${getColor(type, severity)}"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
        <text x="12.5" y="16" text-anchor="middle" font-family="Arial" font-size="10" fill="${getColor(type, severity)}">!</text>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

export default function OceanMap({
  markers,
  center = [15.2993, 74.1240], // Center on Goa/coastal Karnataka
  zoom = 6,
}: {
  markers: MapMarker[];
  center?: LatLngExpression;
  zoom?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <MapContainer center={center} zoom={zoom} className="h-[320px] w-full md:h-[420px]">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((m) => (
          <Marker 
            key={m.id} 
            position={m.position}
            icon={createCustomIcon(m.type, m.severity)}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-semibold text-base mb-2">{m.title}</div>
                <div className="space-y-1">
                  <p><span className="font-medium">Type:</span> {m.type}</p>
                  {m.confidence && (
                    <p><span className="font-medium">Confidence:</span> {(m.confidence * 100).toFixed(1)}%</p>
                  )}
                  {m.reportedAt && (
                    <p><span className="font-medium">Reported:</span> {new Date(m.reportedAt).toLocaleString()}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Lat: {m.position[0].toFixed(4)}, Lng: {m.position[1].toFixed(4)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
