# Cloud startup

Use the existing `/workspace/number-lab` checkout. Tasks are already isolated; do not create a Git worktree unless requested.

No installation or build is required. Python 3 serves the application; Node 18+ runs unit tests.

```sh
cd /workspace/number-lab
node --test tests/*.test.mjs
python3 -m http.server 8070 --directory app
```

Keep the server in a persistent terminal session. In another session, verify `curl -fsS http://127.0.0.1:8070/` returns the Number Lab HTML. Services must restart in new tasks; live processes do not survive snapshots.

When Playwright is available, `node tests/browser.cjs` uses `/usr/bin/chromium` to exercise profiles, progression, reload persistence, subtraction support, and mobile layout. Screenshots go to ignored `artifacts/`. Browser tooling is optional for serving the app; it is not a runtime dependency.

No credentials or environment variables are needed. No public hosting destination is configured. The onboarding draft save failed, so these instructions are retained in the repository rather than confirmed in the environment configuration.
