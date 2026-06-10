import { useEffect, useMemo, useState } from 'react';
import { CssBaseline, Skeleton, Stack, ThemeProvider } from '@mui/material';
import { BookingPage } from './pages/BookingPage';
import { buildWidgetTheme } from './theme/theme';
import { fetchWidgetConfig } from './services/widget';
import { WidgetCard } from './components/WidgetCard';
import type { WidgetConfig } from './types';

function readToken(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') ?? 'demo-widget';
}

export default function App() {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const theme = useMemo(() => buildWidgetTheme(config ?? undefined), [config]);

  useEffect(() => {
    fetchWidgetConfig(readToken()).then(setConfig);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        sx={{
          minHeight: '100vh',
          p: { xs: 2, md: 4 },
          background:
            'radial-gradient(circle at top left, rgba(27,73,101,0.12), transparent 35%), linear-gradient(180deg, #f8fafc 0%, #eef4f7 100%)',
        }}
      >
        {config ? (
          <WidgetCard config={config}>
            <BookingPage config={config} />
          </WidgetCard>
        ) : (
          <Skeleton variant="rounded" height={520} />
        )}
      </Stack>
    </ThemeProvider>
  );
}
