import { Chip, Grid, Stack, Typography } from '@mui/material';
import type { Logement, Reservation, UserSession } from '../types';
import { SectionCard } from '../components/SectionCard';

type DashboardPageProps = {
  session: UserSession;
  logements: Logement[];
  reservations: Reservation[];
};

export function DashboardPage({ session, logements, reservations }: DashboardPageProps) {
  const attenteCount = reservations.filter((reservation) => reservation.statut === 'EN_ATTENTE').length;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Bonjour {session.tenantName}</Typography>
        <Typography color="text.secondary">
          Vue synthétique du MVP hébergeur.
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Logements actifs">
            <Typography variant="h3">{logements.length}</Typography>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Réservations">
            <Typography variant="h3">{reservations.length}</Typography>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="En attente">
            <Typography variant="h3">{attenteCount}</Typography>
          </SectionCard>
        </Grid>
      </Grid>
      <SectionCard title="Activité récente" subtitle="État rapide des demandes en cours">
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {reservations.map((reservation) => (
            <Chip
              key={reservation.id}
              label={`${reservation.voyageurNom} • ${reservation.statut}`}
              color={reservation.statut === 'CONFIRMEE' ? 'success' : 'warning'}
            />
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  );
}
