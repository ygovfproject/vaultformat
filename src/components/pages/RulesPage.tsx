'use client';

import RulesView from '../RulesView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getContentText } from '@/lib/content';

/** The rules page. Its text is still rulings.md on the file server. */
export default function RulesPage() {
  const markdown = useContent(() => getContentText('rulings.md'));
  if (markdown === null) return <PageLoading />;
  return <RulesView markdown={markdown} />;
}
