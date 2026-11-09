'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DeckViewer from '../decks/DeckViewer';
import NotFoundView from '../NotFoundView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getDeckList } from '@/lib/decklist';
import { readDecksJson, type DeckJson } from '@/lib/content';
import { pickRandomCards } from '@/lib/cards';
import { closest } from '@/lib/fuzzy';
import { SITE_NAME } from '@/lib/meta';
import { dmf } from '@/theme';

/** A deck link that matches no deck: the 404 layout, with the closest deck name as a suggestion. */
function DeckNotFound({ id }: { id: string }) {
  const [cards, setCards] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<DeckJson | null>(null);
  useEffect(() => {
    document.title = `Deck not found · ${SITE_NAME}`;
    let alive = true;
    pickRandomCards(Infinity).then((c) => alive && setCards(c), () => {});
    readDecksJson().then((decks) => alive && setSuggestion(closest(id, decks, (d) => [d.id, d.title])), () => {});
    return () => {
      alive = false;
    };
  }, [id]);
  return (
    <NotFoundView
      key={cards.length ? 'cards' : 'empty'}
      cards={cards}
      title="Deck not found"
      text={id ? <>There&apos;s no deck called &ldquo;{id}&rdquo; in the Vault Format pool.</> : 'This link doesn’t name a deck.'}
    >
      {suggestion && (
        <Typography sx={{ color: dmf.text, mt: 1 }}>
          Did you mean{' '}
          <Box
            component={NextLink}
            href={`/deck/?d=${encodeURIComponent(suggestion.id)}`}
            sx={{ color: dmf.orange, fontWeight: 600, textDecorationThickness: 2, textUnderlineOffset: 4 }}
          >
            {suggestion.title}
          </Box>
          ?
        </Typography>
      )}
    </NotFoundView>
  );
}

/** One deck: /deck/?d=<deck id>, loaded from the file server. */
export default function DeckPage() {
  const id = useSearchParams().get('d') ?? '';
  const deck = useContent(() => getDeckList(id).then((d) => ({ d })), [id]);

  // The static page's title is "Deck"; once the deck is in, the tab shows its name
  useEffect(() => {
    if (deck?.d) document.title = `${deck.d.title} · ${SITE_NAME}`;
  }, [deck]);

  if (!deck) return <PageLoading />;
  if (!deck.d) return <DeckNotFound id={id} />;
  return <DeckViewer deck={deck.d} />;
}
