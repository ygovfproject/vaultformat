'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { dmf, fonts, size } from '@/theme';
import { FaceDownCards } from './cards/CardAnimations';

/** "Not here yet" panel, shown on Decks while there are no decks. */
export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <Box
      sx={{
        mt: 5,
        p: { xs: 3, md: 4 },
        maxWidth: 820,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 3, md: 4 },
        bgcolor: dmf.surface,
      }}
    >
      <Box sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
        <FaceDownCards />
      </Box>
      <Box>
        <Typography component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: size.sub, color: dmf.text }}>
          {title}
        </Typography>
        <Typography sx={{ color: dmf.text, mt: 1 }}>{text}</Typography>
      </Box>
    </Box>
  );
}
