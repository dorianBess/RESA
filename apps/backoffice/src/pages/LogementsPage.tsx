import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { LogementForm } from '../components/LogementForm';
import { SectionCard } from '../components/SectionCard';
import { BlocagesSection } from '../components/BlocagesSection';
import { fetchBlocages } from '../services/logements';
import type { Blocage, Logement, NewLogement } from '../types';

type LogementsPageProps = {
  logements: Logement[];
  onCreate: (payload: NewLogement) => Promise<void>;
};

export function LogementsPage({ logements, onCreate }: LogementsPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blocages, setBlocages] = useState<Blocage[]>([]);
  const [loadingBlocages, setLoadingBlocages] = useState(false);

  const selectedLogement = logements.find((l) => l.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    setLoadingBlocages(true);
    fetchBlocages(selectedId)
      .then(setBlocages)
      .catch(() => setBlocages([]))
      .finally(() => setLoadingBlocages(false));
  }, [selectedId]);

  const handleSelectLogement = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setBlocages([]);
  };

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Cliquez sur un logement pour gérer ses dates bloquées.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Ajouter un logement">
            <LogementForm onSubmit={onCreate} />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Mes logements">
            {logements.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucun logement pour le moment.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Ville</TableCell>
                    <TableCell>Capacité</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Tarif / nuit</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logements.map((logement) => (
                    <TableRow
                      key={logement.id}
                      selected={selectedId === logement.id}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{logement.nom}</TableCell>
                      <TableCell>{logement.ville}</TableCell>
                      <TableCell>{logement.capacite}</TableCell>
                      <TableCell>
                        <Chip
                          label={logement.statut}
                          size="small"
                          color={logement.statut === 'ACTIF' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{logement.tarifParNuit} €</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant={selectedId === logement.id ? 'contained' : 'outlined'}
                          onClick={() => handleSelectLogement(logement.id)}
                        >
                          {selectedId === logement.id ? 'Fermer' : 'Dates bloquées'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Section blocages */}
      {selectedLogement && (
        <Grid container>
          <Grid size={12}>
            {loadingBlocages ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress />
              </Stack>
            ) : (
              <BlocagesSection
                logementId={selectedLogement.id}
                logementNom={selectedLogement.nom}
                blocages={blocages}
                onChange={setBlocages}
              />
            )}
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
