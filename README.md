# FirstMover Open Data Project

NYC rental market data, open and free.

**Live site:** [firstmover-data.vercel.app](https://firstmover-data.vercel.app)

We track thousands of NYC rental listings every month and publish the data for anyone to use. This repo powers the site.

## Pages

- **Open Data** — Download monthly CSVs of NYC rental listings going back to early 2025
- **Reports** — Monthly rent reports with charts and neighborhood breakdowns
- **Blog** — Analysis and commentary on NYC rental trends
- **Resources** — Curated tools and guides for NYC renters
- **Interactive Tools** — Find Your Neighborhood, Guess the Rent, Rent by Salary, Is My Rent Fair

## Tech stack

- [Next.js](https://nextjs.org) — React framework
- [Vercel](https://vercel.com) — Hosting
- [Supabase](https://supabase.com) — Data source (PostgreSQL)
- [Mapbox](https://mapbox.com) — Interactive maps

## Getting started

```bash
git clone https://github.com/benfwalla/firstmover-open-data-project.git
cd firstmover-open-data-project
bun install
cp .env.example .env.local
# Fill in your env vars
bun dev
```

## Monthly data publishing

The `Publish monthly open data` GitHub Actions workflow generates and publishes the previous completed UTC month at 10:17 AM America/New_York time on the 2nd of each month. It runs again on the 5th to reconcile any late-arriving records. The workflow updates the CSV and the Open Data table, commits changes to `main`, and lets the existing Vercel integration deploy them.

The dataset uses UTC calendar-month boundaries because `listings.created_at` is a PostgreSQL `timestamptz` column and the public CSV documents it as `created_at_utc`. StreetEasy open-house fields are stored as timezone-naive New York local timestamps, so the generator explicitly interprets them in `America/New_York` before exporting their UTC values.

To publish or reconcile a completed month manually:

```bash
node --env-file=.env.local scripts/publish-completed-month.mjs --month YYYY-MM
```

## Contributing

Feedback and contributions are welcome. Feel free to open an issue or submit a PR.

## Related

- [FirstMover iOS App](https://apps.apple.com/us/app/firstmover/id6740444528) — Instant push notifications for new NYC rental listings
- [firstmovernyc.com](https://firstmovernyc.com) — Main site

## License

MIT — see [LICENSE](LICENSE)
