# Working in Base128

Base128 is a dependency-free codec with matching JavaScript/TypeScript and Python
implementations, a streaming CLI, and a static GitHub Pages playground.

## Setup and validation

- Use Node.js 20+ and Python 3.10+. Run `npm ci` from the repository root.
- Run `npm test` before submitting behavior changes. It builds the JS library and
  browser modules, then tests JS, Python, cross-language interoperability, CLI, and website interactions.
- Python discovery tries `python3`, `python`, then Windows `py -3`. Set `PYTHON` to
  a Python executable path to override discovery (no shell arguments).
- Focused checks: `npm run test:js`, `npm run test:python`,
  `npm run test:integration`, `npm run test:cli`, `npm run test:website`.
  Run `npm run build` first when TypeScript or browser vendor inputs changed.
- Preview with `npm run site` (default port 8080; override with `PORT`).

## Source and generated files

- JS source: `packages/js/src`; Python: `packages/python/base128`.
- CLI: `packages/cli/bin/base128.mjs`; UI: `website/index.html`, `app.js`, `styles.css`.
- `npm run build` regenerates tracked `packages/js/dist` and `website/vendor`.
  Commit generated changes with their sources; do not edit generated files directly.
- Keep browser module cache keys consistent in the HTML, app import, and
  `scripts/build-website.mjs` when browser API dependencies change.
- README figures are generated separately by `node scripts/build-readme-images.mjs`.

## Compatibility requirements

- Wrapper rules are in `specs/envelope.md`; preserve explicit shape requirements,
  checksum verification, and bare-codec defaults.
- Read `specs/encoding.md` before changing encoding behavior. Published alphabet
  mappings and reference fixtures are immutable once released; changes need a separate version.
- Default and two-byte are separate fixed alphabets. Strict decoding is the
  default. Opt-in aliases are permitted only for these exact compatible layouts.
- Preserve binary length/padding validation, integer minimality, Unicode scalar
  validation, and arbitrary custom-alphabet behavior in both implementations.
- Do not introduce implicit trimming, normalization, case folding, or alphabet
  detection. Binary and integer modes are not interchangeable.
- Add shared independent vectors when formats or mappings change, and test both
  language implementations. Never regenerate reference fixtures merely to fit new behavior.

## Documentation and delivery

- Follow `CONTRIBUTING.md`; update specs and READMEs with public API changes.
- See `docs/cli.md` for commands, streams, errors, and alphabet options.
- Package names in manifests do not establish registry availability. Use the
  checkout setup in README unless publication is verified.
- GitHub Pages deploys from `master` through `.github/workflows/pages.yml`.
  Feature branches and PRs do not deploy the live site. Preserve that workflow.
