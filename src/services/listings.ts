import type { ListingStatus, ListingWizardData } from '@/hooks/useListingWizard';
import type { AlojamientoDetalle, AlojamientoResumen, UnidadAlojamiento } from '@/types/alojamientos';

export interface DetailUnit {
  id: string;
  name: string;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  inventory: number;
  price: string;
  status: string;
  photo?: string;
  description?: string;
}

export interface DetailPhoto {
  id: string;
  identificadorAlmacen: string;
  url: string;
  orden: number;
}

export interface DetailListing {
  id: string;
  name: string;
  type: string;
  status: ListingStatus;
  location: string;
  country: string;
  city: string;
  neighborhood: string;
  address: string;
  description: string;
  photos: string[];
  /** Metadatos completos para poder eliminar en Cloudinary vía API. */
  photoItems: DetailPhoto[];
  guests: number;
  beds: number;
  bathrooms: number;
  bedrooms: number;
  price: string;
  weeklyDiscount: string;
  monthlyDiscount: string;
  minimumStay: number;
  checkIn: string;
  checkOut: string;
  cancellation: string;
  stayConditions?: string;
  amenities: string[];
  /** Ids de `alojamiento_servicio` para reeditar el wizard. */
  servicioIds: number[];
  category: 'Casa' | 'Departamento' | 'Hotel' | 'Hostal';
  roomsLabel: string;
  ratingLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  departamento?: string | null;
  estadoApi?: string;
  politicas?: string | null;
  units?: DetailUnit[];
}

function textOrEmpty(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function mapEstadoApi(estado: string): ListingStatus {
  const value = estado.toUpperCase();
  if (value === 'PUBLICADO') return 'Publicado';
  if (value === 'ACTIVO') return 'Activo';
  if (value === 'RECHAZADO') return 'Rechazado';
  if (value === 'PAUSADO' || value === 'DESACTIVADO') return 'Pausado';
  if (value === 'SUSPENDIDO') return 'Pausado';
  if (value === 'BORRADOR') return 'Borrador';
  // EN_REVISION (y equivalentes)
  return 'En revisión';
}

function mapCategoryFromTipo(tipoPropiedad: string): DetailListing['category'] {
  const value = tipoPropiedad.toLowerCase();
  if (value.includes('departamento')) return 'Departamento';
  if (value.includes('hotel')) return 'Hotel';
  if (value.includes('hostal')) return 'Hostal';
  return 'Casa';
}

function parseCancellation(politicas: string | null | undefined): string {
  if (!politicas) return 'Moderada';
  const match = politicas.match(/cancelaci[oó]n:\s*(Flexible|Moderada|Estricta)/i);
  return match?.[1] ?? 'Moderada';
}

function mapUnit(unidad: UnidadAlojamiento): DetailUnit {
  const photo = [...(unidad.fotografias ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .map((foto) => foto.url)
    .find(Boolean);

  return {
    id: unidad.id,
    name: textOrEmpty(unidad.nombre) || 'Unidad',
    capacity: unidad.capacidadHuespedes ?? 0,
    bedrooms: unidad.cantidadDormitorios ?? 0,
    beds: unidad.cantidadCamas ?? 0,
    bathrooms: Number(unidad.cantidadBanos ?? 0),
    inventory: Math.max(1, unidad.inventarioTotal ?? 1),
    price: unidad.precioNoche != null ? String(unidad.precioNoche) : '',
    status: textOrEmpty(unidad.estado) || 'ACTIVA',
    photo,
    description: textOrEmpty(unidad.descripcion),
  };
}

export function toWizardData(listing: DetailListing): ListingWizardData {
  return {
    type: listing.category,
    tipoPropiedadId: null,
    name: listing.name,
    description: listing.description,
    country: listing.country as 'Bolivia',
    city: listing.city,
    address: listing.address,
    neighborhood: listing.neighborhood,
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
    servicioIds: [...(listing.servicioIds ?? [])],
    guests: listing.guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
    bathroomType: 'Privado',
    bedTypes: ['Cama matrimonial'],
    nightlyPrice: listing.price,
    weeklyDiscount: listing.weeklyDiscount,
    monthlyDiscount: listing.monthlyDiscount,
    minimumStay: listing.minimumStay,
    checkIn: listing.checkIn === '—' ? '15:00' : listing.checkIn,
    checkOut: listing.checkOut === '—' ? '11:00' : listing.checkOut,
    cancellation: listing.cancellation as ListingWizardData['cancellation'],
    stayConditions: listing.stayConditions ?? '',
    photos: listing.photos.map((url, index) => ({
      id: `existing-${index}`,
      name: `Fotografía ${index + 1}`,
      url,
    })),
    coverPhotoId: listing.photos.length ? 'existing-0' : '',
  };
}

/** Adapta GET /alojamientos (resumen) a la tarjeta de "Mis alojamientos". */
export function fromAlojamientoResumen(resumen: AlojamientoResumen): DetailListing {
  const category = mapCategoryFromTipo(resumen.tipoPropiedad || '');
  const city = textOrEmpty(resumen.ciudad);
  const departamento = textOrEmpty(resumen.departamento);
  const typeLabel = textOrEmpty(resumen.tipoPropiedad) || category;

  return {
    id: resumen.id,
    name: textOrEmpty(resumen.titulo) || 'Alojamiento sin nombre',
    type: typeLabel,
    status: mapEstadoApi(resumen.estado || ''),
    location: [city, departamento].filter(Boolean).join(', ') || 'Bolivia',
    country: 'Bolivia',
    city,
    neighborhood: departamento,
    address: '',
    description: '',
    photos: textOrEmpty(resumen.fotoPortada) ? [textOrEmpty(resumen.fotoPortada)] : [],
    photoItems: [],
    guests: 0,
    beds: 0,
    bathrooms: 0,
    bedrooms: 0,
    price: '',
    weeklyDiscount: '',
    monthlyDiscount: '',
    minimumStay: 1,
    checkIn: '—',
    checkOut: '—',
    cancellation: 'Moderada',
    amenities: [],
    servicioIds: [],
    category,
    roomsLabel:
      category === 'Casa' || category === 'Departamento' ? '1 unidad' : 'Establecimiento',
    ratingLabel: typeLabel,
    departamento,
    estadoApi: resumen.estado,
    units: [],
  };
}

/** Adapta GET /alojamientos/{id} a la UI de detalle. */
export function fromAlojamientoDetalle(detalle: AlojamientoDetalle): DetailListing {
  const unidad = detalle.unidades?.[0];
  const units = (detalle.unidades ?? []).map(mapUnit);
  const category = mapCategoryFromTipo(detalle.tipoPropiedad || '');
  const city = textOrEmpty(detalle.ciudad);
  const departamento = textOrEmpty(detalle.departamento);
  const photoItems: DetailPhoto[] = [...(detalle.fotografias ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .filter((foto) => !!foto.url)
    .map((foto) => ({
      id: foto.id,
      identificadorAlmacen: foto.identificadorAlmacen,
      url: foto.url,
      orden: foto.orden,
    }));
  const photos = photoItems.map((foto) => foto.url);

  const name =
    textOrEmpty(detalle.titulo) || textOrEmpty(unidad?.nombre) || 'Alojamiento sin nombre';
  const description =
    textOrEmpty(detalle.descripcion) || textOrEmpty(unidad?.descripcion);

  const typeLabel =
    category === 'Casa'
      ? 'Casa completa'
      : category === 'Departamento'
        ? 'Departamento completo'
        : textOrEmpty(detalle.tipoPropiedad) || category;

  return {
    id: detalle.id,
    name,
    type: typeLabel,
    status: mapEstadoApi(detalle.estado || ''),
    location:
      [textOrEmpty(detalle.direccion), city, departamento].filter(Boolean).join(', ') ||
      city ||
      'Bolivia',
    country: 'Bolivia',
    city,
    neighborhood: departamento,
    address: textOrEmpty(detalle.direccion),
    description,
    photos,
    photoItems,
    guests: unidad?.capacidadHuespedes ?? 0,
    beds: unidad?.cantidadCamas ?? 0,
    bathrooms: Number(unidad?.cantidadBanos ?? 0),
    bedrooms: unidad?.cantidadDormitorios ?? 0,
    price: unidad?.precioNoche != null ? String(unidad.precioNoche) : '',
    weeklyDiscount: '',
    monthlyDiscount: '',
    minimumStay: 1,
    checkIn: textOrEmpty(detalle.horarioEntrada) || '—',
    checkOut: textOrEmpty(detalle.horarioSalida) || '—',
    cancellation: parseCancellation(detalle.politicas),
    stayConditions: textOrEmpty(detalle.politicas),
    amenities: (detalle.servicios ?? []).map((servicio) => servicio.nombre),
    servicioIds: (detalle.servicios ?? []).map((servicio) => servicio.id),
    category,
    roomsLabel:
      category === 'Casa' || category === 'Departamento'
        ? '1 unidad'
        : `${units.length} habitaciones`,
    ratingLabel: typeLabel,
    latitude: detalle.latitud != null ? Number(detalle.latitud) : null,
    longitude: detalle.longitud != null ? Number(detalle.longitud) : null,
    departamento,
    estadoApi: detalle.estado,
    politicas: detalle.politicas,
    units,
  };
}
