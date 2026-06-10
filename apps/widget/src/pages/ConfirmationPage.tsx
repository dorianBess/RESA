import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReservationResponse, WidgetConfig } from '../types';

type ConfirmationPageProps = {
  config: WidgetConfig;
  reference: ReservationResponse;
  onReset: () => void;
};

export function ConfirmationPage({ config, reference, onReset }: ConfirmationPageProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Réservation enregistrée</Typography>
          <Alert severity="success">
            Votre demande pour <strong>{config.logementNom}</strong> a bien été transmise.
          </Alert>
          <Typography>
            Référence : <strong>{reference.reference}</strong>
          </Typography>
          <Typography>
            Statut actuel : <strong>{reference.statut}</strong>
          </Typography>
          <Button variant="contained" onClick={onReset}>
            Faire une autre demande
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
