import { Alert, Button, Grid, Stack, Typography } from '@mui/material';
import { SectionCard } from '../components/SectionCard';
import { WidgetCodeBox } from '../components/WidgetCodeBox';
import type { WidgetSettings } from '../types';

const WIDGET_BASE_URL = import.meta.env.VITE_WIDGET_URL ?? 'http://localhost:5174';

type WidgetPageProps = {
  settings: WidgetSettings;
  embedCode: string;
};

export function WidgetPage({ settings, embedCode }: WidgetPageProps) {
  const widgetUrl = `${WIDGET_BASE_URL}?token=${settings.tokenPublic}`;

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Cette vue prépare l'intégration du widget sur le site vitrine du client.
      </Alert>

      <SectionCard title="Tester le widget">
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Ouvrez cette URL pour prévisualiser le widget de réservation avec vos logements :
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'grey.100',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                wordBreak: 'break-all',
                flex: 1,
              }}
            >
              {widgetUrl}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open(widgetUrl, '_blank')}
            >
              Ouvrir
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => navigator.clipboard.writeText(widgetUrl)}
            >
              Copier
            </Button>
          </Stack>
        </Stack>
      </SectionCard>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Configuration active">
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Token public :</strong> {settings.tokenPublic}
              </Typography>
              <Typography variant="body2">
                <strong>Couleur primaire :</strong> {settings.couleurPrimaire}
              </Typography>
              <Typography variant="body2">
                <strong>Couleur secondaire :</strong> {settings.couleurSecondaire}
              </Typography>
              <Typography variant="body2">
                <strong>Couleur du texte :</strong> {settings.couleurTexte}
              </Typography>
              <Typography variant="body2">
                <strong>Rayon :</strong> {settings.borderRadius}px
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Code d'intégration">
            <WidgetCodeBox code={embedCode} />
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
