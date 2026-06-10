import { Alert, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { LogementForm } from '../components/LogementForm';
import { SectionCard } from '../components/SectionCard';
import type { Logement, NewLogement } from '../types';

type LogementsPageProps = {
  logements: Logement[];
  onCreate: (payload: NewLogement) => Promise<void>;
};

export function LogementsPage({ logements, onCreate }: LogementsPageProps) {
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        MVP centré sur la création de logement, le tarif de base et la consultation rapide.
      </Alert>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Ajouter un logement">
            <LogementForm onSubmit={onCreate} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Liste des logements">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell>Capacité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Tarif / nuit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logements.map((logement) => (
                  <TableRow key={logement.id}>
                    <TableCell>{logement.nom}</TableCell>
                    <TableCell>{logement.ville}</TableCell>
                    <TableCell>{logement.capacite}</TableCell>
                    <TableCell>{logement.statut}</TableCell>
                    <TableCell>{logement.tarifParNuit} EUR</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
