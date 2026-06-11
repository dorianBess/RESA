import { createTheme } from '@mui/material/styles';
import type { WidgetConfig } from '../types';

export function buildWidgetTheme(config?: WidgetConfig) {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: config?.couleurPrimaire ?? '#1b4965',
      },
      secondary: {
        main: config?.couleurSecondaire ?? '#f1efe7',
      },
      text: {
        primary: '#102a43',
        secondary: '#4a5568',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
    },
    shape: {
      borderRadius: config?.borderRadius ?? 18,
    },
    typography: {
      fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 24px 70px rgba(16, 42, 67, 0.12)',
          },
        },
      },
    },
  });
}
