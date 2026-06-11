import {
  Box,
  Card,
  CardActionArea,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import type { LogementItem } from '../types';

type LogementSelectionPageProps = {
  logements: LogementItem[];
  loading: boolean;
  onSelect: (logement: LogementItem) => void;
};

function LogementCard({ logement, onSelect }: { logement: LogementItem; onSelect: (l: LogementItem) => void }) {
  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 48px rgba(16,42,67,0.18)',
        },
      }}
    >
      <CardActionArea
        onClick={() => onSelect(logement)}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* Bandeau coloré + icône */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main}cc 100%)`,
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Typography fontSize={36}>🏡</Typography>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.95)',
              color: 'primary.main',
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              textAlign: 'right',
            }}
          >
            {logement.tarifParNuit > 0 ? (
              <>
                <Typography variant="h6" fontWeight={800} lineHeight={1}>
                  {logement.tarifParNuit}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {logement.devise} / nuit
                </Typography>
              </>
            ) : (
              <Typography variant="caption" fontWeight={600}>
                Sur demande
              </Typography>
            )}
          </Box>
        </Box>

        {/* Contenu */}
        <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
            {logement.nom}
          </Typography>

          {logement.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {logement.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography fontSize={14}>👥</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {logement.capacite} voyageur{logement.capacite > 1 ? 's' : ''} max
              </Typography>
            </Stack>
            {logement.ville && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography fontSize={14}>📍</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {logement.ville}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Footer CTA */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" fontWeight={700} color="primary">
            Réserver ce logement
          </Typography>
          <Typography color="primary">→</Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export function LogementSelectionPage({ logements, loading, onSelect }: LogementSelectionPageProps) {
  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Chargement des logements…
        </Typography>
      </Stack>
    );
  }

  if (logements.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8} spacing={1}>
        <Typography fontSize={48}>🔍</Typography>
        <Typography variant="h6">Aucun logement disponible</Typography>
        <Typography variant="body2" color="text.secondary">
          Revenez plus tard ou contactez l'hébergeur.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          Choisissez votre logement
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {logements.length} logement{logements.length > 1 ? 's' : ''} disponible{logements.length > 1 ? 's' : ''}
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        {logements.map((logement) => (
          <Grid key={logement.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <LogementCard logement={logement} onSelect={onSelect} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
