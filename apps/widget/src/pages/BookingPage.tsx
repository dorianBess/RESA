import { useEffect, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { GuestForm } from '../components/GuestForm';
import { PriceSummary } from '../components/PriceSummary';
import {
  checkAvailability,
  createReservation,
  fetchBlockedRanges,
} from '../services/reservations';
import type { BlockedRange, ReservationResponse, WidgetConfig } from '../types';
import { ConfirmationPage } from './ConfirmationPage';

type BookingPageProps = {
  config: WidgetConfig;
};

const steps = ['Votre séjour', 'Coordonnées', 'Confirmation'];

function countNights(dateDebut: string, dateFin: string): number {
  if (!dateDebut || !dateFin) return 0;
  const diffMs = new Date(dateFin).getTime() - new Date(dateDebut).getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Typography fontSize={18}>{emoji}</Typography>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5, lineHeight: 1.3 }}
      >
        {title}
      </Typography>
    </Stack>
  );
}

export function BookingPage({ config }: BookingPageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('info');
  const [confirmation, setConfirmation] = useState<ReservationResponse | null>(null);
  const [form, setForm] = useState({
    dateDebut: null as Dayjs | null,
    dateFin: null as Dayjs | null,
    nbPersonnes: 1,
    voyageurNom: '',
    voyageurPrenom: '',
    voyageurEmail: '',
    voyageurTelephone: '',
    notes: '',
  });

  useEffect(() => {
    fetchBlockedRanges(config.token, config.logementId)
      .then(setBlockedRanges)
      .catch(() => setBlockedRanges([]));
  }, [config.token, config.logementId]);

  const dateDebutText = form.dateDebut?.format('YYYY-MM-DD') ?? '';
  const dateFinText = form.dateFin?.format('YYYY-MM-DD') ?? '';
  const nights = useMemo(() => countNights(dateDebutText, dateFinText), [dateDebutText, dateFinText]);
  const total = nights * config.tarifParNuit;

  const updateField = (field: string, value: string | number | Dayjs | null) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const resetBooking = () => {
    setActiveStep(0);
    setConfirmation(null);
    setMessage(null);
    setForm({
      dateDebut: null,
      dateFin: null,
      nbPersonnes: 1,
      voyageurNom: '',
      voyageurPrenom: '',
      voyageurEmail: '',
      voyageurTelephone: '',
      notes: '',
    });
  };

  const handleCheckAvailability = async () => {
    if (!dateDebutText || !dateFinText || nights <= 0) {
      setMessageType('error');
      setMessage('Merci de sélectionner des dates valides.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await checkAvailability(config.token, {
        logementId: config.logementId,
        dateDebut: dateDebutText,
        dateFin: dateFinText,
        nbPersonnes: form.nbPersonnes,
      });
      if (!result.disponible) {
        setMessageType('error');
        setMessage(result.motif ?? "Le logement n'est pas disponible sur cette période.");
        return;
      }
      setMessageType('success');
      setMessage('Le logement est disponible !');
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!form.voyageurNom || !form.voyageurPrenom || !form.voyageurEmail || nights <= 0) {
      setMessageType('error');
      setMessage('Merci de remplir les champs obligatoires (nom, prénom, email).');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await createReservation(config.token, {
        logementId: config.logementId,
        dateDebut: dateDebutText,
        dateFin: dateFinText,
        nbPersonnes: form.nbPersonnes,
        voyageurNom: form.voyageurNom,
        voyageurPrenom: form.voyageurPrenom,
        voyageurEmail: form.voyageurEmail,
        voyageurTelephone: form.voyageurTelephone,
        notes: form.notes,
        montantTotal: total,
      });
      setConfirmation(result);
      setActiveStep(2);
    } catch (err) {
      setMessageType('error');
      setMessage(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step} completed={activeStep > index}>
            <StepLabel
              sx={{ '& .MuiStepLabel-label': { fontWeight: activeStep === index ? 700 : 400 } }}
            >
              {step}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider />

      {message && (
        <Alert severity={messageType} sx={{ borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      {activeStep === 2 && confirmation ? (
        <ConfirmationPage config={config} reference={confirmation} onReset={resetBooking} />
      ) : (
        <Grid container spacing={3}>
          {/* Colonne gauche : formulaire */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* Dates + voyageurs */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                <SectionHeader emoji="📅" title="Votre séjour" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <AvailabilityCalendar
                      label="Date d'arrivée"
                      value={form.dateDebut}
                      onChange={(v) => updateField('dateDebut', v)}
                      blockedRanges={blockedRanges}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <AvailabilityCalendar
                      label="Date de départ"
                      value={form.dateFin}
                      onChange={(v) => updateField('dateFin', v)}
                      blockedRanges={blockedRanges}
                      minDate={form.dateDebut ?? dayjs()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Voyageurs"
                      value={form.nbPersonnes}
                      onChange={(e) => updateField('nbPersonnes', Number(e.target.value))}
                    >
                      {Array.from({ length: config.capacite }, (_, i) => i + 1).map((v) => (
                        <MenuItem key={v} value={v}>
                          {v} voyageur{v > 1 ? 's' : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        minHeight: 56,
                      }}
                    >
                      {dateDebutText && dateFinText ? (
                        <>
                          <Chip
                            label={form.dateDebut?.format('D MMM')}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            →
                          </Typography>
                          <Chip
                            label={form.dateFin?.format('D MMM')}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          {nights > 0 && (
                            <Chip
                              label={`${nights} nuit${nights > 1 ? 's' : ''}`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          Sélectionnez vos dates
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Coordonnées (étape 2) */}
              {activeStep >= 1 && (
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <SectionHeader emoji="👤" title="Vos coordonnées" />
                  <GuestForm values={form} onChange={updateField} />
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Colonne droite : récap + actions */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
              <PriceSummary
                nights={nights}
                tarifParNuit={config.tarifParNuit}
                devise={config.devise}
                total={total}
              />

              <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                Paiement non activé — la demande est enregistrée sans règlement en ligne.
              </Alert>

              <Stack spacing={1.5}>
                {activeStep === 0 ? (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleCheckAvailability}
                    disabled={loading || !dateDebutText || !dateFinText}
                    sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Vérifier la disponibilité'
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setActiveStep(0)}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      ← Modifier le séjour
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleCreateReservation}
                      disabled={loading}
                      sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                    >
                      {loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        'Envoyer la demande'
                      )}
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
