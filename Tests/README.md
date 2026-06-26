# Festify Testing

Automated unit tests for Festify, run with Jest and jsdom.

## Running tests

```bash
npm test
```

Coverage reports are written to `coverage/lcov-report/index.html`.

## Test files

| File | Target |
|------|--------|
| `app.test.js` | Event rendering and popup helpers (`app.js`) |
| `firebase.test.js` | Firebase data layer (`firebase.js`, mocked) |
| `inline.test.js` | Auth popup helpers (`inline.js`) |
| `organizer.test.js` | Organizer auth wiring (`organizer.js`) |
| `script.test.js` | Dashboard formatting utilities (`utils.js` via `script.js`) |
| `setup.js` | Shared mocks (localStorage, fetch, alert) |

## Mocks

Firebase CDN imports are mapped to `__mocks__/` via `moduleNameMapper` in `package.json`.

## Adding tests

1. Add or update files under `Tests/`.
2. Run `npm test` and check coverage.
3. Add mocks in `__mocks__/` when introducing new external dependencies.
