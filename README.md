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

## Contributing

Feedback and contributions are welcome. Feel free to open an issue or submit a PR.

## Related

- [FirstMover iOS App](https://apps.apple.com/us/app/firstmover/id6740444528) — Instant push notifications for new NYC rental listings
- [firstmovernyc.com](https://firstmovernyc.com) — Main site

## License

MIT — see [LICENSE](LICENSE)
