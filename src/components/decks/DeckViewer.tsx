'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { dmf, fonts, size } from '@/theme';
import type { DeckList } from '@/lib/decklist';
import { GlitchDivider, Subtitle, Title } from '../Decor';
import PageShell, { PAGE_TITLE_SIZE } from '../PageShell';
import CardBrowser, { type CardSection } from '../cards/CardBrowser';

export default function DeckViewer({ deck }: { deck: DeckList }) {
  // Main Deck always; Extra Deck only when it has cards. The Side Deck isn't shown.
  const sections: CardSection[] = [
    { key: 'main', label: 'Main Deck', cards: deck.main },
    { key: 'extra', label: 'Extra Deck', cards: deck.extra },
  ].filter((s) => s.key === 'main' || s.cards.length > 0);

  return (
    <PageShell>
        <Box
          component={NextLink}
          href="/decks"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: size.ui,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: dmf.textMuted,
            textDecoration: 'none',
            '&:hover': { color: dmf.orange },
          }}
        >
          <ArrowBackIcon fontSize="small" /> All decks
        </Box>
        <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          {deck.title}
        </Title>
        <GlitchDivider />
        <Subtitle>
          Vault Format deck: {deck.main.length} cards in the Main Deck
          {deck.extra.length > 0 && `, ${deck.extra.length} in the Extra Deck`}.
        </Subtitle>

        <CardBrowser sections={sections} images={deck.images} />
    </PageShell>
  );
}
