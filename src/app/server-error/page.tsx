import { pageMeta } from '@/lib/meta';
import ServerErrorView from '@/components/ServerErrorView';

export const metadata = pageMeta({ title: 'Server unavailable', description: 'The Vault Format file server isn’t answering right now.', path: '/', image: 'home', noindex: true });

// Not /500: Next.js reserves that path for its own error page and the static export fails on it.
/** Shown when the file server (cards, decks, texts) can't be reached. Pages go here through useContent. */
export default function ServerErrorPage() {
  return <ServerErrorView />;
}
