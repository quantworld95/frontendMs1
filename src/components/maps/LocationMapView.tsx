import { useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { getCityCenter } from '@/components/maps/LocationMapPicker';

const MAP_LIBRARIES: ('places')[] = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

interface LocationMapViewProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  city?: string;
  label?: string;
  className?: string;
}

function toCoord(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value);
}

export function LocationMapView({
  latitude,
  longitude,
  city = '',
  label,
  className = '',
}: LocationMapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
  const mapsEnabled = apiKey.length > 0;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'aloja-te-google-maps',
    googleMapsApiKey: mapsEnabled ? apiKey : 'disabled',
    libraries: MAP_LIBRARIES,
  });

  const lat = toCoord(latitude);
  const lng = toCoord(longitude);
  const hasMarker = lat != null && lng != null;

  const center = useMemo(
    () => (hasMarker ? { lat: lat!, lng: lng! } : getCityCenter(city)),
    [city, hasMarker, lat, lng],
  );

  if (!mapsEnabled) {
    return (
      <div
        className={`flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-center ${className}`}
      >
        <MapPin className="h-8 w-8 text-amber-600" />
        <p className="text-sm font-semibold text-ink-primary">Mapa no configurado</p>
        <p className="text-xs text-ink-secondary">
          Agrega <code className="rounded bg-white px-1">VITE_GOOGLE_MAPS_API_KEY</code> en{' '}
          <code className="rounded bg-white px-1">.env</code>.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`flex min-h-[260px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-center text-sm text-rose-800 ${className}`}
      >
        No se pudo cargar Google Maps. Revisa la API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex min-h-[260px] items-center justify-center rounded-xl border border-line bg-surface-secondary text-sm text-ink-secondary ${className}`}
      >
        Cargando mapa…
      </div>
    );
  }

  return (
    <div
      className={`relative h-[280px] min-h-[260px] overflow-hidden rounded-xl border border-line sm:h-[320px] lg:h-full lg:min-h-[320px] ${className}`}
      aria-label={label ? `Mapa de ${label}` : 'Mapa de ubicación'}
    >
      <div className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={hasMarker ? 15 : 12}
          options={mapOptions}
        >
          {hasMarker ? <Marker position={{ lat: lat!, lng: lng! }} /> : null}
        </GoogleMap>
      </div>

      {!hasMarker ? (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-ink-secondary shadow-sm">
          Este alojamiento aún no tiene coordenadas guardadas.
        </div>
      ) : null}
    </div>
  );
}

export default LocationMapView;
