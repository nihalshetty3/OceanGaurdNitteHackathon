import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { AlertType } from "./AlertCard";

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  title: string;
  type: AlertType;
}

export default function OceanMap({
  markers,
  center = [20.5937, 78.9629],
  zoom = 4,
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
          <Marker key={m.id} position={m.position}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{m.title}</p>
                <p className="text-muted-foreground">Type: {m.type}</p>
                <p className="mt-1">Lat: {m.position[0].toFixed(2)}, Lng: {m.position[1].toFixed(2)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
