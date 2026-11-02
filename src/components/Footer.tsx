'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NAV_ITEMS } from '@/lib/nav';
import { dmf, fonts, size } from '@/theme';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: dmf.header, pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: 3, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Typography variant="body2" sx={{ color: dmf.textMuted }}>
            A fan-made Yu-Gi-Oh! format.
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 1.5, minWidth: 0, maxWidth: '100%' }}>
            {NAV_ITEMS.map((item) => (
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
          <Typography variant="caption" component="p" sx={{ color: dmf.textMuted, opacity: 0.8, lineHeight: 1.7, maxWidth: '60ch' }}>
            Vault Format is an unofficial, non-commercial fan project. It is not affiliated with, endorsed, sponsored or approved by
            Konami. Nothing on this site is for sale: no cards, decks or other products are sold here, and the site makes
            no money.
          </Typography>
          <Typography variant="caption" component="p" sx={{ color: dmf.textMuted, opacity: 0.8, lineHeight: 1.7, maxWidth: '60ch', mt: 1 }}>
            Yu-Gi-Oh! and all related names, card artwork and trademarks belong to their respective owners
            (© Studio Dice/SHUEISHA, TV TOKYO, KONAMI). Card artwork is shown for reference only. The Vault Format card frame
            design is original to this project.
          </Typography>
        </Box>

        {/* The name, across the page's full width, in dim navy: a quiet signature to close the page
            (decorative; the header already names the site). Sized from the width it has (container
            units): "VAULT FORMAT" is about 7 times as wide as its font size. */}
        <Box aria-hidden sx={{ mt: { xs: 5, md: 7 }, containerType: 'inline-size' }}>
          <Typography
            component="p"
            sx={{
              userSelect: 'none',
              fontFamily: fonts.display,
              fontWeight: 700,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              fontSize: 'calc(100cqi / 7)',
              lineHeight: 0.8,
              letterSpacing: '-0.01em',
              color: dmf.surface,
            }}
          >
            Vault Format
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
