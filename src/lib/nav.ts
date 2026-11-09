export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Decks', href: '/decks' },
  { label: 'Updates', href: '/updates' },
  { label: 'Errata', href: '/errata' },
  { label: 'Rules', href: '/rules' },
] as const;

/** The footer lists the same pages. */
export const FOOTER_ITEMS = NAV_ITEMS;

/** Whether a menu item is the current page. A deck page (/deck/?d=...) counts as Decks. */
export function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (href === '/') return path === '/';
  if (href === '/decks' && path === '/deck') return true;
  return path === href || path.startsWith(`${href}/`);
}
