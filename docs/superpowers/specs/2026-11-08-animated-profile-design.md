# Animated GitHub profile

Requested: replace the main profile README, taking animation inspiration from the supplied Instagram reel and visual styling from adrielwalintukan.my.id. The user selected their portfolio theme rather than the reel's green theme.

## Design

Use the live portfolio palette: background `#ccd2d6`, navy `#0b1226`, teal `#1b7a80`, light surface `#f8fafb`. Preserve Big Shoulders Display, Geist and JetBrains Mono with embedded fonts. Reuse the portfolio's existing 3D character head. Present a light editorial hero, animated role line, activity dashboard, selected projects, skills and contact links.

## Approaches

The reel's black/green dashboard and the existing red/black identity were considered. The user instead requested the current portfolio theme. Implement this with repository-owned SVG images, existing daily statistics automation and native README links/details. A separate interactive website would support cursor tracking but is outside the requested README scope.

## Behavior and constraints

- SVG animations are declarative, with reduced-motion fallbacks and visible static content.
- Interactivity consists of project/contact links and native expandable details. No scripts, fake controls or cursor tracking inside README images.
- Preserve existing biographical statements and project URLs; do not invent achievements or activity data.
- Fetch actual contribution days for the calendar. Empty activity must produce an empty calendar, never simulated activity.
- Keep the scheduled statistics update working and in the new palette.
- Verify image-mode rendering, narrow layouts, links, XML and the statistics renderer before publishing the requested profile change.

## Implementation decisions

Reuse existing SVG sections and embedded fonts instead of adding dependencies. Use the existing daily workflow. Keep the head image animated gently; do not promise the website's cursor-driven head tracking on GitHub.
