import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
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
  const d = day.format('YYYY-MM-DD');
  return blockedRanges.some((r) => d >= r.start && d < r.end);
}

export function AvailabilityCalendar({
  label,
  value,
  onChange,
  blockedRanges,
  minDate,
}: AvailabilityCalendarProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate ?? dayjs()}
        shouldDisableDate={(day) => isDayBlocked(day, blockedRanges)}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'medium',
          },
          day: (ownerState) =>
            isDayBlocked(ownerState.day, blockedRanges)
              ? {
                  sx: {
                    textDecoration: 'line-through',
                    color: 'text.disabled',
                    bgcolor: 'action.disabledBackground',
                    '&:hover': { bgcolor: 'action.disabledBackground' },
                  },
                }
              : {},
        }}
      />
    </LocalizationProvider>
  );
}
