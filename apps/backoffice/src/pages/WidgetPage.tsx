import { Alert, Grid, Stack, Typography } from '@mui/material';
import { SectionCard } from '../components/SectionCard';
import { WidgetCodeBox } from '../components/WidgetCodeBox';
import type { WidgetSettings } from '../types';

type WidgetPageProps = {
  settings: WidgetSettings;
  embedCode: string;
};

export function WidgetPage({ settings, embedCode }: WidgetPageProps) {
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Cette vue prépare l'intégration du widget sur le site vitrine du client.
      </Alert>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Configuration active">
            <Stack spacing={1}>
              <Typography>Token public : {settings.tokenPublic}</Typography>
              <Typography>Couleur primaire : {settings.couleurPrimaire}</Typography>
              <Typography>Couleur secondaire : {settings.couleurSecondaire}</Typography>
              <Typography>Couleur du texte : {settings.couleurTexte}</Typography>
              <Typography>Rayon : {settings.borderRadius}px</Typography>
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
