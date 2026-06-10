import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

type PriceSummaryProps = {
  nights: number;
  tarifParNuit: number;
  devise: string;
  total: number;
};

export function PriceSummary({
  nights,
  tarifParNuit,
  devise,
  total,
}: PriceSummaryProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Récapitulatif</Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Tarif par nuit</Typography>
            <Typography>
              {tarifParNuit} {devise}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Nombre de nuits</Typography>
            <Typography>{nights}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>
              Total estimé
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              {total} {devise}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
