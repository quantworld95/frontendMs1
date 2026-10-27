export interface RoomType {
  id: string;
  name: string;
  units: number;
  capacity: number;
  beds: string;
  bathrooms: number;
  price: string;
  status: 'Activa' | 'Pausada';
  photo?: string;
  description?: string;
  services?: string[];
}

const storageKey = 'host-room-types';

const seededRooms: Record<string, RoomType[]> = {
  '1': [
    { id: 'standard', name: 'Habitación Estándar', units: 10, capacity: 2, beds: '1 cama matrimonial', bathrooms: 1, price: '250', status: 'Activa' },
    { id: 'double', name: 'Habitación Doble', units: 5, capacity: 4, beds: '2 camas individuales', bathrooms: 1, price: '320', status: 'Activa' },
    { id: 'family', name: 'Suite Familiar', units: 3, capacity: 5, beds: '1 cama matrimonial y 2 individuales', bathrooms: 2, price: '420', status: 'Activa' },
    { id: 'shared', name: 'Dormitorio Compartido', units: 2, capacity: 6, beds: '3 literas', bathrooms: 2, price: '90', status: 'Activa' },
  ],
};

function readStoredRooms(): Record<string, RoomType[]> {
  const value = window.localStorage.getItem(storageKey);
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, RoomType[]> : {};
  } catch {
    return {};
  }
}

export function getRoomTypes(listingId: string): RoomType[] {
  const stored = readStoredRooms();
  return stored[listingId] ?? seededRooms[listingId] ?? [];
}

export function saveRoomType(listingId: string, room: RoomType): void {
  const stored = readStoredRooms();
  const current = stored[listingId] ?? seededRooms[listingId] ?? [];
  stored[listingId] = [...current.filter((item) => item.id !== room.id), room];
  window.localStorage.setItem(storageKey, JSON.stringify(stored));
}

export function deleteRoomType(listingId: string, roomId: string): void {
  const stored = readStoredRooms();
  const current = stored[listingId] ?? seededRooms[listingId] ?? [];
  stored[listingId] = current.filter((room) => room.id !== roomId);
  window.localStorage.setItem(storageKey, JSON.stringify(stored));
}
