import { pageMeta } from '@/lib/meta';
import UpdatesPage from '@/components/pages/UpdatesPage';

export const metadata = pageMeta({
  title: 'Updates',
  description: 'Every Vault Format update: the decks each one added to the pool.',
  path: '/updates/',
  image: 'updates',
});

export default function Page() {
  return <UpdatesPage />;
}
