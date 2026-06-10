import { Alert, Stack } from '@mui/material';
import { ReservationTable } from '../components/ReservationTable';
import { SectionCard } from '../components/SectionCard';
import type { Reservation } from '../types';

type ReservationsPageProps = {
  reservations: Reservation[];
};

export function ReservationsPage({ reservations }: ReservationsPageProps) {
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Le paiement n'étant pas activé, les réservations peuvent rester en attente de traitement.
      </Alert>
      <SectionCard title="Réservations du tenant">
        <ReservationTable reservations={reservations} />
      </SectionCard>
    </Stack>
  );
}
