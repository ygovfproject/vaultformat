import { Suspense } from 'react';
import { pageMeta } from '@/lib/meta';
import DeckPage from '@/components/pages/DeckPage';
import PageLoading from '@/components/pages/PageLoading';

// Every deck shares this one page (/deck/?d=<id>), and decks are only known in the browser, so
// every deck link shares this preview. The page sets the tab title to the deck's name once it loads.
export const metadata = pageMeta({
  title: 'Deck',
  shareTitle: 'Vault Format deck',
  description: 'A premade, frozen deck from the Vault Format pool.',
  path: '/deck/',
  image: 'deck',
});

// /deck/?d=<deck id>: one static page for every deck; the deck itself loads in the browser
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DeckPage />
    </Suspense>
  );
}
