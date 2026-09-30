# PromptShala colour system

The same palette applies to the public website, account screens and participant learning experience. The colours are defined in `src/app/globals.css` and shared through CSS variables.

| Role | Colour | Use |
| --- | --- | --- |
| Navy | `#15243e` | Navigation, homepage introduction rail, sign-in introduction and primary actions |
| Warm paper | `#f7f3ec` | Page canvas |
| Warm white | `#fffdfa` | Reading cards, forms and work surfaces |
| Peach | `#f5d2b6` | Current navigation item and prominent actions on navy |
| Pale peach | `#f8e7db` | Context badges and welcoming panels |
| Terracotta | `#88442a` | Context labels and editorial emphasis |
| Pale terracotta | `#fff0e4` | Classroom examples and review guidance |
| Pale blue | `#f0f3f9` | Practice panels and supporting information |
| Cobalt | `#2855bc` | Links, progress and selected controls on light surfaces |

## Consistency rules

- Use navy for navigation and introductory panels, with light text and peach highlights.
- Use warm paper behind warm white content. Use pale blue to identify practice and pale peach for context.
- Keep existing branding on a white capsule when placed on navy.
- Use explicit success, warning and error states alongside their text and icons; these are functional feedback rather than decorative card colours.
- Preserve the compact typography and rounded homepage cards.
- Selected items use dark text on peach. Keyboard focus is visible on both light and dark surfaces.

## Review checks

Representative page checks cover the homepage, sign-in, onboarding, dashboard, progress, profile, settings, module overview, lesson, quiz, CRAFT lab, AI Staffroom and Source Studio, including responsive layouts.

- Browser checks confirm the shared navy navigation and warm paper canvas.
- Phone and tablet checks confirm no horizontal overflow, usable sign-in controls and a working course drawer.
- Measured sign-in contrast: introductory body text 8.79:1, form labels 9.80:1, primary action 14.07:1, guided-demo action 6.31:1, and input boundaries 3.73:1.
- Lesson reading text remains 11.25px.
- These are representative visual checks, not a complete accessibility certification.
