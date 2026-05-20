---
module: 4
position: 1
title: "Enhanced Conversions and Consent Mode"
objective: "Server-side and privacy-aware tracking."
estimated_minutes: 7
---

# Enhanced Conversions and Consent Mode

## The privacy environment

Browser-side conversion tracking is degrading. iOS 14.5 ATT, Safari ITP, Firefox tracking protection, the gradual third-party cookie phase-out — each reduces what Google can learn from a passive pixel fire. In 2026, raw gtag.js conversion tracking captures only 60-80% of conversions in many accounts. The missing 20-40% is the privacy-restricted layer.

Google's response is a stack of privacy-aware tracking technologies that work alongside (and partially around) browser-side limits:

- **Enhanced Conversions** — hashed first-party user data sent with conversions.
- **Consent Mode v2** — adapts data collection based on user consent state.
- **Enhanced Conversions for Leads** — same idea, applied to lead-form conversions.
- **Server-side tagging** — fire conversions from your backend.

Implementing this stack is the highest-leverage tracking work for Smart Bidding performance. The lift is large; the effort is moderate.

## Enhanced Conversions

Enhanced Conversions takes user data you already collect on your site (email, phone, name, address) and sends it — hashed — alongside the conversion event. Google then uses the hashed data to match the conversion to a logged-in Google user, even if the original click tracking was lost to privacy controls.

Mechanics:

- User clicks ad → gclid stored in URL parameter, may be cookied.
- User completes purchase / lead form.
- Your site captures their email, phone, name.
- The conversion fires with the hashed (SHA-256) versions of those fields.
- Google matches the hashed data to logged-in users in its system.
- The conversion is attributed even if the original click tracking expired.

The lift: typically 10-30% more attributed conversions and improved match quality for Smart Bidding's signal.

## Implementation paths

Three ways to set up Enhanced Conversions:

**1. Google Tag (gtag.js) configuration.** Add user data parameters to your existing conversion tag. Simplest if you can capture user data at conversion time client-side.

**2. Google Tag Manager.** Add an Enhanced Conversions tag in GTM that pulls user data from your dataLayer at conversion time.

**3. Google Ads API import.** Server-side: send conversions via API with hashed user data attached. Most robust; required for offline conversions and complex setups.

Pick the path that fits your stack. Native e-commerce platforms (Shopify, BigCommerce) have one-click EC integrations. Custom sites need slightly more setup.

## What data to send

For Enhanced Conversions, send (hashed via SHA-256, no salting):

- Email (most important).
- Phone number (e164 format: +14155551234).
- First name.
- Last name.
- Street address.
- City.
- Region/state.
- Postal/ZIP code.
- Country.

Email alone provides significant lift. Adding phone, name, and address improves matching further. The more fields, the better.

Don't send fields you can't reliably capture; bad data hurts more than it helps. Quality over quantity.

## Consent Mode v2

Consent Mode is Google's framework for handling user consent state. When a user lands on your site:

- They see your cookie banner.
- They accept or decline cookies.
- Consent Mode adjusts what gtag fires based on that choice.

With Consent Mode v2, two consent parameters matter:

- `ad_storage`: whether ad-related cookies can be stored.
- `analytics_storage`: whether analytics cookies can be stored.

Plus newer parameters: `ad_user_data` and `ad_personalization`.

When consent is granted, full conversion data fires. When declined, modeling fills the gap (Google uses aggregate patterns from consented users to estimate the unconsented).

## Why Consent Mode v2 matters

In privacy-restricted regions (EU especially), a meaningful fraction of users decline cookies. Without Consent Mode, those users' conversions are lost entirely. With Consent Mode v2, Google can model what would have happened and partially reconstruct the signal.

The modeling isn't perfect but it's much better than nothing. Accounts running in the EU without Consent Mode v2 typically under-report by 20-40%.

For accounts outside privacy-strict regions (US currently), Consent Mode v2 is less critical but still useful. Set it up if your CMP supports it.

## Server-side tagging

Server-side Google Tag Manager (sGTM) takes tag management off the user's browser and onto a server you control. Benefits:

- Bypass browser-side tracking blocks.
- Reduce client-side JavaScript load.
- Enrich tags with server-only data (CRM lookups, internal IDs).
- Improve data quality and control.

Setup involves:

- Creating a server container in GTM.
- Deploying the server container (often as a Cloud Run service or via a managed sGTM provider like Stape).
- Pointing your client-side GTM at the server container.
- Server-side container forwards tags to Google Ads, Facebook, etc.

For accounts spending $20k+/month, server-side tagging is a strong investment. Below that, native integrations and gtag.js are usually fine.

## Offline conversion imports

For business types where conversion happens off-platform (B2B closes deal in CRM weeks later, in-store purchase, phone-call sale), import the offline conversion back to Google linked by GCLID.

Mechanics:

- User clicks ad → URL has `?gclid=ABC123`.
- Your landing page captures and stores the gclid (in hidden form field or cookie).
- User submits lead form → gclid passes through to your CRM as a lead attribute.
- Lead moves through sales process; eventually closes (or doesn't).
- When closed, you import the conversion via API or scheduled upload, with the gclid as the key.
- Google attributes the conversion to the original click.

Without this, B2B lead-gen accounts optimize toward leads, not closed deals — usually a very different optimization.

For high-volume offline imports, the Conversion Adjustment API allows updating conversion values after the fact (lead → opportunity → closed deal at different values).

## Conversion lag and offline import

Offline conversions arrive late. A B2B sales cycle might be 30-90 days. Google Smart Bidding adjusts for this:

- Set the **conversion window** on your Smart Bidding strategy appropriately (30, 60, or 90 days).
- Wait the full conversion window before judging historical campaign performance.
- Don't react to short-window CPA on slow-cycle campaigns.

Without the right window, you'll either undercount conversions or evaluate performance on incomplete data.

## Enhanced Conversions for Leads

Enhanced Conversions for Leads is the lead-form-specific version. Pass hashed lead data (email, phone) with the lead conversion fire. Google matches the lead to a logged-in user.

Then, when the lead closes offline weeks later, the offline conversion import (via API) carries the email/phone and links to the original lead — even without GCLID. This bridges the gap when GCLIDs aren't reliably captured.

For B2B lead gen, Enhanced Conversions for Leads + Conversion Adjustment API for stage updates is the modern stack.

## Audit checklist for tracking

Quarterly check:

1. Is the global site tag firing on every page (Tag Assistant)?
2. Are conversions firing once per conversion event?
3. Is Enhanced Conversions configured and sending hashed data?
4. Is the Enhanced Conversions diagnostic showing match rates above 30%?
5. Is Consent Mode v2 configured if you operate in privacy-strict regions?
6. Are offline conversions being imported (for B2B / lead-gen)?
7. Are values per conversion correct?
8. Are GCLIDs being captured and persisted server-side?
9. Is currency correctly declared per market?
10. Is the data-driven attribution model selected?

Most tracking work is one-time. The recurring discipline is checking it didn't quietly break.

## Common tracking failures

- **No Enhanced Conversions configured.** Default state for many accounts; major lift left untouched.
- **Enhanced Conversions firing without hashed user data.** Setup looks done; matching rate is low; lift never arrives.
- **Wrong consent state defaults.** Some CMPs default to "all declined" before banner interaction; effectively kills tracking on bounce visitors.
- **GCLIDs not persisted server-side.** Offline conversions can't link back.
- **Stale CRM lists for Customer Match.** Audience signal decays.

## Mistakes to avoid

- **Skipping Enhanced Conversions** because "we have gtag set up."
- **Sending unhashed user data.** Privacy violation and won't match anyway.
- **No Consent Mode v2 in EU.** Massive underreporting.
- **No offline conversion import** for slow-cycle businesses. Optimizing the wrong event.
- **Trusting tag setup didn't drift.** It drifts. Audit.

## Summary

- Enhanced Conversions = hashed user data sent with conversions; recovers iOS/Safari-lost attribution.
- Implement via gtag, GTM, or API.
- Send email at minimum; phone/name/address improve match further.
- Consent Mode v2 handles privacy state; essential in EU.
- Server-side tagging for $20k+/mo accounts.
- Offline conversion imports for B2B / lead-gen; GCLID linkage essential.
- Audit quarterly; tracking decays silently.

Next: data-driven attribution explained.
