# Share images

`public/og/<page>.png` (1200 × 630) are the link previews (Open Graph / X) for each page type.
They're made from `template.html`: open it in a browser with `?page=home` (or `decks`, `deck`,
`errata`, `rules`, `updates`) and `&server=<file server URL>` (default `http://localhost:3002`),
wait for the cards to load, and screenshot the `#card` element at 1200 × 630.

The card ids, titles and lines for each page are at the bottom of `template.html`.
