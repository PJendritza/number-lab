# Number Lab

A small, calm math practice website for children around 6–7. Addition and subtraction, local animal profiles, five-question rounds, visual counting support, and gentle adaptive difficulty. No accounts, backend, dependencies, external fonts, analytics, or timers.

## Run

Python 3 and Node 18+ are enough:

```sh
python3 -m http.server 8070 --directory app
node --test tests/*.test.mjs
```

Open the server in a browser. To deploy, upload the contents of `app/` to any static website host (including a subdirectory). No build is needed. GitHub Pages publishes this repository from `main / (root)`. The root `index.html` loads the application assets from `app/`. The public address is https://patrickjendritza.com/number-lab/ . No custom Actions workflow is needed. When changing the page shell in `app/index.html`, also update root `index.html`, keeping its asset paths prefixed with `app/`.

Profiles persist in localStorage on the same browser and origin; private browsing or clearing site data can remove them. Up to eight profiles are supported. Stars reward completed rounds, not speed or independent accuracy. Unfinished rounds restart, but completed answers already contribute evidence. UI is English in this first version.

See [the plan and learning design](docs/PLAN.md) for scope, adaptive rules, rationale, and limitations.
