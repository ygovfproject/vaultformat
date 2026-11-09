'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FOOTER_ITEMS } from '@/lib/nav';
import { dmf, fonts, size } from '@/theme';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: dmf.header, pt: { xs: 6, md: 8 }, pb: { xs: 5, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: 3, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Typography variant="body2" sx={{ color: dmf.textMuted }}>
            A fan-made Yu-Gi-Oh! format.
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 1.5, minWidth: 0, maxWidth: '100%' }}>
            {FOOTER_ITEMS.map((item) => (
              <Box
                key={item.href}
                component={NextLink}
                href={item.href}
                sx={{
                  fontFamily: fonts.display,
                  fontSize: size.ui,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: dmf.textMuted,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: dmf.orange },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Fan-content disclaimer */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="caption" component="p" sx={{ color: dmf.textMuted, opacity: 0.8, lineHeight: 1.7 }}>
            Vault Format is an unofficial, non-commercial fan project. It is not affiliated with, endorsed, sponsored or approved by
            Konami. Nothing on this site is for sale: no cards, decks or other products are sold here, and the site makes
            no money.
          </Typography>
          <Typography variant="caption" component="p" sx={{ color: dmf.textMuted, opacity: 0.8, lineHeight: 1.7, mt: 1 }}>
            Yu-Gi-Oh! and all related names, card artwork and trademarks belong to their respective owners
            (© Studio Dice/SHUEISHA, TV TOKYO, KONAMI). Card artwork is shown for reference only. The Vault Format card frame
            design is original to this project.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}
