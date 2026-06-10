import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import type { Logement, NewBlockedPeriod } from '../types';

type BlockedPeriodFormProps = {
  logements: Logement[];
  onSubmit: (payload: NewBlockedPeriod) => Promise<void>;
};

type FormState = {
  logementId: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
};

const defaultForm: FormState = {
  logementId: '',
  dateDebut: '',
  dateFin: '',
  motif: '',
};

export function BlockedPeriodForm({ logements, onSubmit }: BlockedPeriodFormProps) {
  const [form, setForm] = useState<FormState>({
    ...defaultForm,
    logementId: logements[0]?.id ?? '',
  });

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(form);
    setForm({
      ...defaultForm,
      logementId: logements[0]?.id ?? '',
    });
  };

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            select
            label="Logement"
            value={form.logementId}
            onChange={(event) => updateField('logementId', event.target.value)}
          >
            {logements.map((logement) => (
              <MenuItem key={logement.id} value={logement.id}>
                {logement.nom}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Date de début"
            InputLabelProps={{ shrink: true }}
            value={form.dateDebut}
            onChange={(event) => updateField('dateDebut', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Date de fin"
            InputLabelProps={{ shrink: true }}
            value={form.dateFin}
            onChange={(event) => updateField('dateFin', event.target.value)}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Motif"
            value={form.motif}
            onChange={(event) => updateField('motif', event.target.value)}
          />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSubmit} disabled={logements.length === 0}>
        Bloquer la période
      </Button>
    </Stack>
  );
}
