import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { BlockedPeriod } from '../types';

type BlockedPeriodsTableProps = {
  periods: BlockedPeriod[];
};

export function BlockedPeriodsTable({ periods }: BlockedPeriodsTableProps) {
  if (periods.length === 0) {
    return <Typography color="text.secondary">Aucune période bloquée.</Typography>;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Logement</TableCell>
          <TableCell>Période</TableCell>
          <TableCell>Motif</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {periods.map((period) => (
          <TableRow key={period.id}>
            <TableCell>{period.logementNom}</TableCell>
            <TableCell>
              {period.dateDebut} → {period.dateFin}
            </TableCell>
            <TableCell>{period.motif}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
