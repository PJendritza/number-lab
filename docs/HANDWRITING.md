# Handwriting recognition

The browser bundles a 784 → 128 ReLU → 10 softmax classifier (~1.9 MB JSON) and 960 four-bit reference shapes (~0.76 MB). Inference and segmentation are ordinary JavaScript. No drawing is uploaded, no API is called, and no training is needed to use the site.

## German-style numerals

Training combines the 60,000 MNIST training examples with 5,000 generated examples of European-style 1s and crossed/plain 7s. The generated 1s have a leading upstroke, varied stem tilt, and optional bottom foot. Width, proportions, stroke thickness, and small coordinate variations are randomized. The rejection reference set includes these forms, not only MNIST examples. Plain 1 and uncrossed 7 remain supported.

The generator is `scripts/european-digits.py`. These are constructed examples, **not handwriting collected from German children**. Tests reproduce the original leading-stroke 1 that the old model guessed as 7. Additional handcrafted browser examples cover plain/footed 1, crossed/plain 7, wide/narrow zeros, and small writing near the side.

Training uses an internal validation split. The final model scored 97.86% on the separate 10,000-image MNIST test set and 100% classification on 600 generated style examples from a separate seed. The latter does not establish accuracy on real German handwriting. Training stopped at the 50-iteration budget before convergence. The old model's MNIST score was 97.81%.

MNIST authors: Yann LeCun, Corinna Cortes, Christopher J. C. Burges. Source: http://yann.lecun.com/exdb/mnist/ ; gzip inputs retrieved over verified HTTPS from the documented https://github.com/fgnt/mnist mirror. The bundled held-out fixture contains 29 original examples across all ten digits.

## One writing box

Single- and two-digit answers use the same large canvas. The recognizer receives no expected answer or expected digit count. It projects visible ink onto columns to find spaces, keeps each digit's multiple strokes together, and reads accepted segments left to right. Both parts of a candidate pair must contain sufficiently tall ink. A pair that cannot be read is rejected rather than silently converted into a single digit. Very narrow bridges may be split if the whole drawing is wide enough and both resulting digits pass acceptance.

This is segmentation, not a general sequence OCR model. Heavily overlapping/touching digits, detached components, or three-digit answers may need clearing/redrawing; only one or two digits are supported. Tests cover 10, 11, 12, 17, and 20, close spacing, small side-positioned 17, and rejecting a three-digit example. Each digit is cropped, scaled proportionally into 20×20 inside a 28×28 image, and centered by ink mass before classification.

Recognition starts after a 1.5-second pause following pointer release. New strokes cancel the pending check. During the 850 ms ink flight, new strokes also cancel that flight and restart recognition, allowing time to finish the number. There is no perfect way to distinguish a long pause from a finished answer without a submit control. Blank pads simply wait; tiny nonblank marks wiggle. Pointer events support fingers, styluses, and mice, with browser zoom available outside the canvas.

## Rejection and feedback

A softmax classifier can be confident about noise. Acceptance is separate and target-independent:

- Normalized ink mass: 12–240 pixels out of 784.
- Winner confidence ≥ 0.80 and margin over runner-up ≥ 0.60.
- Same prediction under at least two of four one-pixel translations.
- Mean squared pixel distance ≤ 0.10 from a reference shape of that digit.

These prototype thresholds are not calibrated probabilities or validated mastery measures. They can reject unusual valid handwriting or accept some scribbles. Tests cover dense scribbles, sparse noise, high-confidence noise, and tiny marks. Rejected ink stays in place and the pad wiggles; no digit is filled and no math progress changes.

Accepted ink flies as a whole answer to the equation and cross-fades into the recognized number. Only after landing is it compared with the arithmetic answer. Correct answers celebrate and advance; incorrect answers wiggle. Clear cancels recognition/flight and empties the box. Leaving the activity cancels all pending callbacks and overlays. Reduced-motion mode uses a brief stationary fade.

Recognition retries do not lower arithmetic difficulty. This can overstate independent success, so handwriting-mode progress is practice evidence, not an assessment. Profiles persist locally; unfinished drawings do not.

## Rebuild and checks

Training requires Python with numpy 2.3.5, scikit-learn 1.8.0, and Pillow 13.0.0. Download the four MNIST `*-ubyte.gz` files listed in the mirror README into a directory:

```sh
OPENBLAS_NUM_THREADS=2 OMP_NUM_THREADS=2 python3 scripts/train-digits.py /path/to/mnist-data
node --test tests/*.test.mjs
```

The script verifies SHA-256 inputs, trains with deterministic seeds, and exports weights and references. Numerical libraries may affect exact results. Browser checks require Playwright and Chromium; serve the repository root first:

```sh
python3 -m http.server 8070 --directory .
# In another terminal:
node tests/browser.cjs
node tests/handwriting-shapes.cjs
node tests/handwriting-numbers.cjs
node tests/handwriting-flow.cjs
```

Set `BASE_URL` to test a different local port. The flow test writes a German 1 and then 2 through pointer events in one canvas, verifies the number 12 flies as one answer, and checks celebration and automatic advancement. The other checks cover scribble rejection, erase, pending timer cancellation, and the existing tap flow.
