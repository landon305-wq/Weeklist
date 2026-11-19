// ==========================================
// WeekCart — Kroger price helper (Cloudflare Worker)
// Paste this whole file into a new Cloudflare Worker.
// In the worker's Settings → Variables and Secrets, add:
//   KROGER_CLIENT_ID      (secret)  from developer.kroger.com
//   KROGER_CLIENT_SECRET  (secret)  from developer.kroger.com
//   ALLOWED_ORIGIN        (text)    your site, e.g. https://yourname.github.io  (or * while testing)
// Optional, for the "Shop on Instacart" button:
//   INSTACART_API_KEY     (secret)  from the Instacart Developer Platform dashboard
//   INSTACART_BASE        (text)    the development server address from Instacart's docs while testing a Development key
//                                   (leave it out for production, which uses https://connect.instacart.com)
// It only allows read-only store and product lookups, so nobody can use your key for anything else.
// ==========================================
let token = null, tokenExpires = 0;

async function getToken(env) {
    if (token && Date.now() < tokenExpires - 60000) return token;
    const res = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(env.KROGER_CLIENT_ID + ':' + env.KROGER_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials&scope=product.compact'
    });
    if (!res.ok) throw new Error('token ' + res.status);
    const j = await res.json();
    token = j.access_token;
    tokenExpires = Date.now() + (j.expires_in || 1800) * 1000;
    return token;
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map(s => s.trim());
        const allowOrigin = allowed.includes('*') ? '*' : (allowed.includes(origin) ? origin : allowed[0]);
        const cors = { 'Access-Control-Allow-Origin': allowOrigin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
        if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
        const url = new URL(request.url);
        const json = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { ...cors, 'Content-Type': 'application/json' } });

        // Instacart: turn a WeekCart list into an Instacart shopping-list page
        if (url.pathname === '/instacart' && request.method === 'POST') {
            if (!env.INSTACART_API_KEY) return json({ error: 'No INSTACART_API_KEY set on the worker.' }, 400);
            const body = await request.text();
            if (body.length > 100000) return json({ error: 'List too long.' }, 413);
            const base = (env.INSTACART_BASE || 'https://connect.instacart.com').replace(/\/+$/, '');
            const res = await fetch(base + '/idp/v1/products/products_link', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + env.INSTACART_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body
            });
            return new Response(await res.text(), { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
        }
        if (request.method !== 'GET') return new Response('Only GET', { status: 405, headers: cors });

        if (!/^\/(locations|products)$/.test(url.pathname)) {
            return new Response(JSON.stringify({ ok: true, hint: 'Use /locations or /products' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
        }
        try {
            const t = await getToken(env);
            const upstream = await fetch('https://api.kroger.com/v1' + url.pathname + url.search, {
                headers: { 'Authorization': 'Bearer ' + t, 'Accept': 'application/json' },
                cf: { cacheTtl: 3600, cacheEverything: true }
            });
            const body = await upstream.text();
            return new Response(body, { status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
        } catch (e) {
            return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
        }
    }
};
