import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const slug = params.slug ?? '';

  if (!/^[a-zA-Z0-9]{1,32}$/.test(slug)) {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
  }

  const target = await env.LINKS_KV.get(`redirect:${slug}`);
  if (!target) {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
  }

  return new Response('', {
    status: 302,
    headers: { Location: target, 'cache-control': 'no-store' },
  });
};
