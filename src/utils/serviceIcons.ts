import {
  Car,
  Coffee,
  ConciergeBell,
  Fan,
  ForkKnife,
  type LucideIcon,
  Microwave,
  PawPrint,
  Sparkles,
  WashingMachine,
  Waves,
  Wifi,
} from 'lucide-react';

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '');
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  estacionamiento: Car,
  cocina: Microwave,
  piscina: Waves,
  desayuno: Coffee,
  aireacondicionado: Fan,
  admitemascotas: PawPrint,
  lavanderia: WashingMachine,
  recepcion: ConciergeBell,
  restaurante: ForkKnife,
};

/** Icono UI a partir del nombre del catálogo GET /catalogos-alojamiento. */
export function iconForService(nombre: string): LucideIcon {
  return SERVICE_ICONS[normalizeLabel(nombre)] ?? Sparkles;
}
