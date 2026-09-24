Ocean Slate is a soft neo-brutalist system: square blocks, 3px ink borders and hard offset shadows, in muted slate, mist and sand, with one rust accent. It is built for a marketing website that sells websites to US local businesses. It should feel confident, a little cheeky and very easy to scan.

## Principles

1. **Bold shapes, calm colors.** The attitude comes from borders, shadows and type weight, never from loud color. Keep fills muted and let `ink` do the shouting.
2. **One punchline per screen.** Each headline gets one `Highlight`, each screen gets at most one `Sticker` and one rust object. If everything is highlighted, nothing is.
3. **Square and solid.** Use `radius-none` everywhere. Pills (`radius-pill`) exist only for Stickers and the browser dots.
4. **Hard light.** Shadows are always solid `ink` offsets with no blur (`shadow-sm` to `shadow-xl`). Bigger objects get bigger shadows.
5. **Handmade, not messy.** Tilt at most one object per group, using the `tilt-*` tokens.
6. **Scannable first.** Big headline, one lead sentence, a clear primary button. A visitor should get the offer in five seconds.

## Voice and content

- Write like a smart friend who happens to be good at marketing: witty, direct and a bit cheeky, never mean.
- Short sentences. Contractions are fine. Talk to the reader as "you" and about yourself as "I".
- Use sentence case for headlines and buttons.
- Never use em dashes. Use periods, commas or a rephrase.
- No emoji. Use the glyphs ★ (hero eyebrow, ratings), ✦ (Marquee separators), → (lists, links) and ✓ (checklists) sparingly.
- Headlines follow a setup then a twist, with the twist inside the `Highlight`.
- Buttons start with a verb and describe the outcome, in 2 to 4 words.
- Humor lives in headlines, Stickers, FAQ answers and the losing rows of the SerpMock. Body copy stays clear and useful.
- Never invent stats or testimonials. Mark placeholders until real ones exist.

## Color

- Page ground is `surface`. Cards, nav links and secondary buttons are `surface-raised`.
- `ink` is the only text color on light grounds, and the color of every border and shadow. Use `ink-muted` only for notes and captions.
- `slate` is the primary: primary buttons and the Proof band. Text on it is always `on-slate`. Never put `ink` text on `slate`.
- `mist` is the highlight: the headline Highlight, featured cards, the winning SERP row, the nav call link and the final CTA box. Text on it is always `ink`.
- `sand` is support: the browser bar, number badges and small tags, always with `ink`.
- `rust` is the accent, once or twice per screen: logo chip, Sticker, Most popular flag and strike-throughs. Text on it is `on-rust` at 14px bold or larger.
- The page alternates grounds to separate sections: `surface`, then a `surface-raised` band with 3px ink top and bottom borders, then `surface` again, with one `slate` band for proof and an `ink` strip for the Marquee and footer.

## Type

- One family: Space Grotesk (`sans`), loaded from Google Fonts in weights 400, 500 and 700.
- `display` for the hero headline only. `h2` for section headlines. `h3` for card titles. `lead` under headlines. `body` inside cards. `label` for eyebrows, nav and stickers. `small` for meta.
- Headlines are 700 weight with tight tracking (-0.03em to -0.035em) and leading from 0.95 to 1.
- Keep lead paragraphs at 520 to 620px wide.

## Spacing and layout

- Content max width is 1200px, with `space-6` side gutters on desktop and `space-4` on mobile.
- Every section has `space-8` (110px) vertical padding, and 80px under 900px.
- Section pattern: `Eyebrow`, then an h2 with one `Highlight`, then an optional `lead`, then `space-7`, then a 3-column grid with a `space-5` gap.
- The hero is a two-column grid (1.2fr and 1fr) with a `space-7` gap: headline, lead and buttons on the left, `SerpMock` on the right.
- Everything collapses to one column under 900px. Tilts and lifts are removed on mobile where they would overlap.

## Borders, shadows and motion

- Outer borders are `border-thick` (3px) solid `ink`. Inner dividers are `border-thin` (2px) dashed `ink`.
- On button hover, translate by (3px, 3px) and switch to `shadow-pressed`, over 0.1s. It should feel like pressing a physical button.
- The Marquee is the only continuous motion. Stop it for people who prefer reduced motion.
- The focus ring is a 3px solid `ink` outline, offset by 4px.

## Page recipe

Nav, then Hero, Marquee, Problem (3 cards), Services (a raised band of 3 cards with the middle one featured), Before and after, Process (a 3-step strip), Proof (a slate band with stat cards and quotes), Pricing (3 plans with the middle one featured), FAQ, a final CTA box in `mist` with `shadow-xl` and a Sticker, and the Footer in `ink`.

## Iconography and imagery

- There is no icon set. Use the text glyphs listed under Voice and content.
- There is no logo mark yet. The wordmark is the name set in `label` weight inside a `rust` chip (`Nav` logo).
- Prefer interface mockups built from the system (like `SerpMock`) and real client screenshots in `Card` frames over stock photos.

## Don'ts

- No gradients, blur, glassmorphism or soft shadows.
- No rounded cards and no colored left borders.
- No neon or saturated brights. Stay inside the palette.
- No more than one tilted object per row.
