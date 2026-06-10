import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Reservation } from '../types';

type ReservationTableProps = {
  reservations: Reservation[];
};

export function ReservationTable({ reservations }: ReservationTableProps) {
  if (reservations.length === 0) {
    return <Typography color="text.secondary">Aucune réservation pour le moment.</Typography>;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Logement</TableCell>
          <TableCell>Voyageur</TableCell>
          <TableCell>Séjour</TableCell>
          <TableCell>Montant</TableCell>
          <TableCell>Statut</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell>{reservation.logementNom}</TableCell>
            <TableCell>{reservation.voyageurNom}</TableCell>
            <TableCell>
              {reservation.dateDebut} → {reservation.dateFin}
            </TableCell>
            <TableCell>{reservation.montantTotal} EUR</TableCell>
            <TableCell>
              <Chip
                size="small"
                label={reservation.statut}
                color={reservation.statut === 'CONFIRMEE' ? 'success' : 'warning'}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
