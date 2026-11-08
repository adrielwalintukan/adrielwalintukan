# Animated profile implementation plan

**Goal:** Update the profile README to match the current portfolio and add supported animation and interaction.

**Architecture:** Repository-owned SVGs plus Markdown links/details. Extend the existing daily statistics renderer with the actual contribution calendar.

**Tech stack:** SVG/CSS, Markdown, Node.js built-ins.

**Spec:** `docs/superpowers/specs/2026-11-08-animated-profile-design.md`

## Constraints

No new dependencies or fabricated activity. Embed fonts/media in SVG. Respect reduced motion and keep content visible without animation. Preserve the current profile facts and destinations.

## Tasks

- [x] Test calendar rendering with zero activity, actual contribution counts, date escaping and different week counts.
- [x] Add calendar rendering and connect actual GitHub contribution days to the statistics script. Reuse existing embedded fonts locally.
- [x] Recolor existing sections and create the animated portfolio-themed hero with the existing 3D character.
- [x] Update README order and add expandable background/skills sections.
- [x] Render through GitHub's Markdown API, inspect desktop/mobile image rendering and reduced motion, and check all assets/links.
- [ ] Commit and publish the authorized profile update through GitHub; verify the live README and daily workflow.

## Review focus

Check calendar column widths, zero activity, missing weekday slots, XML escaping, embedded media availability, animation in img mode, mobile readability and whether the daily job overwrites the new design.
