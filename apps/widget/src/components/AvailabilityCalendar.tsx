import dayjs, { type Dayjs } from 'dayjs';
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { BlockedRange } from '../types';

type AvailabilityCalendarProps = {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  blockedRanges: BlockedRange[];
  minDate?: Dayjs;
};

function isDayBlocked(day: Dayjs, blockedRanges: BlockedRange[]): boolean {
  const dayText = day.format('YYYY-MM-DD');
  return blockedRanges.some((range) => dayText >= range.start && dayText < range.end);
}

export function AvailabilityCalendar({
  label,
  value,
  onChange,
  blockedRanges,
  minDate,
}: AvailabilityCalendarProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              {label}
            </Typography>
            <DateCalendar
              value={value}
              onChange={onChange}
              minDate={minDate ?? dayjs()}
              shouldDisableDate={(day) => isDayBlocked(day, blockedRanges)}
              slots={{
                day: PickersDay,
              }}
              slotProps={{
                day: (ownerState) => ({
                  sx: isDayBlocked(ownerState.day, blockedRanges)
                    ? {
                        bgcolor: 'action.disabledBackground',
                        color: 'text.disabled',
                        textDecoration: 'line-through',
                        '&:hover': {
                          bgcolor: 'action.disabledBackground',
                        },
                      }
                    : undefined,
                }),
              }}
            />
            <Alert severity="info">
              Les dates grisées sont déjà réservées ou bloquées.
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
