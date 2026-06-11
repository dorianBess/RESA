import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { DatePicker, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { PickersDayProps } from '@mui/x-date-pickers';
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
  return blockedRanges.some((r) => {
    const start = r.start.substring(0, 10);
    const end = r.end.substring(0, 10);
    return d >= start && d < end;
  });
}

function BlockedDay(props: PickersDayProps & { blockedRanges: BlockedRange[] }) {
  const { blockedRanges, day, ...rest } = props;
  const blocked = isDayBlocked(day, blockedRanges);

  return (
    <PickersDay
      {...rest}
      day={day}
      disabled={blocked || rest.disabled}
      sx={
        blocked
          ? {
              bgcolor: '#f1f5f9 !important',
              color: '#94a3b8 !important',
              textDecoration: 'line-through',
              opacity: '1 !important',
              '&:hover': { bgcolor: '#f1f5f9 !important' },
              '&.Mui-disabled': {
                bgcolor: '#f1f5f9 !important',
                color: '#94a3b8 !important',
                opacity: '1 !important',
              },
            }
          : undefined
      }
    />
  );
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
        slots={{ day: BlockedDay }}
        slotProps={{
          textField: { fullWidth: true },
          day: { blockedRanges } as any,
        }}
      />
    </LocalizationProvider>
  );
}
