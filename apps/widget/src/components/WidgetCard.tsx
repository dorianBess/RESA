import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';
import type { WidgetConfig } from '../types';

type WidgetCardProps = PropsWithChildren<{
  config: WidgetConfig;
}>;

export function WidgetCard({ config, children }: WidgetCardProps) {
  return (
    <Card
      sx={{
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 3,
          color: 'common.white',
          background:
            'linear-gradient(135deg, rgba(27,73,101,1) 0%, rgba(92,131,153,1) 100%)',
        }}
      >
        <Stack spacing={1.5}>
          <Chip
            label={`${config.ville} • ${config.capacite} voyageurs max`}
            sx={{
              width: 'fit-content',
              bgcolor: 'rgba(255,255,255,0.18)',
              color: 'common.white',
            }}
          />
          <Typography variant="h4">{config.logementNom}</Typography>
          <Typography sx={{ maxWidth: 640, opacity: 0.9 }}>{config.description}</Typography>
        </Stack>
      </Box>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>{children}</CardContent>
    </Card>
  );
}
