import { Box, Divider, Stack, Typography } from '@mui/material';

type PriceSummaryProps = {
  nights: number;
  tarifParNuit: number;
  devise: string;
  total: number;
};

export function PriceSummary({ nights, tarifParNuit, devise, total }: PriceSummaryProps) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: (theme) => `${theme.palette.primary.main}12`,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="primary">
          Récapitulatif du séjour
        </Typography>
      </Box>

      {/* Lignes */}
      <Stack spacing={0} divider={<Divider />}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Tarif / nuit</Typography>
          <Typography variant="body2" fontWeight={600}>
            {tarifParNuit > 0 ? `${tarifParNuit} ${devise}` : '—'}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Durée</Typography>
          <Typography variant="body2" fontWeight={600}>
            {nights > 0 ? `${nights} nuit${nights > 1 ? 's' : ''}` : '—'}
          </Typography>
        </Stack>

        {/* Total */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: (theme) => `${theme.palette.primary.main}08`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" fontWeight={700}>
            Total estimé
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" fontWeight={800} color="primary" lineHeight={1}>
              {total > 0 ? total : '—'}
            </Typography>
            {total > 0 && (
              <Typography variant="caption" color="text.secondary">
                {devise}
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
