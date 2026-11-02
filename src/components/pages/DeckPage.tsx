'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import DeckViewer from '../decks/DeckViewer';
import { GlitchDivider, Title, NotchButton, Subtitle } from '../Decor';
import PageShell, { PAGE_TITLE_SIZE } from '../PageShell';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getDeckList } from '@/lib/decklist';

/** One deck: /deck/?d=<deck id>, loaded from the file server. */
export default function DeckPage() {
  const id = useSearchParams().get('d') ?? '';
  const deck = useContent(() => getDeckList(id).then((d) => ({ d })), [id]);

  useEffect(() => {
    if (deck?.d) document.title = `${deck.d.title} · Yu-Gi-Oh! Vault Format`;
  }, [deck]);

  if (!deck) return <PageLoading />;
  if (!deck.d) {
    return (
      <PageShell>
        <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          Deck not found
        </Title>
        <GlitchDivider />
        <Subtitle>There&apos;s no deck called &quot;{id}&quot; in the Vault Format pool.</Subtitle>
        <Box sx={{ mt: 4 }}>
          <NotchButton href="/decks" variant="ghost">
            All decks
          </NotchButton>
        </Box>
      </PageShell>
    );
  }
  return <DeckViewer deck={deck.d} />;
}
