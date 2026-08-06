# Shortn — free URL shortener

A URL shortener built with [Astro](https://astro.build) and deployed on
[Cloudflare Workers](https://developers.cloudflare.com/workers/). No database —
links are stored in Cloudflare **Workers KV**.

Live at: <https://url-shortener.opencode-shortn.workers.dev>

## Features

- Shorten any `http(s)` URL to a random 6-character slug
- Optional custom slug (1–32 alphanumeric characters)
- `302` redirects from `/s/<slug>` with `no-store` caching
- Accepts JSON or form-encoded requests
- Zero infrastructure — storage is Workers KV

## How it works

| Component | Responsibility |
|---|---|
| `src/pages/api/shorten.ts` | `POST /api/shorten` — validates input, checks slug availability, writes `redirect:<slug>` to KV |
| `src/pages/s/[slug].ts` | `GET /s/:slug` — looks up KV, responds `302` to the stored target, `404` if missing |
| `src/lib/slug.ts` | Slug generation/validation and URL normalization |
| `src/components/ShortenForm.astro` | Client-side UI island on the landing page |

Routes are on-demand (`prerender = false`); the landing page is a static asset
served by the Worker's assets binding.

## API

### Create a short link

```http
POST /api/shorten
Content-Type: application/json

{ "url": "https://example.com/very/long/path" }
```

```http
POST /api/shorten
Content-Type: application/x-www-form-urlencoded

url=https://example.com/very/long/path&slug=my-link
```

Response `201 Created`:

```json
{
  "slug": "a1B2c3",
  "shortUrl": "https://url-shortener.opencode-shortn.workers.dev/s/a1B2c3",
  "url": "https://example.com/very/long/path"
}
```

Errors: `400` invalid URL/slug, `409` slug already taken, `500` could not
generate a unique slug.

### Resolve a short link

```http
GET /s/a1B2c3
```

`302 Found` with a `Location` header (no body). Returns `404` for an unknown or
malformed slug.

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run check        # astro check
npm run build        # builds to dist/
```

## Deploying

Requires a Cloudflare account with a Workers/KV API token (or `wrangler login`).

1. Create a KV namespace and put its ID in the `LINKS_KV` binding in
   `wrangler.jsonc` (point the `SESSION` binding at the same namespace — the
   `@astrojs/cloudflare` adapter requires it).
2. Deploy:

```bash
npm run deploy       # wrangler deploy
```

The worker is configured with `workers_dev: true`, so it is published to
`https://url-shortener.<your-subdomain>.workers.dev`.
