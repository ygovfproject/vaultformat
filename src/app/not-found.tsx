import { pageMeta } from '@/lib/meta';
import NotFoundPage from '@/components/pages/NotFoundPage';

export const metadata = pageMeta({
  title: 'Page not found',
  description: 'This page isn’t in the Vault Format deck.',
  path: '/',
  image: 'home',
  noindex: true,
});

export default function NotFound() {
  return <NotFoundPage />;
}
