import { useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { LogementsPage } from './pages/LogementsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { WidgetPage } from './pages/WidgetPage';
import { getStoredSession, login, logout } from './services/auth';
import { createLogement, fetchLogements } from './services/logements';
import { fetchReservations } from './services/reservations';
import { buildWidgetEmbedCode, fetchWidgetSettings } from './services/widget';
import { backofficeTheme } from './theme/theme';
import type { Logement, NewLogement, Reservation, UserSession, WidgetSettings } from './types';

type SectionKey = 'dashboard' | 'logements' | 'reservations' | 'widget';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(getStoredSession);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [logements, setLogements] = useState<Logement[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchLogements().then(setLogements).catch(console.error);
    fetchReservations().then(setReservations).catch(console.error);
    fetchWidgetSettings().then(setWidgetSettings).catch(console.error);
  }, [session]);

  const handleLogin = async (email: string, password: string) => {
    const nextSession = await login(email, password);
    setSession(nextSession);
  };

  const handleCreateLogement = async (payload: NewLogement) => {
    const nextLogement = await createLogement(payload);
    setLogements((current) => [nextLogement, ...current]);
  };

  const content = useMemo(() => {
    if (!session) {
      return null;
    }

    switch (activeSection) {
      case 'logements':
        return <LogementsPage logements={logements} onCreate={handleCreateLogement} />;
      case 'reservations':
        return <ReservationsPage reservations={reservations} />;
      case 'widget':
        return widgetSettings ? (
          <WidgetPage
            settings={widgetSettings}
            embedCode={buildWidgetEmbedCode(widgetSettings.tokenPublic)}
          />
        ) : null;
      case 'dashboard':
      default:
        return (
          <DashboardPage
            session={session}
            logements={logements}
            reservations={reservations}
          />
        );
    }
  }, [activeSection, logements, reservations, session, widgetSettings]);

  return (
    <ThemeProvider theme={backofficeTheme}>
      <CssBaseline />
      {!session ? (
        <LoginPage onSubmit={handleLogin} />
      ) : (
        <AppShell
          activeSection={activeSection}
          onNavigate={setActiveSection}
          onLogout={() => { logout(); setSession(null); }}
          session={session}
        >
          {content}
        </AppShell>
      )}
    </ThemeProvider>
  );
}
