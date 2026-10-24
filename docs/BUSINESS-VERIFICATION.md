# Business data verification

This file records what the website publishes about Robbybikes, where each fact came from, and what still needs the owner's confirmation. **Do not publish anything in the "Needs verification" table until the dealership confirms it in writing.**

Last reviewed: October 2026 (initial build).

## Verified and in use

| Item | Value published | Source |
| --- | --- | --- |
| Business name | Robbybikes | Dealership's public business reference |
| Location | Juja Road, Eastleigh, Nairobi | Dealership's public business reference |
| Landmark | Near the Amana / Luqman petrol station | Dealership's public business reference |
| Phone 1 | 0768 462 250 (`+254768462250`) | Dealership's public business reference |
| Phone 2 | 0799 741 062 (`+254799741062`) | Supplied by the owner |
| Facebook page | `https://www.facebook.com/Robbybikes.ltd/` | Dealership's public business reference |
| Category | Used / second-hand motorcycle dealership | Supplied by the owner |
| Sales model | Enquiry and in-person inspection; no online payments | Supplied by the owner |

## Needs verification before launch

| Item | Current behaviour | What we need |
| --- | --- | --- |
| WhatsApp number | Defaults to `254768462250` via `WHATSAPP_NUMBER`. | Which SIM is registered on WhatsApp — 0768 462 250 or 0799 741 062? Update the environment variable if it is the second line. |
| Opening hours | Hidden (`openingHours: null` in `lib/business.ts`). | Days and hours, including any lunch or Friday closures. |
| TikTok profile | Hidden unless `SOCIAL_TIKTOK_URL` is set. | The exact profile URL, or confirmation that there is no official account. |
| Map pin | Directions use a Google Maps *search* link for "Robbybikes, Juja Road, Eastleigh, Nairobi". No coordinates are published. | Google Maps place link or latitude/longitude of the yard entrance. |
| Inventory | Demo listings only, all flagged **Sample**. | Real stock, prices, photographs and registration paperwork status. |
| Photography | AI-generated illustrative photos in `public/sample/`. | Photographs of the actual motorcycles, taken at the yard. |
| Brand mix | The site lists whatever brands are in the database. | Confirmation of which brands the dealership actually stocks and can source. |
| Financing / trade-ins | Not mentioned anywhere on the site. | Whether either is offered. `/trade-in` should only be built if trade-ins are confirmed. |
| Delivery | Not mentioned. | Whether the dealership delivers within Nairobi. |
| Warranty / mechanical checks | Explicitly **not** claimed. | Whether any warranty or inspection guarantee is offered, and its exact wording. |
| Legal name | "Robbybikes Ltd" appears in the footer, privacy notice and terms. | Confirm the registered entity name, or ask us to use the trading name only. |
| Price ranges | No price range is published. Previously drafted indicative figures (KSh 105,000–150,000) were removed because they were not verified stock. | Not required; listing prices cover this. |
| Reviews / testimonials | None published. | Only supply quotes with written permission from the customer. |

## Rules applied across the site

- Every demo listing carries a **Sample** badge, the demo banner appears above inventory, and every sample record is flagged in the database so it can be removed with `npm run db:sample:clear`.
- Unknown specifications are blank on the public site — never zero, never a guess.
- Availability is controlled by administrators only; sold motorcycles leave the available-stock list but stay in the archive.
- Asking prices are displayed per listing. Copy makes clear the final price is agreed after inspection.
- No founding date, sales figures, awards, manufacturer authorisation or customer counts are claimed anywhere.
- WhatsApp is a contact channel, not an enquiry. The site states that a submitted form is what reaches the team's inbox.

## How to update these facts

1. Business details live in `lib/business.ts` — change them there once, and they update the header, footer, contact page, privacy notice, terms, structured data and WhatsApp messages.
2. Secrets and deployment-specific values (`WHATSAPP_NUMBER`, `SOCIAL_TIKTOK_URL`, `NEXT_PUBLIC_SITE_URL`) live in environment variables — see `.env.example`.
3. After changing business details, run `npm run typecheck && npm run lint && npm run build`, then redeploy.
