'use client';

import { useMemo } from 'react';
import { dmf } from '@/theme';
import { splitMarkdown, splitSubsections, type MdSection } from '@/lib/sections';
import type { UpdateNews } from '@/lib/content';
import UpdateNote from './UpdateNote';
import Hero from './Hero';
import { BossBlock, ClosingCta, ColumnsBlock, TextBlock, type Boss } from './home/HomeBlocks';

/** The section about boss monsters gets the row of boss cards. */
export const isBossSection = (s: MdSection) => /\bboss/i.test(s.title);

/**
 * The Main page (philosophy.md): the hero, then one block per "## Heading", each laid out by what
 * it holds:
 * - points ("### Heading" inside it): side by side, each with its icon
 * - the boss section: the one bright band, with a row of boss cards
 * - anything else: heading over text
 * and a closing "Pick a deck" block. Dark blocks alternate between two navy tones.
 */
export default function PhilosophyView({
  markdown,
  cards = null,
  news = null,
  bosses = null,
  deckCount = null,
}: {
  markdown: string;
  cards?: string[] | null;
  news?: UpdateNews | null;
  /** null while loading */
  bosses?: Boss[] | null;
  deckCount?: number | null;
}) {
  const page = useMemo(() => splitMarkdown(markdown), [markdown]);
  const tones = [dmf.bg, dmf.surface];

  let dark = 0; // dark blocks so far, for alternating tones
  // Background of each block, worked out first so the boss band's edges can blend into its neighbours
  const plan = page.sections.map((s) => {
    const sub = splitSubsections(s.body);
    if (isBossSection(s)) return { s, sub, kind: 'boss' as const, bg: dmf.ice };
    const kind = sub.items.length === 0 ? ('text' as const) : ('columns' as const);
    return { s, sub, kind, bg: tones[dark++ % 2] };
  });
  const ctaBg = tones[dark % 2];

  return (
    <>
      {news && <UpdateNote news={news} />}
      <Hero title={page.title || 'Yu-Gi-Oh! with premade decks'} intro={page.intro} cards={cards} />
      {plan.map(({ s, sub, kind, bg }, i) => {
        if (kind === 'boss') {
          return <BossBlock key={s.id} section={s} bosses={bosses} prevColor={plan[i - 1]?.bg ?? dmf.bg} nextColor={plan[i + 1]?.bg ?? ctaBg} />;
        }
        if (kind === 'columns') return <ColumnsBlock key={s.id} section={s} intro={sub.intro} items={sub.items} bg={bg} />;
        return <TextBlock key={s.id} section={s} bg={bg} />;
      })}
      <ClosingCta deckCount={deckCount} bg={ctaBg} />
    </>
  );
}
