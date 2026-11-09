# Digit recognition

The app bundles a 784 → 80 ReLU → 10 softmax digit classifier (~1.2 MB JSON), trained for this project with scikit-learn's MLPClassifier on MNIST. Inference is ordinary JavaScript: no runtime package, third-party API, or upload. Training is separate from running the website.

MNIST authors: Yann LeCun, Corinna Cortes, Christopher J. C. Burges. Source: http://yann.lecun.com/exdb/mnist/ ; dataset files retrieved over verified HTTPS from the documented https://github.com/fgnt/mnist mirror. The fixture contains 30 held-out MNIST examples, three per digit. Training used 60,000 examples (with an internal validation split); the test set has 10,000. The model achieved 97.81% on the MNIST test set before export. That does **not** establish accuracy on children's finger writing. The 35-iteration training budget ended before convergence; no claim of optimal training is made.

Canvas preprocessing crops the ink bounding box, fits the digit into 20×20 pixels inside a 28×28 image, and centers its mass. The model predicts without receiving the target answer. Predictions below 55% confidence display `?`; confident predictions appear below the pad. Blank pads cannot be submitted. Wrong/uncertain drawings stay available until erased with ↻. Recognition retries do not lower arithmetic difficulty; this also means assisted corrections can overstate independence, so handwriting-mode progress is practice evidence, not an assessment.

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
