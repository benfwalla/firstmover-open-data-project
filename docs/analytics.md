# FirstMover analytics context

This file is the durable reference for future Codex sessions working on analytics.

## Google Analytics 4

- Account: `FirstMover` (`354923714`)
- Property: `FirstMover` (`488883309`)
- Web stream: `firstmovernyc` (`11204684332`)
- Measurement ID: `G-50ZD8FHLY1`
- Website: `https://www.firstmovernyc.com`
- Vercel variable: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- The tag is installed globally with `@next/third-parties/google`.

## Google Search Console

- Domain property: `firstmovernyc.com`
- Linked to the FirstMover GA4 property on November 22, 2026.
- Use Search Console for queries, impressions, clicks, rankings, coverage, and crawl/indexing issues.
- Use GA4 for acquisition and behavior after a visitor arrives.

## Intentional tracking scope

- Keep global GA4 page views and enhanced measurement enabled.
- The homepage tracks only App Store CTA clicks with the custom event `app_store_click` and a `placement` value of `navigation`, `hero`, or `footer`.
- Do not add granular custom events to quizzes, games, tools, forms, or downloads unless explicitly requested.
- Never send email addresses, exact rent amounts, complete addresses, or other user-entered personal information to analytics.

## Other sources of truth

- RevenueCat is the subscription and revenue authority.
- Supabase is the application/database authority.
- GA4 and Search Console are the marketing and organic-discovery authorities.
