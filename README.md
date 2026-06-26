# Festify

**Where Your Events Become Festival** — a full-stack event platform for discovering events, purchasing tickets, and managing organizer dashboards.

[![Live Demo](https://img.shields.io/badge/demo-festify.ca-blue)](https://festify.ca)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

**Live site:** [festify.ca](https://festify.ca) · [GitHub Pages](https://viveksalwan2000.github.io/festify/)  
**Demo video:** [YouTube walkthrough](https://www.youtube.com/watch?v=VuXNThtdMFQ)

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES modules) |
| **Backend / BaaS** | Firebase Auth, Cloud Firestore, Cloud Storage, Analytics |
| **Integrations** | EmailJS (transactional email), OpenAI DALL-E 3 (posters), Google Maps, QR codes |
| **Testing** | Jest, jsdom, Babel |
| **Deployment** | GitHub Pages (static hosting, custom domain via CNAME) |

---

## Features

- **Event discovery** — browse, search, and filter events; boosted listings appear first
- **User authentication** — email/password sign-up, sign-in, password reset (Firebase Auth)
- **Ticket checkout** — multi-tier pricing (general, child, senior), promo codes, mock payment UI
- **Email confirmations** — welcome and ticket purchase emails via EmailJS
- **User profile** — edit profile, view purchased tickets, submit event feedback
- **Organizer dashboards** — Free and PRO tiers with event CRUD, attendee lists, and analytics
- **PRO upgrades** — subscription tier stored in Firestore (`subscriptionStatus`)
- **AI poster generation** — DALL-E 3 event posters for PRO organizers
- **QR ticket verification** — scan tickets at event entry (`ticket-verify.html`)
- **Responsive UI** — mobile-friendly layouts across all pages

---

## Architecture Overview

Festify is a **static single-page-style app** (multiple HTML entry points) with no build step. All data flows through a central Firebase module.

```
┌─────────────────────────────────────────────────────────────┐
│  HTML pages (index, profile, dashboards, ticket-verify…)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ ES module imports
┌──────────────────────────▼──────────────────────────────────┐
│  app.js / script.js / basic-script.js  — UI & page logic    │
│  utils.js                              — shared formatters  │
│  email.js / dalle-api.js               — external APIs      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  firebase.js — single Firebase app, auth, Firestore, Storage  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Firebase (Auth · Firestore · Storage · Analytics)           │
└─────────────────────────────────────────────────────────────┘
```

**Firestore collections (high level):**

| Collection | Purpose |
|------------|---------|
| `events` | Published events (inventory, pricing, revenue) |
| `users` | Profiles and `subscriptionStatus` |
| `users/{uid}/tickets` | Per-user ticket history |
| `tickets` | Global ticket purchases (organizer attendee queries) |
| `feedback` | Post-event attendee feedback |
| `config/apiKeys` | Runtime API keys (EmailJS, OpenAI, Maps) |

---

## Screenshots

> Add screenshots here for your portfolio. Suggested captures:

| Screen | Placeholder |
|--------|-------------|
| Event discovery (home) | `![Home](./docs/screenshots/home.png)` |
| Ticket checkout | `![Checkout](./docs/screenshots/checkout.png)` |
| Organizer dashboard | `![Dashboard](./docs/screenshots/dashboard.png)` |
| QR verification | `![QR Verify](./docs/screenshots/ticket-verify.png)` |

---

## Setup Instructions

### Prerequisites

- **Node.js 18+** (for running tests)
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **Firebase project** (for full functionality)

### 1. Clone the repository

```bash
git clone https://github.com/viveksalwan2000/festify.git
cd festify
```

### 2. Install dependencies

```bash
npm install
```

Dependencies are dev-only (Jest). The app itself has no runtime npm packages.

### 3. Firebase setup

1. Create a [Firebase project](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password), **Cloud Firestore**, and **Cloud Storage**.
3. Register a web app and copy the **API key** into `config.js`:

   ```javascript
   FIREBASE_API_KEY: "your-api-key-here"
   ```

4. Configure third-party keys via `admin-keys.html` or by writing to Firestore document `config/apiKeys`:
   - `EMAIL_SERVICE_ID`, `EMAIL_PUBLIC_KEY` (EmailJS)
   - `OPENAI_API_KEY` (DALL-E posters)
   - `GOOGLE_MAPS_API_KEY` (maps)

5. Deploy **Firestore security rules** appropriate for your environment before production use.

### 4. Run locally

ES modules require HTTP — do not open HTML files directly via `file://`.

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or the port shown) and navigate to `index.html`.

### 5. Run tests

```bash
npm test
```

Coverage report: `coverage/lcov-report/index.html`

---

## Deployment

The app deploys as static files to **GitHub Pages**:

- `_config.yml` — Jekyll exclusions for GitHub Pages
- `CNAME` — custom domain (`festify.ca`)

Push to the default branch; no build step is required.

---

## How the System Works

### Authentication flow

1. User signs up or signs in via Firebase Auth (`signUpUser` / `signInUser` in `firebase.js`).
2. On sign-up, a `users/{uid}` profile document is created in Firestore.
3. `onUserStateChanged` listeners on each page react to login/logout (redirects, UI updates).
4. Organizers are routed by `subscriptionStatus`: **PRO** → `organization-dashboard.html`, **Free** → `basic-org-dash.html`.

### Event creation flow

1. Organizer opens their dashboard (`script.js` or `basic-script.js`).
2. Fills the event form (title, date, pricing, images).
3. Optional image upload goes to Firebase Storage (`uploadEventImage`).
4. Event document is written to the `events` collection (`createNewEvent`).
5. PRO users can generate AI posters via DALL-E (`dalle-api.js`).

### Ticket purchase flow

1. User browses events on `index.html` or `profile.html` (`app.js` loads events via `fetchEvents`).
2. User opens the event popup, selects ticket quantities, and proceeds to checkout.
3. Payment form validates input; user must be logged in (`getAuth().currentUser`).
4. On submit, `saveUserTicket` writes to both `users/{uid}/tickets` and the global `tickets` collection.
5. After a successful save, `updateTickets` decrements inventory and `updateRevenue` adds to `totalRevenue`.
6. Confirmation emails are sent asynchronously via EmailJS (non-blocking).

### Revenue update flow

1. Triggered inside the ticket purchase success handler in `app.js`.
2. `updateRevenue(eventId, payment)` reads the current `totalRevenue` from the event document.
3. Adds the payment amount and writes the new total back to Firestore.
4. Organizer dashboards read `totalRevenue` when rendering stats.

---

## Code Organization

| File | Purpose |
|------|---------|
| `index.html` | Public home page — event grid and discovery |
| `profile.html` | User profile, tickets tab, checkout with profile fields |
| `list-your-event.html` | Organizer landing and auth entry point |
| `organization-dashboard.html` | PRO organizer dashboard |
| `basic-org-dash.html` | Free-tier organizer dashboard |
| `ticket-verify.html` | QR code scanning for ticket validation |
| `admin-keys.html` | Admin UI for storing API keys in Firestore |
| **`firebase.js`** | Single Firebase init; all Auth, Firestore, and Storage operations |
| **`app.js`** | Event listing, popup, checkout, and ticket purchase orchestration |
| **`script.js`** | PRO organizer dashboard logic |
| **`basic-script.js`** | Free organizer dashboard (PRO features locked) |
| **`utils.js`** | Shared `formatTime`, `formatDate`, `formatCurrency` helpers |
| **`email.js`** | EmailJS welcome/ticket emails and QR code generation |
| **`dalle-api.js`** | OpenAI DALL-E 3 poster generation |
| **`config.js`** | Bootstrap Firebase API key; other keys loaded from Firestore |
| **`inline.js`** | Auth popup helpers (sign-in/sign-up handlers) |
| **`organizer.js`** | Organizer page auth wiring |
| **`Tests/`** | Jest unit tests with Firebase mocks |

---

## License

MIT — see [LICENSE.md](LICENSE.md).
