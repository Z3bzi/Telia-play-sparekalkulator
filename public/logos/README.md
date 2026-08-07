# Service logos

Drop logo files here and reference them by filename from the admin panel's
**Logo** field (e.g. `netflix.svg`), or set the `logo` property on a service in
`src/lib/config.js`.

A service with no logo renders a brand-coloured monogram instead, so the app
looks complete whether or not this folder is populated.

## Guidance

- **SVG is preferred**; PNG at 96×96 or larger also works. Files are rendered
  into a 30×30 tile with `object-fit: contain`, so any aspect ratio is safe.
- **Use the square/icon variant** where a brand offers one. Wide wordmarks
  become unreadable at this size.
- **Don't recolour, crop, or redraw** the marks. Each brand's guidelines govern
  clear space, minimum size, and which variants may be used on light
  backgrounds — the tile is white for that reason.
- **Use assets you're licensed to use.** These are third-party trademarks;
  partner-supplied press or brand-kit assets are the right source. Several of
  these rightsholders actively police redistribution, which is why no logo
  files are committed here by default.

## Adding one

1. Save the file here, e.g. `public/logos/netflix.svg`
2. Open the app, tap the header 5× and enter the PIN
3. Put `netflix.svg` in that service's **Logo** field and save
