# Number Lab

A small browser-based addition practice app for children around 6–7. Two activities: tap an answer or write it with a finger. Both animate correct answers and continue automatically. Every five answers earns a star. Local animal profiles save progress; addition adapts within 5, 10, and 20. No runtime dependencies, backend, analytics, or timers on solving questions.

## Run

Python 3 and Node 18+:

```sh
python3 -m http.server 8070 --directory .
node --test tests/*.test.mjs
```

Open the server in a browser. GitHub Pages publishes `main / (root)` at https://patrickjendritza.com/number-lab/ . Root `index.html` loads assets from `app/`. No build or custom Actions workflow is needed. Update both index files if changing the page shell, retaining `app/` asset prefixes in the root file. The contents of `app/` can also be hosted standalone.

## Handwriting

A single box accepts one- or two-digit answers. A local neural network, augmented with generated German-style 1s and crossed 7s, recognizes digits independently of the expected answer. Ink is checked after a pause; additional strokes cancel pending recognition/flight. Clear erases the answer. Some handwriting, particularly overlapping digits, may need a retry.

See [recognition, training, evidence and limitations](docs/HANDWRITING.md). No model installation or training is needed to run the site. Optional browser checks use Playwright and `/usr/bin/chromium`:

```sh
node tests/browser.cjs
node tests/handwriting-shapes.cjs
node tests/handwriting-numbers.cjs
node tests/handwriting-flow.cjs
```

Use `BASE_URL` for a different server address. Screenshots go to ignored `artifacts/`.

## Local data

Up to eight profiles persist on the same browser/origin. Names are optional; starting an activity creates a local player. Private browsing or clearing website data can remove profiles. No sync or backup is provided. Stars reward practice, not speed or independent accuracy. Unfinished rounds restart; completed answers already contribute evidence. UI is English. This is an early prototype, not a validated curriculum or assessment.

[Design history](docs/PLAN.md) · [Cloud startup](docs/CLOUD-START.md)
