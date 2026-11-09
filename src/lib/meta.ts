import type { Metadata } from 'next';

/**
 * The site's public address including the base path, e.g. https://ygovfproject.github.io/vaultformat.
 * Link previews (Open Graph, X) need full URLs. The deploy workflow sets SITE_URL; locally it
 * falls back to the GitHub Pages address.
 */
export const SITE_URL = (process.env.SITE_URL || 'https://ygovfproject.github.io/vaultformat').replace(/\/+$/, '');

export const SITE_NAME = 'Yu-Gi-Oh! Vault Format';

/** Share images (1200 × 630) in public/og/, one per page type. */
export type ShareImage = 'home' | 'decks' | 'deck' | 'errata' | 'rules' | 'updates';

/**
 * Title, description and link preview for a page. Every route uses this, so a shared link always
 * gets a title, a description and an image (Next.js replaces openGraph as a whole per page, so the
 * layout's can't just be inherited).
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  shareTitle,
  noindex = false,
}: {
  /** Tab title (the layout adds " · Yu-Gi-Oh! Vault Format"); leave out for the home page */
  title?: string;
  description: string;
  /** Path of the page with a trailing slash, e.g. "/decks/" */
  path: string;
  image: ShareImage;
  /** Title in link previews, if it should differ from the tab title */
  shareTitle?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogTitle = shareTitle ?? (title ? `${title} · Vault Format` : SITE_NAME);
  const images = [{ url: `${SITE_URL}/og/${image}.png`, width: 1200, height: 630, alt: ogTitle }];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, title: ogTitle, description, url, images, locale: 'en_US' },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false } } : {}),
  };
}
