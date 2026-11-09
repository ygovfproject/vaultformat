'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { canHover, dmf, fonts, size } from '@/theme';
import { formatDate, type Deck, type Update } from '@/lib/content';
import { Subtitle, Title, pageBg } from '../Decor';
import { PAGE_MAX_WIDTH, PAGE_PB, PAGE_PT, PAGE_TITLE_SIZE } from '../PageShell';
import DeckGrid from './DeckGrid';
import ComingSoon from '../ComingSoon';

/** One line about the newest update, linking to the full list on /updates/. */
function LatestUpdate({ update, decks }: { update: Update; decks: number }) {
  const name = update.title.trim();
  return (
    <Box
      component={NextLink}
      href="/updates"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 1.25,
        rowGap: 0.5,
        px: 2,
        py: 1.25,
        mt: 3,
        bgcolor: dmf.surface,
        borderLeft: `3px solid ${dmf.orange}`,
        color: dmf.text,
        textDecoration: 'none',
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize: size.ui,
        [canHover]: { '&:hover .more': { textDecorationThickness: 2 }, '&:hover svg': { transform: 'translateX(3px)' } },
      }}
    >
      <Box component="span" sx={{ fontWeight: 700 }}>
        Latest update{name ? `: ${name}` : ''}
      </Box>
      <Box component="span" sx={{ color: dmf.ice }}>
        {formatDate(update.date)}
        {decks > 0 && ` · ${decks} new deck${decks === 1 ? '' : 's'}`}
      </Box>
      {/* The link text and arrow stay together on one line */}
      <Box component="span" className="more" sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.5, color: dmf.orange, whiteSpace: 'nowrap', textDecoration: 'underline', textUnderlineOffset: 4 }}>
        All updates
        <ArrowForwardIcon sx={{ fontSize: '1rem', transition: 'transform 150ms' }} />
      </Box>
    </Box>
  );
}

/** Decks page: the deck grid right under the title (it's what visitors come for). */
export default function DecksView({ decks, updates }: { decks: Deck[]; updates: Update[] }) {
  const latest = updates[0];
  return (
    <Box
      component="section"
      sx={{
        ...pageBg,
        pt: PAGE_PT,
        pb: PAGE_PB,
        // With no decks this is the whole page, so it fills the screen
        minHeight: 'calc(100vh - 72px)',
      }}
    >
      <Container maxWidth={PAGE_MAX_WIDTH}>
        <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE, mb: 3 }}>
          Decks
        </Title>
        {decks.length === 0 ? (
          <ComingSoon title="Still shuffling" text="The first Vault Format decks are on the testing table, duel after duel, until every one of them can beat every other. They join the pool soon." />
        ) : (
          <>
            <Subtitle>
              The Vault Format pool: {decks.length} premade {decks.length === 1 ? 'deck' : 'decks'}. Pick one and play it as it is.
            </Subtitle>
            {latest && <LatestUpdate update={latest} decks={decks.filter((d) => String(d.update_id) === String(latest.id)).length} />}
            <Box sx={{ mt: { xs: 4, md: 5 } }}>
              <DeckGrid decks={decks} />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
