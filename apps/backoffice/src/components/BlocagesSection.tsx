import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { SectionCard } from './SectionCard';
import { createBlocage, deleteBlocage } from '../services/logements';
import type { Blocage } from '../types';

type BlocagesSectionProps = {
  logementId: string;
  logementNom: string;
  blocages: Blocage[];
  onChange: (updated: Blocage[]) => void;
};

function formatDate(d: string) {
  return dayjs(d).locale('fr').format('DD MMM YYYY');
}

export function BlocagesSection({ logementId, logementNom, blocages, onChange }: BlocagesSectionProps) {
  const [dateDebut, setDateDebut] = useState<Dayjs | null>(null);
  const [dateFin, setDateFin] = useState<Dayjs | null>(null);
  const [motif, setMotif] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!dateDebut || !dateFin) {
      setError('Veuillez sélectionner une date de début et de fin.');
      return;
    }
    if (!dateFin.isAfter(dateDebut)) {
      setError('La date de fin doit être après la date de début.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const nouveau = await createBlocage(logementId, {
        dateDebut: dateDebut.format('YYYY-MM-DD'),
        dateFin: dateFin.format('YYYY-MM-DD'),
        motif: motif || undefined,
      });
      onChange([...blocages, nouveau]);
      setDateDebut(null);
      setDateFin(null);
      setMotif('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du blocage.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteBlocage(logementId, id);
      onChange(blocages.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <SectionCard title={`Dates bloquées — ${logementNom}`}>
        <Stack spacing={3}>
          {/* Formulaire d'ajout */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Bloquer une période
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Date de début"
                  value={dateDebut}
                  onChange={setDateDebut}
                  minDate={dayjs()}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Date de fin"
                  value={dateFin}
                  onChange={setDateFin}
                  minDate={dateDebut ? dateDebut.add(1, 'day') : dayjs().add(1, 'day')}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Motif (optionnel)"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex : travaux, usage personnel…"
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <Button
                  variant="contained"
                  onClick={handleAdd}
                  disabled={saving || !dateDebut || !dateFin}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {saving ? 'Enregistrement…' : 'Bloquer ces dates'}
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Liste des blocages existants */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Périodes bloquées ({blocages.length})
            </Typography>

            {blocages.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucune période bloquée pour ce logement.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {[...blocages]
                  .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
                  .map((blocage) => (
                    <Stack
                      key={blocage.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(blocage.dateDebut)} → {formatDate(blocage.dateFin)}
                        </Typography>
                        {blocage.motif && (
                          <Typography variant="caption" color="text.secondary">
                            {blocage.motif}
                          </Typography>
                        )}
                        {blocage.source && blocage.source !== 'MANUEL' && (
                          <Chip label={blocage.source} size="small" variant="outlined" color="info" />
                        )}
                      </Stack>

                      {(!blocage.source || blocage.source === 'MANUEL') ? (
                        <Tooltip title="Supprimer ce blocage">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(blocage.id)}
                            disabled={deleting === blocage.id}
                          >
                            {deleting === blocage.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Typography fontSize={16}>🗑</Typography>
                            )}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Chip label="Importé" size="small" color="default" />
                      )}
                    </Stack>
                  ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </SectionCard>
    </LocalizationProvider>
  );
}
