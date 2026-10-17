import { HOJE } from '../mock/mock-data';
import { Trip } from '../models';

export type TripStatus = 'futura' | 'em-andamento' | 'realizada';

const DIA = 24 * 60 * 60 * 1000;

export function toDate(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function tripStatus(trip: Trip, hoje = HOJE): TripStatus {
  if (toDate(trip.dataVolta) < hoje) return 'realizada';
  if (toDate(trip.dataIda) <= hoje) return 'em-andamento';
  return 'futura';
}

export function daysUntil(iso: string, hoje = HOJE): number {
  return Math.round((toDate(iso).getTime() - hoje.getTime()) / DIA);
}

export function tripDuration(trip: Trip): number {
  return Math.round((toDate(trip.dataVolta).getTime() - toDate(trip.dataIda).getTime()) / DIA) + 1;
}

export const STATUS_LABEL: Record<TripStatus, string> = {
  futura: 'Futura',
  'em-andamento': 'Em andamento',
  realizada: 'Realizada',
};

export const STATUS_CLASS: Record<TripStatus, string> = {
  futura: 'bg-brand-50 text-brand-700',
  'em-andamento': 'bg-emerald-50 text-emerald-700',
  realizada: 'bg-slate-100 text-slate-600',
};
