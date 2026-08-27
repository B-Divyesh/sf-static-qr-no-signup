# Visual thesis: the working blueprint

## Direction and rationale

This product is a **blueprint drafting sheet**, not a marketing dashboard. A static QR is a durable piece of infrastructure: the interface should feel measured, inspectable, and ready to send to print. Warm drafting paper replaces a sterile white canvas; technical blue carries structure and trust; vermilion registration marks draw attention to irreversible output details. Fine grid lines and measurement labels explain the work instead of decorating it.

This is deliberately a single light treatment. QR production is fundamentally a print task, and the preview must remain visually comparable to white stock. The page background is explicitly painted, including browser chrome via `theme-color`.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#f4f0e6` | page background |
| Sheet | `#fffdf7` | active drafting surfaces |
| Ink | `#10283f` | primary copy, QR foreground |
| Blueprint | `#174f78` | structure, links, selected states |
| Blueprint pale | `#dce7eb` | grid and inactive controls |
| Muted | `#536573` | annotations and secondary copy |
| Vermilion | `#b53c2e` | registration marks, warnings, focus accent |
| Green | `#245f4b` | verified state |
| Danger | `#972f2f` | destructive/error state |

All body text combinations meet 4.5:1. Vermilion is never the sole carrier of meaning.

## Typography

- Headings: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, system sans-serif. Uppercase only for short drawing labels; main prose remains sentence case.
- Body: `Inter`, `Segoe UI`, system sans-serif. No remote font request is made.
- Technical annotations and values: `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`, monospace.
- Scale: 14 / 16 / 20 / 28 / clamp(40–68) px, with 1.5 body leading and tabular figures for measurements.

System stacks are intentional: privacy, instant rendering, and zero font bytes are stronger trust signals than ornamental type.

## Spacing and layout

- Base unit: 4px; common rhythm: 8, 12, 16, 24, 32, 48, 72px.
- Desktop workspace uses a 12-column drafting grid. Editor and output sit side by side; preview remains visible as settings change.
- At 390px the hero diagram is reduced, tabs scroll horizontally, and editor/output stack with export actions wrapping into two columns.
- Controls are at least 44px high. Content is grouped by proximity; ruled sheets appear only for genuinely independent work areas.

## Interaction grammar

- Selected tools look like filled blueprint labels, with both color and border/weight cues.
- Field edits update the drawing immediately after valid input. Output state is stated in a live status line.
- Advanced controls unfold from their point of origin. Batch work switches to a separate drafting table rather than overloading the single-code form.
- Export buttons name the artifact (`Download SVG`, not `Save`). The static payload is always shown verbatim in an inspection drawer.

## Motion policy

- 180ms for hover/press/focus feedback; 240ms for panels appearing, using opacity and small vertical transforms.
- QR replacement uses opacity only so geometry never appears to wobble.
- No looping motion or ornamental parallax.
- Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling are removed and state changes are instant.

## Asset plan and provenance

- Hero: an original generated editorial still life of a QR drafting desk, used as a contextual blueprint-world illustration rather than evidence of functionality. It must contain no readable text, logos, brands, people, or fake UI. The actual live QR beside it is rendered by the app.
- Icons, registration marks, rulers, grid, and verification seal are hand-authored CSS/SVG and MIT-licensed with the application.
- Generated imagery disclosure appears in the footer.

### Image prompt sheet

**Subject:** top-down architect's drafting table for designing a QR symbol; square paper card with abstract black-and-blue modular geometry, precision ruler, registration pins, mechanical pencil, cropped composition.

**World/materials:** warm cotton drafting paper, cyan blueprint vellum, brushed steel, graphite, slight ink bleed, tactile analogue tools.

**Light/lens:** soft north-window light, controlled shadows, top-down 50mm editorial product photography, crisp macro detail.

**Palette words:** warm ivory, navy technical ink, faded cyan, tiny vermilion registration accents.

**Negative list:** no readable text, no watermark, no logos, no brands, no people, no hands, no screens, no neon, no glossy SaaS gradient, no photoreal scan code that could be mistaken for the generated output.

**Generation:** Azure AI Foundry `factory-image`, 2026-08-27. Original generated asset; prompt derived verbatim from this sheet. Candidate source and prompt sidecar are kept in `assets/src/`; optimized WebP is shipped locally.
