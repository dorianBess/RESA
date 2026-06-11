import { createTheme } from '@mui/material/styles';

export const backofficeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#12344d',
    },
    secondary: {
      main: '#d77a61',
    },
    background: {
      default: '#f3f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
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
  shape: {
    borderRadius: 18,
  },
});
