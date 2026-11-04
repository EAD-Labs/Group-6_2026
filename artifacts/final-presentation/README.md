# Final poster and demonstration assets

The included print file is [ET617_Group6_Poster.pdf](ET617_Group6_Poster.pdf), with [preview](poster-preview.png). The latest 20 October redesign uses deep teal, cream, mint, coral and golden yellow. A large teacher-focused headline, classroom example and two vector application panels make the purpose clear quickly. It covers the client problem, teacher persona, development process, learning activities, client feedback, current features and future development.

Authoring originals remain at `output/pdf/ET617_Group6_Poster.pdf` and `output/pdf/ET617_Group6_Poster-preview.png`. [Design notes](DESIGN.md) describe the visual direction. The previous published poster is preserved in Git history.

## Editable source and reproducibility

`scripts/build-final-poster.py` is the editable ReportLab source, with pypdf merging the vector app panels. It uses the bundled Instrument Sans and Instrument Serif fonts in `fonts/`, with their OFL licences. Text, lines, arrows, QR and visible application text are vectors. Requirements: Python with ReportLab/Pillow/pypdf, Poppler for rendering, and pdfplumber for preflight.

Capture the public app as screen-media PDF fragments. The script enters fictional material through the actual form, preserves the live UI and crops the PDF to the two workspaces. It does not invent screens or change application labels. Fonts remain embedded; soft CSS shadows are raster. The fully clipped page-header logo is removed from the fragments.

```sh
POSTER_PYTHON=python3 node scripts/capture-poster-vector.mjs
```

Then generate and render:

```sh
python3 scripts/build-final-poster.py
pdftoppm -scale-to 3200 -singlefile -png output/pdf/ET617_Group6_Poster.pdf output/pdf/ET617_Group6_Poster-preview
pdfinfo output/pdf/ET617_Group6_Poster.pdf
pdffonts output/pdf/ET617_Group6_Poster.pdf
cp output/pdf/ET617_Group6_Poster.pdf artifacts/final-presentation/ET617_Group6_Poster.pdf
cp output/pdf/ET617_Group6_Poster-preview.png artifacts/final-presentation/poster-preview.png
```

Reinspect the rendered preview after every edit; do not submit an earlier PNG with a newer PDF. Text-height guards reject overflowing paragraphs. `output/pdf/poster-layout.json` records placement for further checks. The source PDFs retain clipped operators outside their visible workspaces, so geometry checks must respect their clipping boundaries. Engineering test counts remain in the release record rather than appearing as decorative poster metrics.

Screens are captured through real browser interaction with fictional classroom material and no personal data. `vector-capture.json` records the current PDF capture. The earlier 4× raster captures and `capture.json` remain available as fallback assets. The QR includes its quiet zone and points to `https://promptshala.vercel.app/try`.

## Preflight and final live rehearsal

`poster-preflight.json` records one-page 841 x 1189 mm portrait dimensions, embedded text fonts, final-preview QR decoding, layout checks and high-zoom inspection. Check the receiving printer's requirements; the supplied course requirement is A0 portrait PDF, not a specified PDF/X/CMYK profile. This file uses RGB artwork and vector text, including the app panels; soft interface shadows remain raster. Print at **100% / actual size**, with no automatic scaling.

Before the 20 October Moodle deadline: verify final PDF and QR on another device, confirm `/try` is deployed and works from a second network, rehearse the three-minute visitor path, and record the final source/deployment and actual Moodle receipt. Printing is arranged by the course teaching team. Reporting on 23 October is 9:15 AM; session 9:30 AM-12:00 PM, LA-LHC Complex Foyer, IIT Bombay.

## Visitor resources

- `SAMPLE_MATERIALS.txt`: fictional source, weak/clearer request and review prompts.
- `science-material-rubric.json`: a valid original portable rubric showing adaptation to another subject context.
- [Visitor kit](../../docs/final/DEMONSTRATION_KIT.md) and [five-minute explanation](../../docs/final/FIVE_MINUTE_SCRIPT.md).
- [Client review/decision packet](../../docs/final/CLIENT_REVIEW_AND_DECISIONS.md), [current evidence register](../../docs/final/FINAL_DELIVERY_RECORD.md) and [blank study materials](../../docs/study/README.md).

No shared staff credentials, invented participant results or client signatures belong in these artifacts.
