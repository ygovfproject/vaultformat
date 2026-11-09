'use client';

import { useEffect, useState } from 'react';
import PhilosophyView from '../PhilosophyView';
import type { Boss } from '../home/HomeBlocks';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { pickRandomCards } from '@/lib/cards';
import { getBossCards } from '@/lib/bosses';
import { getContentText, getLatestUpdateNews, readDecksJson, type UpdateNews } from '@/lib/content';

/**
 * Main page. The loading screen only waits for the text (philosophy.md); the hero cards, the boss
 * row (6 random decks) and the latest-update note load after the page is shown (each keeps its space meanwhile).
 */
export default function HomePage() {
  const markdown = useContent(() => getContentText('philosophy.md'));
  const [cards, setCards] = useState<string[] | null>(null); // null = still loading
  const [news, setNews] = useState<UpdateNews | null>(null);
  const [bosses, setBosses] = useState<Boss[] | null>(null);
  const [deckCount, setDeckCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    pickRandomCards(Infinity).then((c) => alive && setCards(c), () => alive && setCards([]));
    getLatestUpdateNews().then((n) => alive && setNews(n), () => {});
    readDecksJson().then((d) => alive && setDeckCount(d.length), () => {});
    getBossCards().then((b) => alive && setBosses(b), () => alive && setBosses([]));
    return () => {
      alive = false;
    };
  }, []);

  if (markdown === null) return <PageLoading />;
  return <PhilosophyView markdown={markdown} cards={cards} news={news} bosses={bosses} deckCount={deckCount} />;
}
