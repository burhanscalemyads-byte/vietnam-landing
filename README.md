# Glabol Vietnam 5N/6D form page

This is a one-question-at-a-time lead form for the Vietnam 5N/6D trip, styled like Typeform. It is a single static `index.html` with no build step, plus images in `assets/`.

## Before going live

Open `index.html` and edit the `window.GLABOL_FORM` block near the top:

| Setting | What it does |
|---|---|
| `WEBHOOK_URL` | Where each lead is POSTed as JSON (your CRM web-form or webhook URL). If you leave it empty, the page runs in preview mode and sends nothing. |
| `PIXEL_ID` | Meta Pixel / dataset ID. It fires PageView on load and Lead on submit, with an `eventID` so Pixel and CAPI events deduplicate. Currently `4126422144254829`. |
| `FORM_NAME` | A label sent with every lead (`vietnam_5n6d_landing_v1`). |
| `WEBSITE_URL`, `PRIVACY_URL` | The links on the welcome screen and the consent line. |

## What gets sent

There are nine questions, matching the Vietnam instant form:

- Travel month
- Travellers
- Budget per person
- Passport
- When they plan to book
- Departure city
- Best time to call
- Name
- Phone number

Along with the answers, the page sends:

- A lead score (`hot` / `warm` / `cold`)
- UTM parameters from the URL
- `fbclid` from the URL, plus the `fbc` and `fbp` values
- The page URL and a timestamp

## Hosting

Any static host will serve it from the repo root: GitHub Pages (Settings → Pages → Deploy from branch → `main` / root), Netlify, Vercel or Cloudflare Pages.

When you link it from Meta ads, keep the UTM parameters on the ad URL so they reach your CRM.
