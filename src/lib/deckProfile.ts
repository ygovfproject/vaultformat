import { bossCardId, type DeckJson } from './content';
import { parseYdk } from './decklist';
import { cardData, fetchText, type CardData } from './fileServer';

/** How a deck plays, read from its list: nothing is written by hand. */
/** "Main engine" first: it says which way the deck goes (its boss is a Main Deck monster), the rest which card types it plays. */
export const DECK_TAGS = ['Main engine', 'Ritual', 'Fusion', 'Synchro', 'Xyz', 'Link', 'Spellform'] as const;
export type DeckTag = (typeof DECK_TAGS)[number];

/** One line per tag, for the filter buttons' tooltips. */
export const TAG_HINTS: Record<DeckTag, string> = {
  'Main engine': 'Decks built around a Main Deck boss monster',
  Ritual: 'Decks that play Ritual Monsters and Ritual Spells',
  Fusion: 'Decks that play Fusion Monsters',
  Synchro: 'Decks that play Synchro Monsters',
  Xyz: 'Decks that play Xyz Monsters',
  Link: 'Decks that play Link Monsters',
  Spellform: 'Decks that play Spellform Monsters',
};

/**
 * A deck gets a card-kind tag when it plays at least this many cards of that kind (copies count),
 * or when its boss monster is of that kind (e.g. a deck built around one Xyz boss). A deck whose
 * boss is in the Main Deck also gets "Main engine".
 */
const MIN_CARDS = 3;

export type DeckProfile = {
  /** In DECK_TAGS order */
  tags: DeckTag[];
};

/** Card texts are small, but there are a few hundred: this many requests at a time across all decks. */
const PARALLEL = 8;
let running = 0;
const waiting: (() => void)[] = [];

async function limited<T>(task: () => Promise<T>): Promise<T> {
  if (running >= PARALLEL) await new Promise<void>((go) => waiting.push(go));
  running++;
  try {
    return await task();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

const card = (id: string) => limited(() => cardData(id).catch(() => null));

/** The kinds a card counts toward: Fusion / Synchro / Xyz / Link / Spellform monsters, Ritual Monsters and Ritual Spells. */
function kindsOf(c: CardData | null): DeckTag[] {
  if (!c) return [];
  const kinds: DeckTag[] = DECK_TAGS.filter((t) => c.typeline?.includes(t));
  if (c.type === 'Spell' && c.property === 'Ritual' && !kinds.includes('Ritual')) kinds.push('Ritual');
  return kinds;
}

/** Tags for a deck (loads its list and card texts from the file server). */
export async function getDeckProfile(deck: Pick<DeckJson, 'id' | 'boss' | 'img'>): Promise<DeckProfile> {
  const ydk = await fetchText(`decks/${deck.id}.ydk`);
  const { main, extra } = parseYdk(ydk ?? '');
  const ids = [...extra, ...main];
  const unique = [...new Set(ids)];
  const data = new Map(await Promise.all(unique.map(async (id) => [id, await card(id)] as const)));
  const count = new Map<DeckTag, number>();
  for (const id of ids) for (const k of kindsOf(data.get(id) ?? null)) count.set(k, (count.get(k) ?? 0) + 1);
  const boss = bossCardId(deck);
  const bossKinds = boss && (extra.includes(boss) || main.includes(boss)) ? kindsOf(data.get(boss) ?? null) : [];
  if (boss && main.includes(boss)) bossKinds.push('Main engine');
  return { tags: DECK_TAGS.filter((t) => (count.get(t) ?? 0) >= MIN_CARDS || bossKinds.includes(t)) };
}
