'use client';

import UpdatesView from '../decks/UpdatesView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getUpdates, readDecksJson } from '@/lib/content';

export default function UpdatesPage() {
  const data = useContent(() => Promise.all([getUpdates(), readDecksJson()]));
  if (!data) return <PageLoading />;
  return <UpdatesView updates={data[0]} decks={data[1]} />;
}
