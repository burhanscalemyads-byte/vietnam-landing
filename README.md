# Glabol Vietnam 5N/6D form page

This is a one-question-at-a-time lead form for the Vietnam 5N/6D trip, styled like Typeform. It is a single static `index.html` with no build step, plus images in `assets/`.

## Settings

The settings are in the `window.GLABOL_FORM` block near the top of `index.html`:

| Setting | What it does |
|---|---|
| `CRM_WEBHOOK_URL`, `CRM_API_KEY` | The Glabol CRM intake, with the same values as the Kashmir and Himachal pages. |
| `DESTINATION` | The destination name the CRM files the lead under ("Vietnam"). |
| `WEBHOOK_URL` | Optional second destination for the full answers as JSON. Empty for now. With no CRM and no webhook, the page runs in preview mode and sends nothing. |
| `SHEET_URL` | Google Apps Script web app for the "Glabol Vietnam Leads" sheet (owner's Google account, sheet ID `1FaocFcDgh23nhL4XZhRbFtEDL-rmvU9c4Gb02nHG9fI`). Each lead adds a row to the "Leads" tab and emails the sheet owner. Script: `tools/google-sheet-leads.gs`. When updating it, use Deploy → Manage deployments → New version, so the URL stays the same. |
| `PIXEL_IDS` | `963901896777793` (Glabol CTWA – CRM) and `4126422144254829` (Glabol_SMA_MetaPixel, used by every *.glabol.com page). |
| `WHATSAPP_NUMBER` | `919203405171`, used by the WhatsApp buttons. |
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
- **Button:** "Get my Vietnam plan". On phones it is full-width and taller (66px), with "1,600+ reviews on Google" underneath.

On 31 Oct the owner removed the "900+ people asked" kicker, the subheadline and the "Searched these?" strip.

**Tracking which ad sent the lead:** the page content doesn't change, but the link can still carry a tag. Use `?v=` with one of these values:

- `?v=brush`
- `?v=news`
- `?v=dontbook`
- `?v=search`
- `?v=warning`

`utm_content` also works if `v` is missing. The tag goes into the Sheet's "Ad" column and onto the Meta Pixel Lead event (`ad_version`). Untagged links show "default" in the Sheet and "not tagged" on the Pixel. The CRM message stays short, so it doesn't carry the tag.

## Welcome-screen pointers (31 Oct 2026)

The page shows four pointers. Each one answers a common complaint about other companies' Vietnam packages, and the owner confirmed on 31 Oct 2026 that all four are true on every trip:

| Pointer | Complaint it answers |
|---|---|
| **No surprise charges.** Every rupee listed before you pay. | Extra charges on the trip: luggage, minibar, cruise drinks, marked-up tours |
| **Exact hotel names** in writing. No "or similar". | Hotel swapped for a different property; vouchers refused before the trip |
| **Veg and Jain meals** arranged before you fly. | "No onion, no garlic" requests ignored; almost no veg food on cruises |
| **One WhatsApp contact** from booking to your flight home. | "No one ever replies" after payment; constant follow-ups |

The line under the button reads "9 quick questions". On 31 Oct the owner removed "Pay in parts" and "International flights extra" from it. The flights note is still in the budget question ("Not counting international flights").

**Phones:** a sticky "Get my Vietnam plan" bar appears at the bottom of the welcome screen whenever the main button is scrolled out of view. It hides on the question screens and on desktop.

## Meta events

Both datasets get the same events:

| Event | When | Notes |
|---|---|---|
| PageView | Page load | |
| FormStart (custom) | First tap on "Get my Vietnam plan" | Good for retargeting people who started the form and didn't finish |
| Contact | Tap on any WhatsApp button | `content_name` says which button: top, welcome or thank-you |
| Lead | The CRM or the Sheet has the lead | Sent through `fbq`, so Meta Pixel Helper and Events Manager → Test events show it. For each dataset, `fbq('init', id, userData)` adds SHA-256 hashed phone (91…), first name, last name, country `in` and external_id (hashed phone), then `fbq('trackSingle', id, 'Lead', …, {eventID})` sends it. The same event ID goes to both datasets and into the Sheet, so a later Conversions API upload can deduplicate. Custom data: `lead_score`, `ad_version`. A submission that didn't reach the CRM or the Sheet sends no Lead. If an ad blocker stopped fbevents.js, the page sends the Lead as a direct pixel request instead. |

**Click ID (fbclid):** when the link has `fbclid`, the page sets the `_fbc` cookie (`fb.1.<ms>.<fbclid>`, on .glabol.com, 90 days) unless the pixel already did. Every Meta event, Lead included, then carries the click ID. The CRM gets `fbclid`/`fbc` (see Leads), and so does the Sheet (fbclid and fbc columns).

Until 1 Nov 2026 the Lead went only as a direct pixel request. Meta received it (Events Manager shows Lead from vietnam-trip.glabol.com on 31 Oct in both datasets), but Pixel Helper and Test events couldn't see it. Calling `fbq('init')` again with user data does add it to the next event (checked 1 Nov 2026 on the live page).

## WhatsApp

- **Topbar:** a WhatsApp chip, icon-only on phones.
- **Welcome screen:** "Prefer WhatsApp? Chat with us" under the main button.
- **Thank-you screen:** "Chat with us on WhatsApp" replaces "View website". The message is pre-filled with the visitor's name, travel month and group size.

All three open `wa.me/919203405171`.

## Leads

Every submission is posted to the Glabol CRM (`crm.glabol.com`), the same way the Kashmir and Himachal pages do it. The page sends JSON with an `x-api-key` header, with these fields:

- `name` and `phone` (+91XXXXXXXXXX)
- `email`, left empty
- `destination`: "Vietnam"
- `host`
- `source`: Google Ads, Meta Ads or Website
- `fbclid` and `fbc` (Meta click ID), only when the visitor came from a Meta ad. If the CRM refuses that try for any reason, the next tries leave them out, so the extra fields can never cost a lead. Whether the CRM keeps them depends on the CRM.
- `message`: the same short line as the Kashmir and Himachal pages, at most 86 characters, for example "Interested in Vietnam package. Travel month: Dec 2026. Travellers: 2."

**Why the message is short.** On 31 Oct 2026 the CRM refused a 235-character message with HTTP 500 "Data too long for column 'source_detail' at row 1". Messages of about 100 characters go through. The full answers are in the Google Sheet. If the CRM developer widens `source_detail` (to TEXT, or VARCHAR(1000)), more detail can go in the message.

**Retries.** The page tries the CRM up to 3 times, 1.5 s and 4 s apart. It retries when the CRM is down, slow (no reply in 8 s), busy (5xx, 429) or unreachable. A 4xx reply such as a bad key won't change on a retry, so the page stops there and logs the error in the browser console.

**The CRM and the Sheet are separate.** The page posts to each one directly, at the same time. Neither waits for the other, nothing is passed between them, and the Sheet script never talks to the CRM.

**What the visitor sees:**

- They reach the thank-you screen as soon as the CRM has the lead.
- If the CRM is slow, they reach it after 12 seconds once the Sheet has the lead. The CRM tries carry on while the thank-you screen is open.
- If neither destination gets the lead, they're asked to tap again. If that fails too, they're let through and the lead is logged in the browser console.

The CRM accepts requests only from `*.glabol.com` pages, so a local test copy can't reach it.

Leads also go to the Google Sheet when `SHEET_URL` is set (URL-encoded POST, `no-cors`). `WEBHOOK_URL` remains an optional third destination for the full JSON payload.

## Hosting: vietnam-trip.glabol.com

This uses the same setup as kashmir.glabol.com and himachal.glabol.com:

1. **GitHub Pages:** go to Settings → Pages → Deploy from a branch, then `main` / root. The `CNAME` file sets the custom domain, vietnam-trip.glabol.com.
2. **Cloudflare DNS:** add a CNAME record `vietnam-trip` → `burhanscalemyads-byte.github.io`, proxied.

Every push to `main` goes live in about a minute. GitHub Pages serves every file in the repo publicly; nothing here is secret beyond the CRM key, which is visible in any browser-side page anyway.

When you link the page from Meta ads, put this in each ad's URL parameters:

```
utm_source=facebook&utm_medium=paid_social&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
```
