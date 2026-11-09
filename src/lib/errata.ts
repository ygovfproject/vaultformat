import { getContentText, readDecksJson } from './content';
import { parseYdk } from './decklist';
import { cardData, cardImageUrl, fetchText, isCustomCard, isErratum } from './fileServer';

/** One deck's errata, in deck-list order. */
export type ErrataGroup = { deckId: string; deckTitle: string; cards: string[] };

export type ErrataData = {
  /** Intro text from content/errata.md ('' if missing) */
  intro: string;
  /** Decks that play errata, by name; a card two decks share is listed under both */
  groups: ErrataGroup[];
  images: Record<string, string | null>;
};

/**
 * Erratum cards (custom cards, 90000nnnn, whose text has the "~Vault Format erratum~" line) per
 * deck (decks/<id>.ydk on the file server, for every deck in decks.json). Decks without errata are
 * left out.
 */
async function errataByDeck(): Promise<ErrataGroup[]> {
  const decks = [...(await readDecksJson())].sort((a, b) => a.title.localeCompare(b.title));
  const ydks = await Promise.all(decks.map(async (d) => (await fetchText(`decks/${d.id}.ydk`)) ?? ''));

  const perDeck = ydks.map((ydk) => {
    const { main, extra, side } = parseYdk(ydk);
    return [...new Set([...main, ...extra, ...side].filter(isCustomCard))];
  });
  const custom = [...new Set(perDeck.flat())];
  const texts = await Promise.all(custom.map((id) => cardData(id).then((d) => d?.desc ?? '', () => '')));
  const errata = new Set(custom.filter((id, i) => isErratum(id, texts[i])));

  return decks
    .map((d, i) => ({ deckId: d.id, deckTitle: d.title, cards: perDeck[i].filter((id) => errata.has(id)) }))
    .filter((g) => g.cards.length > 0);
}

/** Errata from the deck lists (card ids + image URLs) and the intro text. Card texts load later, on the page. */
export async function getErrata(): Promise<ErrataData> {
  const [intro, groups] = await Promise.all([getContentText('errata.md'), errataByDeck()]);
  const images = Object.fromEntries(groups.flatMap((g) => g.cards).map((c) => [c, cardImageUrl(c)]));
  return { intro: intro.trim(), groups, images };
}
