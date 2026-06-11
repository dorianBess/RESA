import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, CssBaseline, Skeleton, Stack, ThemeProvider, Typography } from '@mui/material';
import { BookingPage } from './pages/BookingPage';
import { LogementSelectionPage } from './pages/LogementSelectionPage';
import { buildWidgetTheme } from './theme/theme';
import { fetchWidgetConfig, fetchLogements } from './services/widget';
import { WidgetCard } from './components/WidgetCard';
import type { LogementItem, WidgetConfig } from './types';

function readToken(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') ?? 'demo-widget';
}

export default function App() {
  const token = useMemo(() => readToken(), []);

  const [baseConfig, setBaseConfig] = useState<WidgetConfig | null>(null);
  const [logements, setLogements] = useState<LogementItem[]>([]);
  const [loadingLogements, setLoadingLogements] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [selectedLogement, setSelectedLogement] = useState<LogementItem | null>(null);

  const theme = useMemo(() => buildWidgetTheme(baseConfig ?? undefined), [baseConfig]);

  useEffect(() => {
    fetchWidgetConfig(token).then(setBaseConfig).catch(() => setTokenInvalid(true));
    fetchLogements(token)
      .then(setLogements)
      .catch(() => setTokenInvalid(true))
      .finally(() => setLoadingLogements(false));
  }, [token]);

  const fullConfig: WidgetConfig | null = useMemo(() => {
    if (!baseConfig || !selectedLogement) return null;
    return {
      ...baseConfig,
      logementId: selectedLogement.id,
      logementNom: selectedLogement.nom,
      description: selectedLogement.description,
      capacite: selectedLogement.capacite,
      ville: selectedLogement.ville,
      tarifParNuit: selectedLogement.tarifParNuit,
      devise: selectedLogement.devise,
    };
  }, [baseConfig, selectedLogement]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          p: { xs: 2, md: 4 },
          color: '#102a43',
          background:
            'radial-gradient(ellipse at top left, rgba(27,73,101,0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(27,73,101,0.06) 0%, transparent 50%), linear-gradient(180deg, #f0f4f8 0%, #e8eff5 100%)',
        }}
      >
        {tokenInvalid ? (
          <Box sx={{ maxWidth: 440, mx: 'auto', textAlign: 'center', py: 10 }}>
            <Typography fontSize={52} mb={2}>😕</Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>Widget introuvable</Typography>
            <Typography variant="body2" color="text.secondary">
              Le token <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{token}</code> ne correspond à aucun hébergeur.
              Copiez le lien depuis le backoffice (section Widget).
            </Typography>
          </Box>
        ) : !baseConfig ? (
          <Box sx={{ maxWidth: 960, mx: 'auto' }}>
            <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={320} />
          </Box>
        ) : fullConfig ? (
          <Stack spacing={0} sx={{ maxWidth: 960, mx: 'auto' }}>
            <Button
              size="small"
              onClick={() => setSelectedLogement(null)}
              sx={{
                alignSelf: 'flex-start',
                mb: 1.5,
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { color: 'primary.main' },
              }}
            >
              ← Changer de logement
            </Button>
            <WidgetCard config={fullConfig}>
              <BookingPage config={fullConfig} />
            </WidgetCard>
          </Stack>
        ) : (
          <Box sx={{ maxWidth: 960, mx: 'auto' }}>
            <Card sx={{ mb: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  px: { xs: 3, md: 4 },
                  py: { xs: 2.5, md: 3 },
                  background: (t) =>
                    `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.main}99 100%)`,
                  color: 'common.white',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography fontSize={28}>🏨</Typography>
                  <Stack>
                    <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 2, fontSize: '0.7rem' }}>
                      Réservation en ligne
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      Nos logements
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <LogementSelectionPage
                  logements={logements}
                  loading={loadingLogements}
                  onSelect={setSelectedLogement}
                />
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
