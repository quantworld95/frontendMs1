import type { ListingStatus, ListingWizardData } from '@/hooks/useListingWizard';

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
  category: 'Casa' | 'Departamento' | 'Hotel' | 'Hostal';
  roomsLabel: string;
  ratingLabel: string;
}

export const staticListings: Record<string, DetailListing> = {
  '1': {
    id: '1', name: 'Hotel Sol del Valle', type: 'Hotel', status: 'Publicado', location: 'Centro, Santa Cruz', country: 'Bolivia', city: 'Santa Cruz de la Sierra', neighborhood: 'Centro', address: 'Centro, Santa Cruz de la Sierra', description: 'Hotel céntrico con habitaciones cómodas y servicios completos para una estadía placentera.', photos: ['https://images.pexels.com/photos/34168189/pexels-photo-34168189.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], guests: 2, beds: 1, bathrooms: 1, bedrooms: 1, price: '180', weeklyDiscount: '5', monthlyDiscount: '10', minimumStay: 1, checkIn: '15:00', checkOut: '11:00', cancellation: 'Flexible', amenities: ['Wi-Fi', 'Aire acondicionado', 'TV'], category: 'Hotel', roomsLabel: '3 habitaciones', ratingLabel: '3 estrellas',
  },
  '2': {
    id: '2', name: 'Hotel Plaza', type: 'Hotel', status: 'Pausado', location: 'Equipetrol, Santa Cruz', country: 'Bolivia', city: 'Santa Cruz de la Sierra', neighborhood: 'Equipetrol', address: 'Equipetrol, Santa Cruz de la Sierra', description: 'Hotel moderno en Equipetrol con amplias instalaciones y atención de primera.', photos: ['https://images.pexels.com/photos/7031731/pexels-photo-7031731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], guests: 3, beds: 2, bathrooms: 1, bedrooms: 1, price: '220', weeklyDiscount: '8', monthlyDiscount: '12', minimumStay: 1, checkIn: '15:00', checkOut: '11:00', cancellation: 'Moderada', amenities: ['Wi-Fi', 'Aire acondicionado', 'Estacionamiento', 'TV'], category: 'Hotel', roomsLabel: '5 habitaciones', ratingLabel: '4 estrellas',
  },
  '3': {
    id: '3', name: 'Casa moderna', type: 'Casa completa', status: 'Pendiente', location: 'Urbarí, Santa Cruz', country: 'Bolivia', city: 'Santa Cruz de la Sierra', neighborhood: 'Urbarí', address: 'Urbarí, Santa Cruz de la Sierra', description: 'Una casa amplia y luminosa, ideal para familias y grupos que buscan comodidad en Santa Cruz.', photos: ['https://images.pexels.com/photos/7746082/pexels-photo-7746082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], guests: 4, beds: 3, bathrooms: 2, bedrooms: 2, price: '350', weeklyDiscount: '10', monthlyDiscount: '20', minimumStay: 2, checkIn: '15:00', checkOut: '11:00', cancellation: 'Moderada', amenities: ['Wi-Fi', 'Cocina equipada', 'Estacionamiento', 'TV'], category: 'Casa', roomsLabel: '1 unidad', ratingLabel: 'Casa completa',
  },
  '4': {
    id: '4', name: 'Departamento céntrico', type: 'Departamento completo', status: 'Rechazado', location: 'Sopocachi, La Paz', country: 'Bolivia', city: 'La Paz', neighborhood: 'Sopocachi', address: 'Sopocachi, La Paz', description: 'Departamento céntrico con espacios cómodos y todo lo necesario para una estadía práctica.', photos: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], guests: 2, beds: 1, bathrooms: 1, bedrooms: 1, price: '250', weeklyDiscount: '5', monthlyDiscount: '15', minimumStay: 1, checkIn: '15:00', checkOut: '11:00', cancellation: 'Flexible', amenities: ['Wi-Fi', 'Aire acondicionado', 'TV'], category: 'Departamento', roomsLabel: '1 unidad', ratingLabel: 'Departamento',
  },
};

export function toWizardData(listing: DetailListing): ListingWizardData {
  return {
    type: listing.category, name: listing.name, description: listing.description, country: listing.country as 'Bolivia', city: listing.city, address: listing.address, neighborhood: listing.neighborhood, amenities: [...listing.amenities], guests: listing.guests, bedrooms: listing.bedrooms, beds: listing.beds, bathrooms: listing.bathrooms, bathroomType: 'Privado', bedTypes: ['Cama matrimonial'], nightlyPrice: listing.price, weeklyDiscount: listing.weeklyDiscount, monthlyDiscount: listing.monthlyDiscount, minimumStay: listing.minimumStay, checkIn: listing.checkIn, checkOut: listing.checkOut, cancellation: listing.cancellation as ListingWizardData['cancellation'], stayConditions: listing.stayConditions ?? '', photos: listing.photos.map((url, index) => ({ id: `existing-${index}`, name: `Fotografía ${index + 1}`, url })), coverPhotoId: 'existing-0',
  };
}

export function fromWizard(data: ListingWizardData, id: string, category: DetailListing['category']): DetailListing {
  const cover = data.photos.find((photo) => photo.id === data.coverPhotoId) || data.photos[0];
  const typeLabel = category === 'Casa' ? 'Casa completa' : category === 'Departamento' ? 'Departamento completo' : category;
  return {
    id, name: data.name || 'Alojamiento sin nombre', type: typeLabel, status: 'Pendiente', location: data.neighborhood ? `${data.neighborhood}, ${data.city}` : data.city, country: data.country, city: data.city, neighborhood: data.neighborhood, address: data.address, description: data.description, photos: cover ? [cover.url, ...data.photos.filter((photo) => photo.id !== cover.id).map((photo) => photo.url)] : [], guests: data.guests, beds: data.beds, bathrooms: data.bathrooms, bedrooms: data.bedrooms, price: data.nightlyPrice, weeklyDiscount: data.weeklyDiscount, monthlyDiscount: data.monthlyDiscount, stayConditions: data.stayConditions, minimumStay: data.minimumStay, checkIn: data.checkIn, checkOut: data.checkOut, cancellation: data.cancellation, amenities: data.amenities, category, roomsLabel: category === 'Casa' || category === 'Departamento' ? '1 unidad' : '1 habitación', ratingLabel: typeLabel,
  };
}

export function getListingById(id: string, savedListing?: { id: string; data: ListingWizardData } | null): DetailListing | undefined {
  if (savedListing && id === savedListing.id) {
    const base = staticListings[id];
    const savedCategory = savedListing.data.type || 'Casa';
    return fromWizard(savedListing.data, id, base?.category ?? savedCategory);
  }
  return staticListings[id];
}
