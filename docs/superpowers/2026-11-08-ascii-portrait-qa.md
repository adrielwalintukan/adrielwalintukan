# ASCII portrait correction - 8 November 2026

The user requested the portrait animation from the Instagram reference instead of the lightly moving 3D bitmap.

## Change

- Removed the bitmap portrait from the hero. The replacement is made entirely from monospaced SVG text.
- Converted 11 horizontal head poses from the user's portfolio into 90-column, 54-row ASCII grids. Each frame records its original portfolio asset URL in `assets/portrait-frames.json`.
- The face turns continuously in both directions over an 8-second cycle, with a subtle scan light. Reduced motion shows a complete neutral face.
- Kept the current portfolio palette and the other README sections.
- Changed the README asset URL to `assets/hero-ascii.svg` so the previous cached portrait is not reused.

## Verification

- New tests were first observed failing because the portrait renderer did not exist, then passed with the renderer implemented.
- `node --test`: 5/5 tests pass, including the 3 existing calendar tests.
- New tests verify literal ASCII spacing, XML escaping, absence of bitmap image elements and rejection of incomplete frame grids.
- Hero SVG parses as XML. The actual grids contain 11 distinct poses, each 90 by 54 characters.
- Browser image-mode check: the hero was displayed through an ordinary `img` element in a preview of GitHub-rendered README HTML. Two portrait captures visibly show different head positions; the PNG buffers also differ (32,804 and 34,469 bytes). The browser reported `prefers-reduced-motion: false` during this check.
- Rebuild with `node scripts/profile.mjs`; the result is `assets/hero-ascii.svg`.
