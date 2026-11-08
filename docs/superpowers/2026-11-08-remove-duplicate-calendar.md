# Remove duplicate contribution calendar - 8 November 2026

The user requested removal or replacement of the calendar because GitHub already displays it on the profile.

- Removed the calendar and its scan animation from the statistics card.
- Kept the contribution/commit totals, pull requests, repositories, stars and language bar.
- Reduced card height from 654 to 448 SVG units, removing the resulting empty space.
- Removed the unused calendar renderer and its tests, and stopped fetching individual contribution days.
- Updated the README and daily workflow to use `assets/stats-summary.svg`, avoiding reuse of the previous cached image.
- Regenerated the card using a fresh GraphQL response obtained through `gh api`.

Validation: the remaining portrait tests pass; the generated SVG parses as XML, has the compact dimensions, and contains no calendar cells or calendar labels. All README image paths exist. The daily update targets the new asset path.
