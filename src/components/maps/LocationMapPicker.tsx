import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface ResolvedMapLocation {
  coordinates: MapCoordinates;
  address: string;
  city?: string;
  neighborhood?: string;
}

const CITY_CENTERS: Record<string, MapCoordinates> = {
  'Santa Cruz de la Sierra': { lat: -17.7833, lng: -63.1821 },
  'La Paz': { lat: -16.5, lng: -68.15 },
  Cochabamba: { lat: -17.3895, lng: -66.1568 },
  Sucre: { lat: -19.0333, lng: -65.2627 },
  Tarija: { lat: -21.5355, lng: -64.7296 },
  Trinidad: { lat: -14.8333, lng: -64.9 },
  Oruro: { lat: -17.9833, lng: -67.15 },
  Potosí: { lat: -19.5836, lng: -65.7531 },
  Cobija: { lat: -11.0267, lng: -68.7692 },
};

const KNOWN_CITIES = Object.keys(CITY_CENTERS);
const DEFAULT_CENTER = CITY_CENTERS['Santa Cruz de la Sierra'];
const MAP_LIBRARIES: ('places')[] = ['places'];

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

interface LocationMapPickerProps {
  city: string;
  latitude: number | null;
  longitude: number | null;
  onCoordinatesChange: (coords: MapCoordinates) => void;
  /** Se dispara al elegir un punto en el mapa (click/drag) tras reverse geocode. */
  onLocationResolved?: (location: ResolvedMapLocation) => void;
}

export function getCityCenter(city: string): MapCoordinates {
  return CITY_CENTERS[city] ?? DEFAULT_CENTER;
}

function component(
  result: google.maps.GeocoderResult,
  type: string,
): string | undefined {
  return result.address_components.find((item) => item.types.includes(type))?.long_name;
}

function matchKnownCity(result: google.maps.GeocoderResult): string | undefined {
  const candidates = [
    component(result, 'locality'),
    component(result, 'administrative_area_level_2'),
    component(result, 'administrative_area_level_1'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const found = KNOWN_CITIES.find(
      (city) =>
        city.toLowerCase() === candidate.toLowerCase() ||
        city.toLowerCase().includes(candidate.toLowerCase()) ||
        candidate.toLowerCase().includes(city.toLowerCase()),
    );
    if (found) return found;
  }
  return undefined;
}

function buildStreetAddress(result: google.maps.GeocoderResult): string {
  const route = component(result, 'route');
  const number = component(result, 'street_number');
  if (route && number) return `${route} ${number}`;
  if (route) return route;

  const neighborhood =
    component(result, 'neighborhood') ||
    component(result, 'sublocality') ||
    component(result, 'sublocality_level_1');
  if (neighborhood) return neighborhood;

  // Quita país / Bolivia del formatted_address para un campo más usable
  return result.formatted_address
    .replace(/,\s*Bolivia$/i, '')
    .replace(/,\s*BO$/i, '')
    .trim();
}

function parseGeocoderResult(
  result: google.maps.GeocoderResult,
  coordinates: MapCoordinates,
): ResolvedMapLocation {
  return {
    coordinates,
    address: buildStreetAddress(result),
    city: matchKnownCity(result),
    neighborhood:
      component(result, 'neighborhood') ||
      component(result, 'sublocality') ||
      component(result, 'sublocality_level_1'),
  };
}

export function LocationMapPicker({
  city,
  latitude,
  longitude,
  onCoordinatesChange,
  onLocationResolved,
}: LocationMapPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
  const mapsEnabled = apiKey.length > 0;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'aloja-te-google-maps',
    googleMapsApiKey: mapsEnabled ? apiKey : 'disabled',
    libraries: MAP_LIBRARIES,
  });

  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [resolvingPlace, setResolvingPlace] = useState(false);

  const position = useMemo<MapCoordinates>(() => {
    if (latitude != null && longitude != null) return { lat: latitude, lng: longitude };
    return getCityCenter(city);
  }, [city, latitude, longitude]);

  useEffect(() => {
    if (latitude == null || longitude == null) {
      onCoordinatesChange(getCityCenter(city));
    }
    // Solo al montar / cambiar ciudad sin coords previas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const reverseGeocode = useCallback(
    async (coords: MapCoordinates) => {
      if (!window.google?.maps) {
        onCoordinatesChange(coords);
        return;
      }

      setResolvingPlace(true);
      setGeocodeError(null);
      onCoordinatesChange(coords);

      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({
          location: coords,
          language: 'es',
        });
        const first = response.results[0];
        if (!first) {
          setGeocodeError('No encontramos un nombre para este punto. Escribe la dirección a mano.');
          return;
        }
        onLocationResolved?.(parseGeocoderResult(first, coords));
      } catch {
        setGeocodeError('No se pudo obtener la dirección de este punto.');
      } finally {
        setResolvingPlace(false);
      }
    },
    [onCoordinatesChange, onLocationResolved],
  );

  const handleMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      void reverseGeocode({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    },
    [reverseGeocode],
  );

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      void reverseGeocode({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    },
    [reverseGeocode],
  );

  if (!mapsEnabled) {
    return (
      <div className="relative flex h-56 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 text-center">
        <MapPin className="h-8 w-8 text-amber-600" />
        <p className="text-sm font-semibold text-ink-primary">Mapa no configurado</p>
        <p className="max-w-sm text-xs text-ink-secondary">
          Agrega <code className="rounded bg-white px-1">VITE_GOOGLE_MAPS_API_KEY</code> en{' '}
          <code className="rounded bg-white px-1">.env</code> (Maps JavaScript API + Geocoding) y
          reinicia el servidor.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-center text-sm text-red-700">
        No se pudo cargar Google Maps. Revisa la API key y que Maps JavaScript API esté habilitada.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-line bg-surface-secondary text-sm text-ink-secondary">
        Cargando mapa…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="relative h-56 w-full sm:h-64">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={position}
            zoom={15}
            options={mapOptions}
            onClick={handleMapClick}
          >
            <Marker position={position} draggable onDragEnd={handleMarkerDragEnd} />
          </GoogleMap>
          {resolvingPlace && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
              <span className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-primary shadow-sm">
                Obteniendo dirección…
              </span>
            </div>
          )}
        </div>
      </div>

      {geocodeError ? (
        <p className="text-xs font-medium text-amber-700" role="status">
          {geocodeError}
        </p>
      ) : null}
    </div>
  );
}

export default LocationMapPicker;
