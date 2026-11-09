import { pageMeta } from '@/lib/meta';
import DecksPage from '@/components/pages/DecksPage';

export const metadata = pageMeta({
  title: 'Decks',
  description: 'Every deck in the Vault Format pool: premade, tested and frozen. Pick one and play it as it is.',
  path: '/decks/',
  image: 'decks',
});

export default function Page() {
  return <DecksPage />;
}
