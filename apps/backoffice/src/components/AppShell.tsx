import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type { PropsWithChildren } from 'react';
import type { UserSession } from '../types';

type SectionKey = 'dashboard' | 'logements' | 'reservations' | 'widget';

type AppShellProps = PropsWithChildren<{
  activeSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
  onLogout: () => void;
  session: UserSession;
}>;

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'logements', label: 'Logements' },
  { key: 'reservations', label: 'Réservations' },
  { key: 'widget', label: 'Widget' },
];

export function AppShell({
  activeSection,
  onNavigate,
  onLogout,
  session,
  children,
}: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h6">RESA Backoffice</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {session.tenantName}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            {sections.map((section) => (
              <Button
                key={section.key}
                color="inherit"
                variant={activeSection === section.key ? 'outlined' : 'text'}
                onClick={() => onNavigate(section.key)}
              >
                {section.label}
              </Button>
            ))}
            <Button color="inherit" onClick={onLogout}>
              Déconnexion
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>{children}</Paper>
      </Container>
    </Box>
  );
}
