# Final poster and demonstration assets

The included print file is [ET617_Group6_Poster.pdf](ET617_Group6_Poster.pdf), with [preview](poster-preview.png), so a fresh clone contains the deliverables. Authoring originals remain at `output/pdf/ET617_Group6_Poster.pdf` and `output/pdf/ET617_Group6_Poster-preview.png`. The A0 portrait poster covers all six topics with a learner persona, process flow, actual UI captures, feedback-to-change matrix, implementation evidence and wider-context review module.

## Editable source and reproducibility

`scripts/build-final-poster.py` is the editable ReportLab source. It uses the bundled Noto Sans font, vector text/diagrams/QR and screenshots in this folder. Requirements: Python with ReportLab/Pillow, Poppler for render/preflight. To regenerate after the actual final test run:

```sh
python3 scripts/build-final-poster.py --unit-tests ACTUAL_PASSED_COUNT --browser-journeys ACTUAL_PASSED_COUNT
pdftoppm -scale-to 2200 -singlefile -png output/pdf/ET617_Group6_Poster.pdf output/pdf/ET617_Group6_Poster-preview
pdfinfo output/pdf/ET617_Group6_Poster.pdf
pdffonts output/pdf/ET617_Group6_Poster.pdf
cp output/pdf/ET617_Group6_Poster.pdf artifacts/final-presentation/ET617_Group6_Poster.pdf
cp output/pdf/ET617_Group6_Poster-preview.png artifacts/final-presentation/poster-preview.png
```

Replace the two placeholders with recorded numbers. Reinspect the rendered preview after every edit; do not submit an earlier PNG with a newer PDF. Text-height guards in the generator reject selected overflowing paragraphs, but they do not replace visual inspection.

Screens were captured through real browser interaction, with fictional built-in classroom material and no personal data. `capture.json` records the actual capture time/environment; local capture is not proof of deployment. Regenerate captures through `e2e/poster-assets.spec.ts` only after the final UI is stable. The QR is vector geometry with its quiet zone and decodes to `https://promptshala.vercel.app/try`.

## Preflight and final live rehearsal

`poster-preflight.json` records one-page 841 x 1189 mm portrait dimensions, embedded text font, final-preview QR decoding and text-boundary checks. Check the receiving printer's requirements; the supplied course requirement is A0 portrait PDF, not a specified PDF/X/CMYK profile. This file uses RGB artwork, vector type and source-resolution screenshots. Print at **100% / actual size**, with no automatic scaling.

Before the 20 October Moodle deadline: verify final PDF and QR on another device, confirm `/try` is deployed and works from a second network, rehearse the three-minute visitor path, and record the final source/deployment and actual Moodle receipt. Printing is arranged by the course teaching team. Reporting on 23 October is 9:15 AM; session 9:30 AM-12:00 PM, LA-LHC Complex Foyer, IIT Bombay.

## Visitor resources

- `SAMPLE_MATERIALS.txt`: fictional source, weak/clearer request and review prompts.
- `science-material-rubric.json`: a valid original portable rubric showing adaptation to another subject context.
- [Visitor kit](../../docs/final/DEMONSTRATION_KIT.md) and [five-minute explanation](../../docs/final/FIVE_MINUTE_SCRIPT.md).
- [Client review/decision packet](../../docs/final/CLIENT_REVIEW_AND_DECISIONS.md), [current evidence register](../../docs/final/FINAL_DELIVERY_RECORD.md) and [blank study materials](../../docs/study/README.md).

No shared staff credentials, invented participant results or client signatures belong in these artifacts.
