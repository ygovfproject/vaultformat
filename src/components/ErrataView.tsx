'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { dmf, fonts, size } from '@/theme';
import type { ErrataData } from '@/lib/errata';
import { Subtitle, Title } from './Decor';
import PageShell, { PAGE_TITLE_SIZE } from './PageShell';
import Markdown from './Markdown';
import SearchBox from './SearchBox';
import CardBrowser, { useCardTexts, type CardSection } from './cards/CardBrowser';
import ComingSoon from './ComingSoon';

type View = 'deck' | 'all';

/**
 * Errata page: the erratum cards, grouped by the deck that plays them or all in one grid, with a
 * search over card and deck names.
 */
export default function ErrataView({ data, hasDecks }: { data: ErrataData; hasDecks: boolean }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('all');
  // Loaded here (not in the card browser) so the search can match card names
  const ids = useMemo(() => [...new Set(data.groups.flatMap((g) => g.cards))], [data]);
  const texts = useCardTexts(ids);

  const groups = useMemo<CardSection[]>(() => {
    const q = query.trim().toLowerCase();
    return data.groups
      .map((g) => {
        // The deck's name matches: all its errata; else only the cards whose name matches
        const cards = !q || g.deckTitle.toLowerCase().includes(q) ? g.cards : g.cards.filter((c) => texts[c]?.name?.toLowerCase().includes(q));
        return { key: g.deckId, label: g.deckTitle, href: `/deck/?d=${encodeURIComponent(g.deckId)}`, cards };
      })
      .filter((s) => s.cards.length > 0);
  }, [data, query, texts]);

  // "All": one grid, each card once (in deck-name order)
  const sections = useMemo<CardSection[]>(() => {
    if (view === 'deck') return groups;
    const cards = [...new Set(groups.flatMap((g) => g.cards))];
    return cards.length ? [{ key: 'all', label: 'All errata', cards }] : [];
  }, [view, groups]);

  const total = ids.length;

  return (
    <PageShell>
      <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE, mb: 3 }}>
        Errata
      </Title>

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
      ) : total === 0 ? (
        <ComingSoon title="No errata yet" text="Every card in the current decks plays exactly as printed. Changed cards will show up here." />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 4 }}>
            <SearchBox value={query} onChange={setQuery} label="Search errata" placeholder="Search cards or decks" />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_, v: View | null) => v && setView(v)}
              aria-label="Show errata"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  fontFamily: fonts.display,
                  fontSize: size.ui,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: dmf.textMuted,
                  borderColor: 'rgba(232,238,247,0.25)',
                },
                '& .Mui-selected': { color: `${dmf.ink} !important`, bgcolor: `${dmf.orange} !important` },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="deck">By deck</ToggleButton>
            </ToggleButtonGroup>
            <Typography role="status" sx={{ fontFamily: fonts.display, fontWeight: 600, color: dmf.textMuted }}>
              {query.trim()
                ? `${new Set(sections.flatMap((s) => s.cards)).size} of ${total} cards`
                : `${total} cards in ${data.groups.length} decks`}
            </Typography>
          </Box>
          {sections.length === 0 ? (
            <Box sx={{ py: 6 }}>
              <Typography sx={{ color: dmf.text, mb: 1 }}>No errata match “{query.trim()}”.</Typography>
              <ButtonBase
                onClick={() => setQuery('')}
                sx={{ p: 0, font: 'inherit', fontWeight: 600, color: dmf.orange, textDecoration: 'underline', textDecorationThickness: 2, textUnderlineOffset: 4 }}
              >
                Clear search
              </ButtonBase>
            </Box>
          ) : (
            <CardBrowser sections={sections} images={data.images} texts={texts} errataTags={false} />
          )}
        </>
      )}
    </PageShell>
  );
}
