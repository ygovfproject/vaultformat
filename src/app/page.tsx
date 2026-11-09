import { pageMeta } from '@/lib/meta';
import HomePage from '@/components/pages/HomePage';

export const metadata = pageMeta({
  description: 'Yu-Gi-Oh! with premade, balanced decks. No deckbuilding, no banlist: pick a deck from the Vault Format pool, shuffle up and duel.',
  path: '/',
  image: 'home',
});

// Static shell; the content loads from the file server in the browser on every visit.
export default function Page() {
  return <HomePage />;
}
