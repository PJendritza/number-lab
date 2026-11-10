# Digit recognition

The app bundles a 784 → 80 ReLU → 10 softmax digit classifier (~1.2 MB JSON), trained for this project with scikit-learn's MLPClassifier on MNIST. Inference is ordinary JavaScript: no runtime package, third-party API, or upload. Training is separate from running the website.

MNIST authors: Yann LeCun, Corinna Cortes, Christopher J. C. Burges. Source: http://yann.lecun.com/exdb/mnist/ ; dataset files retrieved over verified HTTPS from the documented https://github.com/fgnt/mnist mirror. The fixture contains 29 held-out MNIST examples covering all ten digits. Training used 60,000 examples (with an internal validation split); the test set has 10,000. The model achieved 97.81% on the MNIST test set before export. That does **not** establish accuracy on children's finger writing. The 35-iteration training budget ended before convergence; no claim of optimal training is made.

Canvas preprocessing crops the ink bounding box, fits the digit into 20×20 pixels inside a 28×28 image, and centers its mass. The model and acceptance gate operate without receiving the target answer. Acceptance uses the multi-part gate documented below; rejected ink wiggles in its pad. Accepted ink flies to the equation. Blank pads cannot be submitted. Wrong/uncertain drawings stay available until erased with ↻. Recognition retries do not lower arithmetic difficulty; this also means assisted corrections can overstate independence, so handwriting-mode progress is practice evidence, not an assessment.

Single digits have a full-width square pad. Two-digit arithmetic uses separate tens/ones pads, stacked on narrow screens. Pointer events support fingers, styluses, and a mouse. Browser zoom remains available outside the drawing area; touch-action is disabled only on canvases. Progress survives reload; drawings do not.

## Rebuild (optional)

Use a separate Python environment with numpy 2.3.5 and scikit-learn 1.8.0 (or record your versions and revalidate). Download the four `*-ubyte.gz` files linked in the mirror README into a data directory, then run:

```sh
OPENBLAS_NUM_THREADS=2 OMP_NUM_THREADS=2 python3 scripts/train-digits.py /path/to/mnist-data
node --test tests/*.test.mjs
```

The script verifies SHA-256 checksums before training and exports local model weights. Exact floating-point results may vary by numerical library version. `tests/browser.cjs` draws a zero through actual pointer events, submits it, checks feedback, and exercises tapping, persistence, arithmetic, and mobile layout.

### Automatic checking

The current UI has no submit button. Checking starts after a one-second pause following pointer release. Additional strokes restart the pause; pointer-down cancels it. Blank pads and partially completed two-digit answers cannot pass. Correct recognition triggers the shared 1.4-second celebration and automatic advance. Recognition and navigation timers are cancelled on leaving the task. Browser regression checks cover the pause, holding the pointer down, blank pads, automatic advancement, and leaving with a pending check.

### Ink arrival feedback

Confident recognition first animates a snapshot of each actual drawn digit from its pad to the equation's answer box (850 ms). During the flight the ink cross-fades into the recognized typed digit. Correctness is handled only after landing: a correct answer celebrates and advances, an incorrect answer remains in the equation and wiggles. The original ink stays available to edit or clear after an incorrect result. Low-confidence recognition shows a question mark rather than presenting a digit as certain. There are no small recognition labels below pads.

Clear is a wide, flat eraser button. It cancels a pending recognition or active flight and empties all pads and the answer box. Leaving the activity also cancels/removes flight overlays. Reduced-motion mode uses a brief stationary fade instead of travel.

### Rejecting unclear/non-digit ink

A softmax winner is not proof that ink is a number: random noise can produce a 99% score. The current acceptance gate is deliberately separate from choosing a digit. It requires all of:

- Normalized ink mass between 12 and 240 pixels (out of 784).
- Winner confidence at least 0.80 and a margin of at least 0.60 over the second guess.
- The same digit in at least two of four one-pixel translations.
- Mean squared pixel distance no greater than 0.10 from one of 80 real training examples of that digit. The 800 reference shapes are quantized to four-bit pixels and bundled locally, generated reproducibly by the training script. No expected answer is provided to this decision.

These are prototype acceptance thresholds, not calibrated probabilities of correctness. They reject common scribbles/noise and can also reject unusual but valid writing; they do not guarantee every scribble is rejected. Automated tests cover clear digits, high-confidence noise, sparse noise, a real pointer-drawn zero, a dense scribble, and a tiny mark. The original held-out fixture has 29 examples (two examples for 8, three for each other digit).

Rejected ink stays in place and its entire pad wiggles. No detected digit flies, no answer is filled, no math progress changes, and there is no automatic retry loop. The child can clear and redraw. Blank pads simply wait; tiny nonblank marks wiggle rather than being silently ignored. Clearing resets rejection feedback. Existing flight/celebration behavior remains for accepted digits, including a recognized but mathematically incorrect answer.


### More forgiving finger-writing thresholds

The initial gate caused false rejections. Confidence/margin, shift stability, and shape distance have been relaxed to the values above. Ink-mass rejection, tiny-mark handling, and target-independent classification remain. Regression checks include previously rejected handwritten 3/6/8 examples as well as small/off-center, wide, and narrow drawn zeros. These are engineering examples, not a validation study with children.
