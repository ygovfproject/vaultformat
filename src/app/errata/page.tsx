import { pageMeta } from '@/lib/meta';
import ErrataPage from '@/components/pages/ErrataPage';

export const metadata = pageMeta({
  title: 'Errata',
  description: 'Vault Format card errata: the cards that play differently from their official versions, grouped by deck.',
  path: '/errata/',
  image: 'errata',
});

export default function Page() {
  return <ErrataPage />;
}
