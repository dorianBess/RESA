import { apiPost, hasApiBaseUrl } from './api';
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  BlockedRange,
  ReservationPayload,
  ReservationResponse,
} from '../types';

const blockedRanges: BlockedRange[] = [
  { start: '2026-06-18', end: '2026-06-21' },
  { start: '2026-06-28', end: '2026-07-01' },
];

function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

export async function checkAvailability(
  payload: AvailabilityRequest,
): Promise<AvailabilityResponse> {
  if (hasApiBaseUrl()) {
    try {
      return await apiPost<AvailabilityResponse>('/reservations/check-availability', payload);
    } catch {
      // Fallback local tant que l'API n'est pas branchée.
    }
  }

  const conflict = blockedRanges.some((range) =>
    rangesOverlap(payload.dateDebut, payload.dateFin, range.start, range.end),
  );

  if (conflict) {
    return {
      disponible: false,
      motif: 'Ces dates sont déjà réservées ou bloquées.',
    };
  }

  return { disponible: true };
}

export async function fetchBlockedRanges(_logementId: string): Promise<BlockedRange[]> {
  return blockedRanges;
}

export async function createReservation(
  payload: ReservationPayload,
): Promise<ReservationResponse> {
  if (hasApiBaseUrl()) {
    try {
      return await apiPost<ReservationResponse>('/reservations', payload);
    } catch {
      // Fallback local tant que l'API n'est pas branchée.
    }
  }

  return {
    reference: `RESA-${Date.now().toString().slice(-6)}`,
    statut: 'EN_ATTENTE',
  };
}
