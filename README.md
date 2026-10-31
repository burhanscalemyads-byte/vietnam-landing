# Glabol Vietnam 5N/6D form page

This is a one-question-at-a-time lead form for the Vietnam 5N/6D trip, styled like Typeform. It is a single static `index.html` with no build step, plus images in `assets/`.

## Settings

The settings are in the `window.GLABOL_FORM` block near the top of `index.html`:

| Setting | What it does |
|---|---|
| `CRM_WEBHOOK_URL`, `CRM_API_KEY` | The Glabol CRM intake, with the same values as the Kashmir and Himachal pages. |
| `DESTINATION` | The destination name the CRM files the lead under ("Vietnam"). |
| `WEBHOOK_URL` | Optional second destination for the full answers as JSON. Empty for now. With no CRM and no webhook, the page runs in preview mode and sends nothing. |
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

## One page for every ad

Every Vietnam ad lands on the same page. The welcome screen has:

- **Headline:** "The Vietnam trip travellers are talking about."
- **Photo:** the Golden Bridge.
- **The four promises.**
- **Price and rating bar.**
- **Button:** "Get my Vietnam plan", with "Pay in parts · International flights extra" underneath.

On 31 Oct the owner removed the "900+ people asked" kicker, the subheadline and the "Searched these?" strip.

**Tracking which ad sent the lead:** the page content doesn't change, but the link can still carry a tag. Use `?v=` with one of these values:

- `?v=brush`
- `?v=news`
- `?v=dontbook`
- `?v=search`
- `?v=warning`

`utm_content` also works if `v` is missing. The tag is added to the end of the CRM message ("Ad: warning") and to the Meta Pixel Lead event. Untagged links show "Ad: not tagged".

## Welcome-screen pointers (31 Oct 2026)

The page shows four pointers. Each one answers a common complaint about other companies' Vietnam packages, and the owner confirmed on 31 Oct 2026 that all four are true on every trip:

| Pointer | Complaint it answers |
|---|---|
| **No surprise charges.** Every rupee listed before you pay. | Extra charges on the trip: luggage, minibar, cruise drinks, marked-up tours |
| **Exact hotel names** in writing. No "or similar". | Hotel swapped for a different property; vouchers refused before the trip |
| **Veg and Jain meals** arranged before you fly. | "No onion, no garlic" requests ignored; almost no veg food on cruises |
| **One WhatsApp contact** from booking to your flight home. | "No one ever replies" after payment; constant follow-ups |

The small line under the button reads "Pay in parts · International flights extra · 9 quick questions". It answers the fear of paying the full amount months ahead.

**Phones:** a sticky "Get my Vietnam plan" bar appears at the bottom of the welcome screen whenever the main button is scrolled out of view. It hides on the question screens and on desktop.

## Leads

Every submission is posted to the Glabol CRM (`crm.glabol.com`), the same way the Kashmir and Himachal pages do it. The page sends JSON with an `x-api-key` header, with these fields:

- `name` and `phone` (+91XXXXXXXXXX)
- `email`, left empty
- `destination`: "Vietnam"
- `host`
- `source`: Google Ads, Meta Ads or Website
- `message`, which carries all the answers and the lead score

The CRM accepts requests only from `*.glabol.com` pages, so a local test copy can't reach it. If sending fails, the visitor is asked to tap again. If it fails a second time, they're let through and the lead is logged in the browser console.

`WEBHOOK_URL` is an optional second destination for the full JSON payload, such as a Google Sheet script. It is not set up yet.

## Hosting: vietnam-trip.glabol.com

This uses the same setup as kashmir.glabol.com and himachal.glabol.com:

1. **GitHub Pages:** go to Settings → Pages → Deploy from a branch, then `main` / root. The `CNAME` file sets the custom domain, vietnam-trip.glabol.com.
2. **Cloudflare DNS:** add a CNAME record `vietnam-trip` → `burhanscalemyads-byte.github.io`, proxied.

Every push to `main` goes live in about a minute. GitHub Pages serves every file in the repo publicly; nothing here is secret beyond the CRM key, which is visible in any browser-side page anyway.

When you link the page from Meta ads, put this in each ad's URL parameters:

```
utm_source=facebook&utm_medium=paid_social&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
```
