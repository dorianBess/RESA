import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import type { NewLogement } from '../types';

type LogementFormProps = {
  onSubmit: (payload: NewLogement) => Promise<void>;
};

const defaultForm: NewLogement = {
  nom: '',
  ville: '',
  capacite: 1,
  statut: 'ACTIF',
  tarifParNuit: 90,
};

export function LogementForm({ onSubmit }: LogementFormProps) {
  const [form, setForm] = useState<NewLogement>(defaultForm);

  const updateField = (field: keyof NewLogement, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(form);
    setForm(defaultForm);
  };

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Nom du logement"
            value={form.nom}
            onChange={(event) => updateField('nom', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Ville"
            value={form.ville}
            onChange={(event) => updateField('ville', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            select
            label="Capacité"
            value={form.capacite}
            onChange={(event) => updateField('capacite', Number(event.target.value))}
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            select
            label="Statut"
            value={form.statut}
            onChange={(event) => updateField('statut', event.target.value)}
          >
            <MenuItem value="ACTIF">Actif</MenuItem>
            <MenuItem value="BROUILLON">Brouillon</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            type="number"
            label="Tarif par nuit"
            value={form.tarifParNuit}
            onChange={(event) => updateField('tarifParNuit', Number(event.target.value))}
          />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSubmit}>
        Ajouter le logement
      </Button>
    </Stack>
  );
}
