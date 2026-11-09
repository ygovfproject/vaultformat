import { bossCardId, readDecksJson } from './content';
import { cardData, cardImageUrl } from './fileServer';

export type BossCard = { deckId: string; deckTitle: string; name: string; image: string };

/**
 * `count` random decks' boss cards for the home page, each linking to its deck.
 */
export async function getBossCards(count = 6): Promise<BossCard[]> {
  const decks = await readDecksJson();
  const withBoss = await Promise.all(
    decks.map(async (d) => {
      const id = bossCardId(d);
      const data = id ? await cardData(id).catch(() => null) : null;
      return id && data?.name ? { card: { deckId: d.id, deckTitle: d.title, name: data.name, image: cardImageUrl(id) } } : null;
    }),
  );
  const all = withBoss.filter((b): b is NonNullable<typeof b> => b !== null);
  // A different pick on every visit (Fisher–Yates shuffle)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count).map((b) => b.card);
}
