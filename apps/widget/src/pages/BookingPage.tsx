import { useEffect, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
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

const steps = ['Séjour', 'Coordonnées', 'Confirmation'];

function countNights(dateDebut: string, dateFin: string): number {
  if (!dateDebut || !dateFin) {
    return 0;
  }

  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  const diffMs = end.getTime() - start.getTime();

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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
    fetchBlockedRanges(config.logementId).then(setBlockedRanges);
  }, [config.logementId]);

  const dateDebutText = form.dateDebut?.format('YYYY-MM-DD') ?? '';
  const dateFinText = form.dateFin?.format('YYYY-MM-DD') ?? '';
  const nights = useMemo(() => countNights(dateDebutText, dateFinText), [dateDebutText, dateFinText]);
  const total = nights * config.tarifParNuit;

  const updateField = (field: string, value: string | number | Dayjs | null) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

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
      const result = await checkAvailability({
        logementId: config.logementId,
        dateDebut: dateDebutText,
        dateFin: dateFinText,
        nbPersonnes: form.nbPersonnes,
      });

      if (!result.disponible) {
        setMessageType('error');
        setMessage(result.motif ?? 'Le logement n’est pas disponible sur cette période.');
        return;
      }

      setMessageType('success');
      setMessage('Le logement est disponible. Vous pouvez poursuivre votre demande.');
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    if (
      !form.voyageurNom ||
      !form.voyageurPrenom ||
      !form.voyageurEmail ||
      !form.voyageurTelephone ||
      nights <= 0
    ) {
      setMessageType('error');
      setMessage('Merci de remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await createReservation({
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
      setMessageType('success');
      setMessage('Votre demande a bien été enregistrée.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {message ? <Alert severity={messageType}>{message}</Alert> : null}

      {activeStep === 2 && confirmation ? (
        <ConfirmationPage config={config} reference={confirmation} onReset={resetBooking} />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Votre séjour
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <AvailabilityCalendar
                      label="Date d'arrivée"
                      value={form.dateDebut}
                      onChange={(value) => updateField('dateDebut', value)}
                      blockedRanges={blockedRanges}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <AvailabilityCalendar
                      label="Date de départ"
                      value={form.dateFin}
                      onChange={(value) => updateField('dateFin', value)}
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
                      onChange={(event) => updateField('nbPersonnes', Number(event.target.value))}
                    >
                      {Array.from({ length: config.capacite }, (_, index) => index + 1).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Période sélectionnée"
                      value={
                        dateDebutText && dateFinText
                          ? `${dateDebutText} → ${dateFinText}`
                          : 'Aucune période sélectionnée'
                      }
                      slotProps={{ input: { readOnly: true } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {activeStep >= 1 ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Vos coordonnées
                  </Typography>
                  <GuestForm
                    values={form}
                    onChange={(field, value) => updateField(field, value)}
                  />
                </Box>
              ) : null}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <PriceSummary
                nights={nights}
                tarifParNuit={config.tarifParNuit}
                devise={config.devise}
                total={total}
              />

              <Alert severity="info">
                Paiement non activé pour le moment. La demande est enregistrée sans règlement en ligne.
              </Alert>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                {activeStep === 0 ? (
                  <Button variant="contained" onClick={handleCheckAvailability} disabled={loading}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Vérifier la disponibilité'}
                  </Button>
                ) : (
                  <>
                    <Button variant="outlined" onClick={() => setActiveStep(0)} disabled={loading}>
                      Modifier le séjour
                    </Button>
                    <Button variant="contained" onClick={handleCreateReservation} disabled={loading}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Envoyer la demande'}
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
