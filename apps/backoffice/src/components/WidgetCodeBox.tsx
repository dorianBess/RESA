import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

type WidgetCodeBoxProps = {
  code: string;
};

export function WidgetCodeBox({ code }: WidgetCodeBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Code d'intégration"
        value={code}
        slotProps={{ input: { readOnly: true } }}
      />
      <Button variant="contained" onClick={handleCopy}>
        {copied ? 'Code copié' : 'Copier le code'}
      </Button>
    </Stack>
  );
}
