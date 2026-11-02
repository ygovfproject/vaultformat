'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { dmf } from '@/theme';
import type { Deck, Update } from '@/lib/content';
import { GlitchDivider, Subtitle, Title, pageBg } from '../Decor';
import { PAGE_MAX_WIDTH, PAGE_PB, PAGE_PT, PAGE_TITLE_SIZE } from '../PageShell';
import UpdatesSection from './UpdatesSection';
import DeckGrid from './DeckGrid';
import ComingSoon from '../ComingSoon';

/** Decks page: the deck grid right under the title (it's what visitors come for), the changelog below it. */
export default function DecksView({ decks, updates }: { decks: Deck[]; updates: Update[] }) {
  return (
    <>
      {/* Header + deck grid */}
      <Box
        component="section"
        sx={{
          ...pageBg,
          pt: PAGE_PT,
          pb: PAGE_PB,
          // With no decks this is the whole page, so it fills the screen
          minHeight: decks.length ? undefined : 'calc(100vh - 72px)',
        }}
      >
        <Container maxWidth={PAGE_MAX_WIDTH}>
          <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
            Decks
          </Title>
          <GlitchDivider />
          {decks.length === 0 ? (
            <ComingSoon title="Still shuffling" text="The first Vault Format decks are on the testing table, duel after duel, until every one of them can beat every other. They join the pool soon." />
          ) : (
            <>
              <Subtitle>
                The Vault Format pool: {decks.length} premade {decks.length === 1 ? 'deck' : 'decks'}. Pick one and play it as it is.
              </Subtitle>
              <Box sx={{ mt: { xs: 4, md: 5 } }}>
                <DeckGrid decks={decks} />
              </Box>
            </>
          )}
        </Container>
      </Box>

      {/* Updates */}
      {decks.length > 0 && updates.length > 0 && (
        <Box component="section" sx={{ bgcolor: dmf.surface, pt: { xs: 8, md: 12 }, pb: PAGE_PB }}>
          <Container maxWidth={PAGE_MAX_WIDTH}>
            <UpdatesSection updates={updates} />
          </Container>
        </Box>
      )}
    </>
  );
}
