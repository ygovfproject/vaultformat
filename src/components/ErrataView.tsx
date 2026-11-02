'use client';

import Box from '@mui/material/Box';
import type { ErrataData } from '@/lib/errata';
import { GlitchDivider, Subtitle, Title } from './Decor';
import PageShell, { PAGE_TITLE_SIZE } from './PageShell';
import Markdown from './Markdown';
import CardBrowser from './cards/CardBrowser';
import ComingSoon from './ComingSoon';

export default function ErrataView({ data, hasDecks }: { data: ErrataData; hasDecks: boolean }) {
  return (
    <PageShell>
        <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          Errata
        </Title>
        <GlitchDivider />

        {/* errata.md's intro says what the page is; without one, a plain line does */}
        {data.intro ? (
          <Box sx={{ mb: 2 }}>
            <Markdown>{data.intro}</Markdown>
          </Box>
        ) : (
          <Subtitle>Vault Format card changes: the cards that play differently from their official versions.</Subtitle>
        )}

        {!hasDecks ? (
          <ComingSoon title="Still shuffling" text="Vault Format errata come with the decks that use them. They show up here as soon as the first decks join the pool." />
        ) : data.cards.length === 0 ? (
          <ComingSoon title="No errata yet" text="Every card in the current decks plays exactly as printed. Changed cards will show up here." />
        ) : (
          <CardBrowser
            sections={[{ key: 'errata', label: 'Errata', cards: data.cards }]}
            images={data.images}
            errataTags={false}
          />
        )}
    </PageShell>
  );
}
