import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';
import type { WidgetConfig } from '../types';

type WidgetCardProps = PropsWithChildren<{
  config: WidgetConfig;
}>;

export function WidgetCard({ config, children }: WidgetCardProps) {
  return (
    <Card sx={{ overflow: 'hidden', maxWidth: 960, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          pt: { xs: 3, md: 4 },
          pb: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main}99 100%)`,
          color: 'common.white',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          },
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography fontSize={28}>🏡</Typography>
            <Typography
              variant="overline"
              sx={{ opacity: 0.75, letterSpacing: 2, fontSize: '0.7rem' }}
            >
              Réservation en ligne
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
            {config.logementNom}
          </Typography>
          {config.description && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.85,
                maxWidth: 600,
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {config.description}
            </Typography>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography fontSize={14}>👥</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                {config.capacite} voyageur{config.capacite > 1 ? 's' : ''} max
              </Typography>
            </Stack>
            {(config.ville ?? config.description) && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography fontSize={14}>📍</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                  {config.ville ?? config.description}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography fontSize={14}>💶</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                {config.tarifParNuit} {config.devise} / nuit
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>{children}</CardContent>
    </Card>
  );
}
