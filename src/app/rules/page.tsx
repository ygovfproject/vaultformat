import { pageMeta } from '@/lib/meta';
import RulesPage from '@/components/pages/RulesPage';

export const metadata = pageMeta({
  title: 'Rules',
  description: 'The Vault Format rulebook: numbered rules you can link to, and a PDF to print.',
  path: '/rules/',
  image: 'rules',
});

export default function Page() {
  return <RulesPage />;
}
