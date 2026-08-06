import type { APIRoute } from 'astro';
import { isValidSlug, normalizeUrl, randomSlug } from '../../lib/slug';

export const prerender = false;

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  const contentType = request.headers.get('content-type') ?? '';
  let url = '';
  let slug = '';

  if (contentType.includes('application/json')) {
    const data = (await request.json().catch(() => null)) as
      | { url?: string; slug?: string }
      | null;
    url = data?.url ?? '';
    slug = data?.slug ?? '';
  } else {
    const data = await request.formData();
    url = (data.get('url') as string | null) ?? '';
    slug = (data.get('slug') as string | null) ?? '';
  }

  const normalized = normalizeUrl(url);
  if (!normalized) {
    return json({ error: 'A valid http(s) URL is required.' }, 400);
  }
  if (slug && !isValidSlug(slug)) {
    return json({ error: 'Custom slug must be 1-32 alphanumeric characters.' }, 400);
  }

  let finalSlug = slug;

  if (!finalSlug) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = randomSlug();
      const existing = await env.LINKS_KV.get(`redirect:${candidate}`);
      if (!existing) {
        finalSlug = candidate;
        break;
      }
    }
    if (!finalSlug) {
      return json({ error: 'Could not generate a unique slug. Try again.' }, 500);
    }
  } else {
    const existing = await env.LINKS_KV.get(`redirect:${finalSlug}`);
    if (existing) {
      return json({ error: 'That slug is already taken.' }, 409);
    }
  }

  await env.LINKS_KV.put(`redirect:${finalSlug}`, normalized);

  const origin = new URL(request.url).origin;
  return json(
    {
      slug: finalSlug,
      shortUrl: `${origin}/s/${finalSlug}`,
      url: normalized,
    },
    201,
  );
};
