# Profile QA - 8 November 2026

## Verified

- `node --test`: 3/3 tests pass. Checks actual daily counts, zero contributions, weekday placement, XML-safe dates, empty data and 54-week width.
- `node --check scripts/stats.mjs` and SVG XML parsing pass.
- The renderer was run with an actual GitHub GraphQL response obtained using `gh api graphql`. At this snapshot: 1,139 contributions in 12 months, 387 commits, 226 pull requests, 16 eligible public repositories and 17 stars.
- README was rendered using `gh api markdown`. Native details/summary sections and existing project/contact links survive GitHub's rendering.
- Chromium rendered SVGs embedded as images in a preview of that GitHub-rendered HTML. Desktop screenshots were inspected. An initial numeral font fallback was corrected by reusing the original statistics renderer's full ASCII font subset; the corrected screenshot was inspected.
- Embedded SVG media/fonts do not require external requests. Reduced-motion rules disable the new repeating animation and retain visible content.
- Independent read-only source review found no actionable issues. Existing statistics aggregation limits were unchanged.

## Verification limits

The additional Playwright pixel-comparison/interaction run could not complete: Windows reported insufficient paging-file allocation and Node reported an array-buffer allocation failure. Do not interpret this as a passed end-to-end animation or interaction test. Chromium static rendering and native GitHub Markdown rendering were checked separately. The command-line mobile capture used Chromium's minimum window width, so it does not establish a 390px viewport test.

## Rollout verification

- Profile update published to `main` in commit `da6cf3589fc3a0baeb295b7cebb0a4670c67bd9c`.
- The remote README blob matches the verified local file: `dc2e7c7bb8c1df1cade98235d149920d8d03ca28`.
- Manual daily-workflow verification [42465036549](https://github.com/adrielwalintukan/adrielwalintukan/actions/runs/42465036549) completed successfully, including the tests, rendering and committing the refreshed card (`f83dda6`).

## Maintenance commands

- Rebuild hero: `node scripts/profile.mjs`.
- Rebuild statistics locally from a saved GraphQL response: `node scripts/stats.mjs adrielwalintukan --from-json response.json`.
- Daily statistics retain the existing workflow schedule, with `node --test` added before rendering.
- README text details provide readable background, project descriptions and skills alongside the SVG presentation.
