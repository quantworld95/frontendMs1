import { useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { Input } from '@/components/ui/Input';
import {
  LocationMapPicker,
  type MapCoordinates,
  type ResolvedMapLocation,
} from '@/components/maps/LocationMapPicker';

const cities = [
  'Santa Cruz de la Sierra',
  'La Paz',
  'Cochabamba',
  'Sucre',
  'Tarija',
  'Trinidad',
  'Oruro',
  'Potosí',
  'Cobija',
];

export default function LocationPage() {
  const { data, updateData } = useListingWizard();

  const handleCoordinatesChange = useCallback(
    (coords: MapCoordinates) => {
      updateData('latitude', coords.lat);
      updateData('longitude', coords.lng);
    },
    [updateData],
  );

  const handleLocationResolved = useCallback(
    (location: ResolvedMapLocation) => {
      updateData('latitude', location.coordinates.lat);
      updateData('longitude', location.coordinates.lng);
      if (location.address) updateData('address', location.address);
      if (location.city) updateData('city', location.city);
      if (location.neighborhood) updateData('neighborhood', location.neighborhood);
    },
    [updateData],
  );

  const handleCityChange = (city: string) => {
    updateData('city', city);
    updateData('latitude', null);
    updateData('longitude', null);
  };

  return (
    <ListingWizardLayout
      step={3}
      title="¿Dónde se encuentra tu alojamiento?"
      subtitle="Indica la ubicación para que los viajeros puedan encontrarte."
    >
      <div className="space-y-5">
        <Input
          label="Dirección"
          name="address"
          required
          value={data.address}
          onChange={(event) => updateData('address', event.target.value)}
          placeholder="Ej. Av. San Martín 1234"
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        <LocationMapPicker
          city={data.city}
          latitude={data.latitude}
          longitude={data.longitude}
          onCoordinatesChange={handleCoordinatesChange}
          onLocationResolved={handleLocationResolved}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className="label">
              País <span className="text-brand-primary">*</span>
            </label>
            <select id="country" className="input" value={data.country} disabled>
              <option>Bolivia</option>
            </select>
          </div>
          <div>
            <label htmlFor="city" className="label">
              Ciudad <span className="text-brand-primary">*</span>
            </label>
            <select
              id="city"
              className="input"
              value={data.city}
              onChange={(event) => handleCityChange(event.target.value)}
            >
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Barrio o zona"
          name="neighborhood"
          value={data.neighborhood}
          onChange={(event) => updateData('neighborhood', event.target.value)}
          placeholder="Ej. Equipetrol"
          hint="Opcional · se completa al elegir un punto en el mapa"
        />
      </div>
    </ListingWizardLayout>
  );
}
