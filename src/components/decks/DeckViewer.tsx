'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';
import type { DeckLink } from '@/lib/content';
import type { DeckList } from '@/lib/decklist';
import { GlitchDivider, Title } from '../Decor';
import PageShell, { PAGE_TITLE_SIZE } from '../PageShell';
import CardBrowser, { type CardSection } from '../cards/CardBrowser';

const smallLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  fontFamily: fonts.display,
  fontWeight: 700,
  fontSize: size.ui,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: dmf.textMuted,
  textDecoration: 'none',
  [canHover]: { '&:hover': { color: dmf.orange } },
} as const;

/** "Previous deck / Alien" or "Next deck / Chronomaly", at the bottom of the page. */
function NeighbourLink({ deck, next = false }: { deck: DeckLink; next?: boolean }) {
  return (
    <Box
      component={NextLink}
      href={`/deck/?d=${encodeURIComponent(deck.id)}`}
      sx={{
        display: 'grid',
        justifyItems: next ? 'end' : 'start',
        gap: 0.5,
        textDecoration: 'none',
        ml: next ? 'auto' : 0,
        textAlign: next ? 'right' : 'left',
        '& svg': { transition: `transform 150ms ${easeOut}` },
        [canHover]: {
          '&:hover .name': { color: dmf.orange },
          '&:hover svg': { transform: `translateX(${next ? 4 : -4}px)` },
        },
      }}
    >
      <Box component="span" sx={{ ...smallLink, [canHover]: {} }}>
        {!next && <ArrowBackIcon fontSize="small" />}
        {next ? 'Next deck' : 'Previous deck'}
        {next && <ArrowForwardIcon fontSize="small" />}
      </Box>
      <Box component="span" className="name" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: size.sub, textTransform: 'uppercase', color: dmf.text, transition: 'color 150ms' }}>
        {deck.title}
      </Box>
    </Box>
  );
}

export default function DeckViewer({ deck }: { deck: DeckList }) {
  // Main Deck always; Extra Deck only when it has cards. The Side Deck isn't shown.
  const sections: CardSection[] = [
    { key: 'main', label: 'Main Deck', cards: deck.main },
    { key: 'extra', label: 'Extra Deck', cards: deck.extra },
  ].filter((s) => s.key === 'main' || s.cards.length > 0);

  return (
    <PageShell>
      {/* Header: back link and name (the card counts are in the card boxes' headings) */}
      <Box component={NextLink} href="/decks" sx={{ ...smallLink, mb: 3 }}>
        <ArrowBackIcon fontSize="small" /> All decks
      </Box>
      <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
        {deck.title}
      </Title>
      <GlitchDivider />

      <CardBrowser sections={sections} images={deck.images} />

      {/* Previous / next deck, in the Decks page's order */}
      {(deck.prev || deck.next) && (
        <Box component="nav" aria-label="Other decks" sx={{ display: 'flex', gap: 4, mt: { xs: 6, md: 8 } }}>
          {deck.prev && <NeighbourLink deck={deck.prev} />}
          {deck.next && <NeighbourLink deck={deck.next} next />}
        </Box>
      )}
    </PageShell>
  );
}
