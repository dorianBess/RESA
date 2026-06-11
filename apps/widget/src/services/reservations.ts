import { apiGet, apiPost } from './api';
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  BlockedRange,
  ReservationPayload,
  ReservationResponse,
} from '../types';

export async function checkAvailability(
  token: string,
  payload: AvailabilityRequest,
): Promise<AvailabilityResponse> {
  return apiGet<AvailabilityResponse>(
    `/widget/${token}/disponibilites?logementId=${payload.logementId}&dateDebut=${payload.dateDebut}&dateFin=${payload.dateFin}`,
  );
}

export async function fetchBlockedRanges(
  token: string,
  logementId: string,
): Promise<BlockedRange[]> {
  return apiGet<BlockedRange[]>(`/widget/${token}/blocages?logementId=${logementId}`);
}

export async function createReservation(
  token: string,
  payload: ReservationPayload,
): Promise<ReservationResponse> {
  return apiPost<ReservationResponse>(`/widget/${token}/reservations`, payload);
}
