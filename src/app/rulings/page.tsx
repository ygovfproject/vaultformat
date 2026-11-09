import { pageMeta } from '@/lib/meta';
import MovedTo from '@/components/MovedTo';

// The rules used to live at /rulings/. GitHub Pages can't send real redirects, so this page
// forwards to /rules/ in the browser, keeping any #rule-3-3 link. "Rulings" stays free for a
// future page of card-by-card rulings.
export const metadata = pageMeta({ title: 'Rules', description: 'The Vault Format rules have moved to /rules/.', path: '/rules/', image: 'rules', noindex: true });

export default function Page() {
  return <MovedTo path="/rules/" label="Rules" />;
}
