import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

type LoginPageProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function LoginPage({ onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState('demo@resa.fr');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      await onSubmit(email, password);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Connexion impossible.',
      );
    }
  };

  return (
    <Stack
      sx={{
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background:
          'radial-gradient(circle at top left, rgba(18,52,77,0.18), transparent 35%), linear-gradient(180deg, #f3f6f8 0%, #e6eef2 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h4">Backoffice RESA</Typography>
              <Typography color="text.secondary">
                Connexion hébergeur pour gérer logements, réservations et widget.
              </Typography>
            </Stack>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button variant="contained" onClick={handleSubmit}>
              Se connecter
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
