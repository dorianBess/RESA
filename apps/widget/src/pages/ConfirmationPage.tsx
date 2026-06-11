import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import type { ReservationResponse, WidgetConfig } from '../types';

type ConfirmationPageProps = {
  config: WidgetConfig;
  reference: ReservationResponse;
  onReset: () => void;
};

export function ConfirmationPage({ config, reference, onReset }: ConfirmationPageProps) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header vert */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          px: { xs: 3, md: 4 },
          py: { xs: 3, md: 4 },
          textAlign: 'center',
        }}
      >
        <Typography fontSize={56} lineHeight={1} mb={1.5}>
          🎉
        </Typography>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Demande enregistrée !
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 400, mx: 'auto' }}>
          Votre demande pour <strong>{config.logementNom}</strong> a bien été transmise.
          L'hébergeur vous contactera pour confirmer.
        </Typography>
      </Box>

      {/* Détails */}
      <Stack spacing={0} divider={<Divider />} sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.5}>
          <Typography variant="body2" color="text.secondary">Référence</Typography>
          <Chip
            label={reference.reference}
            size="small"
            sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.5}>
          <Typography variant="body2" color="text.secondary">Statut</Typography>
          <Chip
            label={reference.statut}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.5}>
          <Typography variant="body2" color="text.secondary">Logement</Typography>
          <Typography variant="body2" fontWeight={600}>{config.logementNom}</Typography>
        </Stack>
      </Stack>

      <Box sx={{ px: { xs: 3, md: 4 }, pb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onReset}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Faire une autre demande
        </Button>
      </Box>
    </Box>
  );
}
