import { Grid, TextField } from '@mui/material';

type GuestFormProps = {
  values: {
    voyageurNom: string;
    voyageurPrenom: string;
    voyageurEmail: string;
    voyageurTelephone: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
};

export function GuestForm({ values, onChange }: GuestFormProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Nom"
          value={values.voyageurNom}
          onChange={(event) => onChange('voyageurNom', event.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Prénom"
          value={values.voyageurPrenom}
          onChange={(event) => onChange('voyageurPrenom', event.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={values.voyageurEmail}
          onChange={(event) => onChange('voyageurEmail', event.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Téléphone"
          value={values.voyageurTelephone}
          onChange={(event) => onChange('voyageurTelephone', event.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Notes"
          value={values.notes}
          onChange={(event) => onChange('notes', event.target.value)}
        />
      </Grid>
    </Grid>
  );
}
