// ==========================================
// WeekCart — app
// Picks dinners (plus optional breakfasts & lunches) that fit your budget and food choices,
// adds up exactly what to buy (rounded to real package sizes, sharing ingredients between meals),
// and sorts the list in the order you walk the store.
// ==========================================
(function () {
    const ITEMS = {}; window.WC_ITEMS.forEach(i => { ITEMS[i.id] = i; });
    const RECIPES = window.WC_RECIPES;
    const R = {}; RECIPES.forEach(r => { R[r.id] = r; });
    const SECTIONS = window.WC_SECTIONS, LAYOUTS = window.WC_LAYOUTS, CATS = window.WC_CATEGORIES;
    const MEAT = ['chicken', 'beef', 'pork', 'turkey', 'fish'];
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const KEY_SET = 'weekcart_settings_v1', KEY_PLAN = 'weekcart_plan_v1', KEY_LIVE = 'weekcart_live_v1';

    const $ = id => document.getElementById(id);
    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const recall = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };

    // ---------- settings ----------
    let S = Object.assign({
        store: 'aldi', zip: '', budget: 100, people: 4, dinners: 5, breakfast: false, lunch: false,
        proteins: [], styles: [], avoid: [], staples: true, worker: '', krogerLoc: null
    }, recall(KEY_SET) || {});
    let PLAN = recall(KEY_PLAN);
    let LIVE = null;   // { locId, date, items: { id: {price, units, name, aisle, aisleNum, url, size} } }
    let tab = 'list';

    // ---------- prices ----------
    function liveFor(id) { return S.store === 'kroger' && LIVE && LIVE.items && LIVE.items[id] ? LIVE.items[id] : null; }
    function packOf(id) { const l = liveFor(id); return l ? l.units : ITEMS[id].p; }
    function priceOf(id) { const l = liveFor(id); return l ? l.price : ITEMS[id][S.store === 'aldi' ? 'a' : 'k']; }
    const countsCost = id => !(S.staples && ITEMS[id].staple);

    // ---------- recipe filters ----------
    function allergensOf(r) { const a = new Set(); r.ing.forEach(([id]) => (ITEMS[id].alg || []).forEach(x => a.add(x))); if (r.pro === 'fish') a.add('fish'); return a; }
    function allowed(r) {
        const al = allergensOf(r);
        if (S.avoid.some(x => al.has(x))) return false;
        return true;
    }
    function dinnerPool() {
        const base = RECIPES.filter(r => r.type === 'dinner' && allowed(r));
        const byPro = S.proteins.length ? base.filter(r => S.proteins.includes(r.pro)) : base;
        const byStyle = S.styles.length ? byPro.filter(r => r.tags.some(t => S.styles.includes(t))) : byPro;
        const notes = [];
        let pool = byStyle;
        if (pool.length < S.dinners) {
            if (S.styles.length) notes.push(`Only ${pool.length} recipe${pool.length === 1 ? '' : 's'} matched every style you picked, so some other meals with your proteins were added.`);
            pool = byStyle.concat(byPro.filter(r => !byStyle.includes(r)));
        }
        if (pool.length < S.dinners && base.length > pool.length) {
            notes.push('Not enough recipes matched your proteins, so a few others that fit your "avoid" list were added.');
            pool = pool.concat(base.filter(r => !pool.includes(r)));
        }
        if (pool.length < S.dinners) notes.push(`Only ${pool.length} dinner recipes avoid everything on your list, so your plan has ${pool.length} dinners.`);
        return { pool, preferred: new Set(byStyle.map(r => r.id)), notes };
    }

    // ---------- quantities ----------
    // every planned meal: [recipe id, multiplier]
    function mealsOf(plan) {
        const sc = S.people / 4, out = [];
        plan.dinners.forEach(id => out.push([id, sc]));
        const split = (ids, days) => ids.forEach((id, i) => out.push([id, sc * (Math.ceil(days / ids.length) - (i >= days % ids.length && days % ids.length ? 1 : 0))]));
        if (plan.breakfasts && plan.breakfasts.length) split(plan.breakfasts, 7);
        if (plan.lunches && plan.lunches.length) split(plan.lunches, 5);
        return out;
    }
    function needs(plan) {
        const need = {}, uses = {};
        mealsOf(plan).forEach(([rid, m]) => R[rid].ing.forEach(([id, q]) => {
            need[id] = (need[id] || 0) + q * m;
            (uses[id] = uses[id] || new Set()).add(R[rid].n);
        }));
        return { need, uses };
    }
    const pkgs = (id, amt) => amt <= 0 ? 0 : Math.max(1, Math.ceil(amt / packOf(id) - 0.08));
    function costOfNeed(need, have) {
        let t = 0;
        for (const id in need) if (countsCost(id) && !(have && have[id])) t += pkgs(id, need[id]) * priceOf(id);
        return t;
    }
    function addCost(need, rid, m) {   // extra cost of adding one recipe to the current needs
        let d = 0;
        R[rid].ing.forEach(([id, q]) => {
            if (!countsCost(id)) return;
            const before = need[id] || 0;
            d += (pkgs(id, before + q * m) - pkgs(id, before)) * priceOf(id);
        });
        return d;
    }

    // ---------- the planner ----------
    function buildPlan() {
        const { pool, preferred, notes } = dinnerPool();
        const sc = S.people / 4;
        const bPool = RECIPES.filter(r => r.type === 'breakfast' && allowed(r) && (!S.proteins.length || r.pro === 'veg' || S.proteins.includes(r.pro)));
        const lPool = RECIPES.filter(r => r.type === 'lunch' && allowed(r) && (!S.proteins.length || r.pro === 'veg' || S.proteins.includes(r.pro)));
        const singlePro = S.proteins.length === 1;
        const recent = new Set(PLAN && PLAN.dinners ? PLAN.dinners : []);
        const tries = [];
        for (let t = 0; t < 350; t++) {
            const need = {}, plan = { dinners: [], breakfasts: [], lunches: [] };
            const proCount = {};
            // the more room in the budget, the less the planner cares about squeezing pennies
            const perMeal = S.budget / Math.max(1, S.dinners + (S.breakfast ? 2 : 0) + (S.lunch ? 2 : 0));
            const noise = Math.max(3, perMeal * 0.15);
            const add = (rid, m) => R[rid].ing.forEach(([id, q]) => { need[id] = (need[id] || 0) + q * m; });
            // breakfasts and lunches first, so dinners can share their ingredients
            const pickSide = (list, n, days) => {
                const chosen = [];
                for (let i = 0; i < n && list.length; i++) {
                    const m = sc * Math.ceil(days / n);
                    const opts = list.filter(r => !chosen.includes(r.id)).map(r => ({ id: r.id, c: addCost(need, r.id, m) + Math.random() * noise }));
                    if (!opts.length) break;
                    opts.sort((a, b) => a.c - b.c);
                    const pick = opts[Math.floor(Math.random() * Math.min(3, opts.length))].id;
                    chosen.push(pick); add(pick, m);
                }
                return chosen;
            };
            if (S.breakfast) plan.breakfasts = pickSide(bPool, 2, 7);
            if (S.lunch) plan.lunches = pickSide(lPool, 2, 5);
            for (let i = 0; i < S.dinners; i++) {
                const opts = pool.filter(r => !plan.dinners.includes(r.id)).map(r => {
                    let c = addCost(need, r.id, sc) + Math.random() * noise * 1.6;
                    if (!singlePro) c += (proCount[r.pro] || 0) * 5 + ((proCount[r.pro] || 0) >= 2 ? 12 : 0);
                    if (!preferred.has(r.id)) c += 15;
                    if (recent.has(r.id)) c += perMeal * 0.6;   // freshen things up vs. the last plan
                    if (r.tags.includes('slowcooker') && plan.dinners.some(d => R[d].tags.includes('slowcooker'))) c += 6;
                    return { id: r.id, c };
                });
                if (!opts.length) break;
                // pick by weighted chance: cheaper / better-fitting meals are likelier, but not guaranteed
                const min = Math.min(...opts.map(o => o.c)), temp = Math.max(3, perMeal * 0.3);
                const w = opts.map(o => Math.exp(-(o.c - min) / temp));
                let r = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
                while (k < w.length - 1 && (r -= w[k]) > 0) k++;
                const pick = opts[k].id;
                plan.dinners.push(pick); add(pick, sc);
                proCount[R[pick].pro] = (proCount[R[pick].pro] || 0) + 1;
            }
            const cost = costOfNeed(need);
            const variety = new Set(plan.dinners.map(d => R[d].pro)).size + new Set(plan.dinners.flatMap(d => R[d].tags)).size * 0.3;
            tries.push({ plan, cost, variety });
        }
        const under = tries.filter(x => x.cost <= S.budget);
        let best;
        if (under.length) {
            // among plans that fit, favor variety; a little randomness so every plan is different
            under.forEach(x => { x.score = x.variety * 2 + Math.random() * 4 - (x.cost / S.budget) * 2; });
            under.sort((a, b) => b.score - a.score);
            best = under[Math.floor(Math.random() * Math.min(4, under.length))];
        } else {
            tries.sort((a, b) => a.cost - b.cost);
            best = tries[0];
        }
        best.plan.dinners = orderWeek(best.plan.dinners);
        return Object.assign(best.plan, {
            created: new Date().toISOString(), notes, have: {}, got: {}, store: S.store,
            overBudget: best.cost > S.budget, minCost: Math.min(...tries.map(x => x.cost))
        });
    }
    // quick meals on weeknights, slow cooker / long recipes later in the week
    function orderWeek(ids) {
        const long = ids.filter(id => R[id].time > 45), short = ids.filter(id => R[id].time <= 45);
        return shuffle(short).concat(long);
    }

    // ---------- swapping one dinner ----------
    function swapDinner(idx) {
        const { pool } = dinnerPool();
        const sc = S.people / 4;
        const others = PLAN.dinners.filter((_, i) => i !== idx);
        const base = needs(Object.assign({}, PLAN, { dinners: others })).need;
        const baseCost = costOfNeed(base, PLAN.have);
        const opts = pool.filter(r => !PLAN.dinners.includes(r.id)).map(r => ({ id: r.id, c: baseCost + addCost(base, r.id, sc) }));
        if (!opts.length) return toast('No other recipes match your choices.');
        const fit = opts.filter(o => o.c <= S.budget);
        const list = (fit.length ? fit : opts.sort((a, b) => a.c - b.c).slice(0, 3));
        const pick = list[Math.floor(Math.random() * list.length)].id;
        PLAN.dinners[idx] = pick;
        store(KEY_PLAN, PLAN);
        render();
        toast(`Swapped in ${R[pick].n}`);
    }

    // ---------- shopping list ----------
    function shoppingList() {
        const { need, uses } = needs(PLAN);
        const rows = Object.keys(need).map(id => {
            const it = ITEMS[id], n = pkgs(id, need[id]), live = liveFor(id);
            const leftover = n * packOf(id) - need[id];
            return {
                id, it, n, need: need[id], price: priceOf(id), total: n * priceOf(id), live,
                uses: [...uses[id]], staple: S.staples && it.staple,
                leftover: leftover / packOf(id) > 0.35 && n >= 1 ? leftover : 0
            };
        });
        const pantry = rows.filter(r => r.staple);
        const buy = rows.filter(r => !r.staple);
        const total = buy.filter(r => !PLAN.have[r.id]).reduce((s, r) => s + r.total, 0);
        // group by aisle (live Kroger) or by section in this store's usual layout
        const layout = LAYOUTS[S.store];
        const groups = {};
        const liveMode = S.store === 'kroger' && LIVE;
        const tailOrder = { produce: -3, bakery: -2, deli: -1, meat: 900, frozen: 901, dairy: 902 };
        buy.forEach(r => {
            let key, label, icon, order;
            const num = r.live ? parseInt(r.live.aisleNum, 10) : NaN;
            if (liveMode && !isNaN(num)) {
                key = 'a:' + num; label = 'Aisle ' + num; icon = '🔢'; order = num;
            } else {
                key = 's:' + r.it.s; label = SECTIONS[r.it.s].name; icon = SECTIONS[r.it.s].icon;
                order = liveMode ? (r.it.s in tailOrder ? tailOrder[r.it.s] : 500 + layout.order.indexOf(r.it.s)) : layout.order.indexOf(r.it.s);
            }
            (groups[key] = groups[key] || { label, icon, order, rows: [], secs: {} }).rows.push(r);
            groups[key].secs[SECTIONS[r.it.s].name] = 1;
        });
        Object.values(groups).forEach(g => { if (g.label.startsWith('Aisle ')) g.label += ' · ' + Object.keys(g.secs).join(', '); });
        const list = Object.values(groups).sort((a, b) => a.order - b.order);
        list.forEach(g => g.rows.sort((a, b) => a.it.n.localeCompare(b.it.n)));
        return { groups: list, pantry, total, count: buy.length };
    }
    const titleCase = s => String(s).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    // ---------- formatting amounts ----------
    function frac(x) {
        const w = Math.floor(x + 1e-6), f = x - w;
        const table = [[0, ''], [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'], [1, '']];
        let best = table[0]; table.forEach(t => { if (Math.abs(f - t[0]) < Math.abs(f - best[0])) best = t; });
        const whole = best[0] === 1 ? w + 1 : w;
        if (!whole && !best[1]) return x > 0 ? '⅛' : '0';
        return (whole ? whole : '') + best[1];
    }
    function amount(id, q) {
        const it = ITEMS[id];
        const unit = it.pl ? (q > 1.01 ? it.pl : it.u) : it.u;
        const measure = /^(slices?|cloves?|stalks?|heads?|bunch(es)?|packs?|packets?|cans?|jars?|cups?|tbsp|tsp|oz|lb)$/.test(unit);
        return measure ? `${frac(q)} ${unit} ${ingName(it)}` : `${frac(q)} ${unit}`;
    }
    const ingName = it => it.n.replace(/ \(.+\)$/, '').toLowerCase();

    // ==========================================
    // RENDER
    // ==========================================
    function chips(group, list, selected) {
        return list.map(c => `<button type="button" class="chip ${selected.includes(c.id) ? 'on' : ''}" data-chip="${group}" data-id="${c.id}" aria-pressed="${selected.includes(c.id)}">${c.icon} ${esc(c.name)}</button>`).join('');
    }
    function storeHint() {
        const liveOn = S.store === 'kroger' && S.worker;
        return S.store === 'aldi'
                    ? 'ALDI doesn\'t share prices online, so these are typical ALDI prices. ' + (S.zip ? `<a href="https://www.google.com/maps/search/ALDI+near+${encodeURIComponent(S.zip)}" target="_blank" rel="noopener">Find the ALDI nearest ${esc(S.zip)} ↗</a>` : '')
                    : liveOn ? `<span class="live-dot"></span> Live prices and real aisle numbers from ${S.krogerLoc ? esc(S.krogerLoc.name) : 'your nearest Kroger-family store'}.`
                    : 'Using typical Kroger prices. <a href="#" data-act="settings">Turn on live prices & real aisles</a> (free).';
    }
    function renderForm() {
        const lay = LAYOUTS[S.store];
        const liveOn = S.store === 'kroger' && S.worker;
        $('form').innerHTML = `
            <div class="field">
                <label>Store</label>
                <div class="seg">
                    <button type="button" data-store="aldi" class="${S.store === 'aldi' ? 'on' : ''}">ALDI</button>
                    <button type="button" data-store="kroger" class="${S.store === 'kroger' ? 'on' : ''}">Kroger <small>& family</small></button>
                </div>
                <p class="hint" id="store-hint">${storeHint()}</p>
            </div>
            <div class="row">
                <div class="field"><label for="f-zip">ZIP code</label><input id="f-zip" inputmode="numeric" maxlength="5" placeholder="e.g. 45202" value="${esc(S.zip)}"></div>
                <div class="field"><label for="f-budget">Weekly budget</label><div class="money-in"><span>$</span><input id="f-budget" type="number" min="20" max="1000" step="5" value="${S.budget}"></div></div>
            </div>
            <div class="row">
                <div class="field"><label>People</label><div class="stepper" data-step="people"><button type="button" data-d="-1" aria-label="fewer people">−</button><b>${S.people}</b><button type="button" data-d="1" aria-label="more people">+</button></div></div>
                <div class="field"><label>Dinners</label><div class="stepper" data-step="dinners"><button type="button" data-d="-1" aria-label="fewer dinners">−</button><b>${S.dinners}</b><button type="button" data-d="1" aria-label="more dinners">+</button></div></div>
            </div>
            <div class="field toggles">
                <label class="tog"><input type="checkbox" id="f-breakfast" ${S.breakfast ? 'checked' : ''}><span></span> Add breakfasts for the week</label>
                <label class="tog"><input type="checkbox" id="f-lunch" ${S.lunch ? 'checked' : ''}><span></span> Add weekday lunches</label>
            </div>
            <div class="field"><label>Proteins <small>(pick any, or none for all)</small></label><div class="chips">${chips('proteins', CATS.protein, S.proteins)}</div></div>
            <div class="field"><label>Meal styles <small>(optional)</small></label><div class="chips">${chips('styles', CATS.style, S.styles)}</div></div>
            <div class="field"><label>Avoid <small>(allergies & dislikes)</small></label><div class="chips avoid">${chips('avoid', CATS.avoid, S.avoid)}</div></div>
            <div class="field toggles"><label class="tog"><input type="checkbox" id="f-staples" ${S.staples ? 'checked' : ''}><span></span> I already have basics (oil, flour, salt, spices, ketchup…)</label></div>
            <button type="button" class="btn primary big" id="go">🛒 Make my plan</button>
            <p class="hint center">${esc(lay.name)} layout: ${esc(lay.note)}</p>`;
        bindForm();
    }

    function renderResults() {
        const box = $('results');
        if (!PLAN) { box.innerHTML = emptyState(); return; }
        if (PLAN.store !== S.store) { box.innerHTML = `<div class="card empty"><p>You switched stores. Press <b>Make my plan</b> to rebuild your list for ${esc(LAYOUTS[S.store].name)}.</p></div>`; return; }
        const L = shoppingList();
        const pct = Math.min(100, L.total / S.budget * 100);
        const servings = PLAN.dinners.length * S.people + (PLAN.breakfasts.length ? 7 * S.people : 0) + (PLAN.lunches.length ? 5 * S.people : 0);
        const over = L.total > S.budget;
        const src = S.store === 'kroger' && LIVE ? `Live prices from ${S.krogerLoc ? esc(S.krogerLoc.name) : 'Kroger'} · ${esc(LIVE.date)}` : `Estimated typical ${esc(LAYOUTS[S.store].name)} prices`;
        const head = `<div class="card summary">
            <div class="sum-top"><div><div class="kicker">THIS WEEK AT ${esc(LAYOUTS[S.store].name.toUpperCase())}</div><div class="sum-total ${over ? 'over' : ''}">${money(L.total)}<small> of ${money(S.budget)}</small></div></div>
            <div class="sum-side"><b>${money(L.total / Math.max(1, servings))}</b><span>per serving</span></div></div>
            <div class="budget-bar ${over ? 'over' : ''}"><i style="width:${pct}%"></i></div>
            <p class="hint">${over ? `⚠️ This is the cheapest plan that matches your choices. Try fewer dinners, more people sharing, or adding "Meatless" and "Chicken".` : `🎉 ${money(S.budget - L.total)} left over.`} ${src}. Prices are approximate, so check the shelf tag.</p>
            ${PLAN.notes && PLAN.notes.length ? `<p class="hint note">ℹ️ ${PLAN.notes.map(esc).join(' ')}</p>` : ''}
        </div>`;
        const tabs = `<div class="tabs" role="tablist">
            <button role="tab" data-tab="list" class="${tab === 'list' ? 'on' : ''}">🛒 List <small>${L.count}</small></button>
            <button role="tab" data-tab="recipes" class="${tab === 'recipes' ? 'on' : ''}">🍽️ Recipes <small>${PLAN.dinners.length + PLAN.breakfasts.length + PLAN.lunches.length}</small></button>
            <button role="tab" data-tab="week" class="${tab === 'week' ? 'on' : ''}">📅 Week</button></div>`;
        let body = tab === 'recipes' ? recipesView() : tab === 'week' ? weekView() : listView(L);
        box.innerHTML = head + tabs + body;
        bindResults();
    }
    function emptyState() {
        return `<div class="card empty"><div class="empty-art">🥕🧅🥖🧀🍗</div><h2>Your week, planned in one click</h2>
            <p>Set your budget and what you like to eat. WeekCart picks dinners that share ingredients (so nothing goes to waste), adds up exactly what to buy in real package sizes, and puts the list in the order you walk the store.</p></div>`;
    }

    function listView(L) {
        const groups = L.groups.map(g => `<section class="aisle"><h3>${g.icon} ${esc(g.label)}</h3>${g.rows.map(r => {
            const have = PLAN.have[r.id], got = PLAN.got[r.id];
            const name = r.live ? r.live.name : r.it.n;
            const pk = r.live ? (r.live.size || '') : r.it.pk;
            return `<div class="item ${got ? 'got' : ''} ${have ? 'have' : ''}">
                <label class="check"><input type="checkbox" data-got="${r.id}" ${got ? 'checked' : ''} aria-label="Got ${esc(r.it.n)}"><span></span></label>
                <div class="item-main"><div class="item-name">${r.n > 1 ? `<b>${r.n}×</b> ` : ''}${esc(name)}</div>
                <div class="item-sub">${esc(pk)}${r.live && r.live.url ? ` · <a href="${esc(r.live.url)}" target="_blank" rel="noopener">view</a>` : ''} · for ${esc(r.uses.slice(0, 3).join(', '))}${r.uses.length > 3 ? ' +' + (r.uses.length - 3) : ''}${r.leftover ? ' · some left over' : ''}</div></div>
                <div class="item-right"><div class="item-price">${have ? '<s>' + money(r.total) + '</s>' : money(r.total)}</div><button class="have-btn" data-have="${r.id}">${have ? 'Need it' : 'Have it'}</button></div></div>`;
        }).join('')}</section>`).join('');
        const pantry = L.pantry.length ? `<details class="card pantry"><summary>🧂 Check your pantry for ${L.pantry.length} basics (not in the total)</summary><ul>${L.pantry.map(r => `<li>${esc(r.it.n)}</li>`).join('')}</ul></details>` : '';
        return `<div class="list-tools"><button class="btn small" data-act="print">🖨️ Print</button><button class="btn small" data-act="copy">📋 Copy list</button><button class="btn small" data-act="regen">🔄 New plan</button></div>
            <p class="hint">Tap an item when it's in your cart. Tap "Have it" for things already at home, and it comes off your total.</p>
            <div class="card list">${groups}</div>${pantry}`;
    }

    function recipeCard(rid, kind, idx) {
        const r = R[rid];
        const m = kind === 'dinner' ? S.people / 4 : S.people / 4;
        const { need } = needs({ dinners: [rid], breakfasts: [], lunches: [] });
        const cost = Object.keys(need).filter(countsCost).reduce((s, id) => s + need[id] / packOf(id) * priceOf(id), 0) * (kind === 'dinner' ? 1 : 1);
        const per = cost / Math.max(1, S.people);
        const timeTxt = r.time >= 120 ? `${Math.round(r.time / 60)} hr (hands-off)` : `${r.time} min`;
        const tags = r.tags.map(t => (CATS.style.find(c => c.id === t) || {}).name).filter(Boolean);
        return `<article class="card recipe">
            <div class="rec-head"><span class="rec-emoji">${r.emoji}</span><div class="rec-title"><div class="kicker">${kind === 'dinner' ? 'DINNER' : kind.toUpperCase()}${kind !== 'dinner' ? ' · ' + (kind === 'breakfast' ? 'about 3–4 mornings' : 'about 2–3 days') : ''}</div><h3>${esc(r.n)}</h3>
            <div class="rec-meta">⏱️ ${timeTxt} · 👥 ${S.people} · ~${money(per)}/serving</div><div class="rec-tags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div></div></div>
            <details><summary>Ingredients & steps</summary>
                <ul class="ing">${r.ing.map(([id, q, note]) => `<li>${esc(amount(id, q * m))}${note ? ` <small>(${esc(note)})</small>` : ''}</li>`).join('')}</ul>
                <ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
            </details>
            ${kind === 'dinner' ? `<button class="btn small ghost" data-swap="${idx}">🔄 Swap this meal</button>` : ''}
        </article>`;
    }
    function recipesView() {
        let html = PLAN.dinners.map((id, i) => recipeCard(id, 'dinner', i)).join('');
        if (PLAN.breakfasts.length) html += `<h3 class="group-h">🌅 Breakfasts</h3>` + PLAN.breakfasts.map(id => recipeCard(id, 'breakfast')).join('');
        if (PLAN.lunches.length) html += `<h3 class="group-h">🥪 Lunches</h3>` + PLAN.lunches.map(id => recipeCard(id, 'lunch')).join('');
        return html;
    }
    function weekView() {
        const n = PLAN.dinners.length;
        // spread dinners over the week, leftovers on the gaps
        const slots = Array(7).fill(null);
        const spots = n >= 7 ? [0, 1, 2, 3, 4, 5, 6] : [[0, 2, 4], [0, 2, 4, 6], [0, 1, 3, 4, 6], [0, 1, 2, 3, 4, 6], [0, 1, 2, 3, 4, 5, 6]][Math.max(0, n - 3)] || [0, 1, 2];
        PLAN.dinners.forEach((id, i) => { slots[spots[i]] = id; });
        const rows = DAYS.map((d, i) => {
            const id = slots[i];
            const prev = slots.slice(0, i).reverse().find(Boolean);
            const b = PLAN.breakfasts.length ? R[PLAN.breakfasts[i % PLAN.breakfasts.length]] : null;
            const l = PLAN.lunches.length && i < 5 ? R[PLAN.lunches[i % PLAN.lunches.length]] : null;
            return `<div class="day"><div class="day-name">${d.slice(0, 3)}</div><div class="day-meals">
                ${b ? `<div class="mini">🌅 ${esc(b.n)}</div>` : ''}${l ? `<div class="mini">🥪 ${esc(l.n)}</div>` : ''}
                <div class="dinner">${id ? `${R[id].emoji} <b>${esc(R[id].n)}</b>${R[id].tags.includes('slowcooker') ? ' <small>start it in the morning</small>' : ''}` : `♻️ <b>Leftovers night</b>${prev ? ` <small>(${esc(R[prev].n)})</small>` : ''}`}</div></div></div>`;
        }).join('');
        return `<div class="card week">${rows}</div><p class="hint center">Quick meals go early in the week. Slow-cooker and longer recipes land on the days with more time.</p>`;
    }

    function render() { renderForm(); renderResults(); }

    // ==========================================
    // EVENTS
    // ==========================================
    function saveSettings() { store(KEY_SET, S); }
    function bindForm() {
        document.querySelectorAll('[data-store]').forEach(b => b.onclick = () => { S.store = b.dataset.store; saveSettings(); loadLiveCache(); render(); });
        document.querySelectorAll('[data-chip]').forEach(b => b.onclick = () => {
            const g = b.dataset.chip, id = b.dataset.id, arr = S[g];
            const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
            saveSettings(); b.classList.toggle('on'); b.setAttribute('aria-pressed', arr.includes(id));
        });
        document.querySelectorAll('[data-step]').forEach(st => st.querySelectorAll('button').forEach(b => b.onclick = () => {
            const k = st.dataset.step, lim = k === 'people' ? [1, 10] : [2, 7];
            S[k] = Math.max(lim[0], Math.min(lim[1], S[k] + +b.dataset.d));
            st.querySelector('b').textContent = S[k]; saveSettings();
        }));
        $('f-zip').oninput = e => { S.zip = e.target.value.replace(/\D/g, '').slice(0, 5); e.target.value = S.zip; saveSettings(); };
        $('f-zip').onchange = () => { $('store-hint').innerHTML = storeHint(); bindSettingsLinks(); };
        $('f-budget').oninput = e => { const v = parseFloat(e.target.value); if (v > 0) { S.budget = v; saveSettings(); } };
        $('f-breakfast').onchange = e => { S.breakfast = e.target.checked; saveSettings(); };
        $('f-lunch').onchange = e => { S.lunch = e.target.checked; saveSettings(); };
        $('f-staples').onchange = e => { S.staples = e.target.checked; saveSettings(); if (PLAN) renderResults(); };
        $('go').onclick = generate;
        bindSettingsLinks();
    }
    function bindSettingsLinks() { document.querySelectorAll('[data-act="settings"]').forEach(a => a.onclick = e => { e.preventDefault(); openSettings(); }); }
    function bindResults() {
        document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; renderResults(); });
        document.querySelectorAll('[data-got]').forEach(c => c.onchange = () => { PLAN.got[c.dataset.got] = c.checked; store(KEY_PLAN, PLAN); c.closest('.item').classList.toggle('got', c.checked); });
        document.querySelectorAll('[data-have]').forEach(b => b.onclick = () => { const id = b.dataset.have; PLAN.have[id] = !PLAN.have[id]; store(KEY_PLAN, PLAN); renderResults(); });
        document.querySelectorAll('[data-swap]').forEach(b => b.onclick = () => swapDinner(+b.dataset.swap));
        document.querySelectorAll('[data-act]').forEach(b => b.onclick = e => {
            const a = b.dataset.act;
            if (a === 'print') window.print();
            if (a === 'copy') copyList();
            if (a === 'regen') generate();
            if (a === 'settings') { e.preventDefault(); openSettings(); }
        });
    }
    async function generate() {
        const btn = $('go');
        if (S.store === 'kroger' && S.worker) {
            btn.disabled = true;
            try { await ensureLive(msg => { btn.textContent = msg; }); }
            catch (e) { toast('Live prices failed, so estimates are being used. ' + (e.message || '')); LIVE = null; }
            btn.disabled = false;
        }
        btn.textContent = '🛒 Make my plan';
        PLAN = buildPlan();
        store(KEY_PLAN, PLAN);
        tab = 'list';
        renderResults();
        $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function copyList() {
        const L = shoppingList();
        const lines = [`WeekCart: ${LAYOUTS[S.store].name} list (${money(L.total)})`, ''];
        L.groups.forEach(g => { lines.push(`${g.icon} ${g.label.toUpperCase()}`); g.rows.filter(r => !PLAN.have[r.id]).forEach(r => lines.push(`☐ ${r.n > 1 ? r.n + '× ' : ''}${r.live ? r.live.name : r.it.n} (${r.live ? r.live.size : r.it.pk}) ${money(r.total)}`)); lines.push(''); });
        lines.push('DINNERS: ' + PLAN.dinners.map(id => R[id].n).join(', '));
        const text = lines.join('\n');
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('List copied. Paste it into your notes or a text.'), () => toast('Couldn\'t copy. Try Print instead.'));
    }
    function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800); }

    // ==========================================
    // LIVE KROGER PRICES (through your own free Cloudflare Worker — see the setup guide)
    // ==========================================
    function usedItemIds() { const s = new Set(); RECIPES.forEach(r => r.ing.forEach(([id]) => s.add(id))); return [...s]; }
    function loadLiveCache() {
        const c = recall(KEY_LIVE);
        const today = new Date().toISOString().slice(0, 10);
        LIVE = c && S.krogerLoc && c.locId === S.krogerLoc.id && c.date === today ? c : null;
    }
    async function api(path) {
        const url = S.worker.replace(/\/+$/, '') + path;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Kroger said ${res.status}`);
        return res.json();
    }
    async function findStore() {
        if (!/^\d{5}$/.test(S.zip)) throw new Error('Enter your ZIP code first.');
        const j = await api(`/locations?filter.zipCode.near=${S.zip}&filter.limit=5&filter.radiusInMiles=25`);
        const list = (j.data || []).map(l => ({ id: l.locationId, name: `${l.name}`, addr: l.address ? `${l.address.addressLine1}, ${l.address.city}` : '', chain: l.chain }));
        if (!list.length) throw new Error('No Kroger-family stores within 25 miles of that ZIP.');
        return list;
    }
    async function ensureLive(progress) {
        if (!S.krogerLoc || S.krogerLoc.zip !== S.zip) {
            progress('📍 Finding your store…');
            const list = await findStore();
            S.krogerLoc = Object.assign({ zip: S.zip }, list[0]); saveSettings();
        }
        loadLiveCache();
        if (LIVE) return;
        const ids = usedItemIds();
        const out = {};
        let done = 0;
        const queue = ids.slice();
        const worker = async () => {
            while (queue.length) {
                const id = queue.shift();
                try { const r = await liveLookup(id); if (r) out[id] = r; } catch (e) { /* fall back to estimate for this item */ }
                done++; progress(`💲 Checking prices… ${done}/${ids.length}`);
            }
        };
        await Promise.all([worker(), worker(), worker(), worker()]);
        if (!Object.keys(out).length) throw new Error('No prices came back.');
        LIVE = { locId: S.krogerLoc.id, date: new Date().toISOString().slice(0, 10), items: out };
        store(KEY_LIVE, LIVE);
    }
    function parseSize(sz) {
        if (!sz) return null;
        const s = sz.toLowerCase().replace(/,/g, '');
        let m;
        if ((m = s.match(/([\d.]+)\s*(?:ct|count|pk|pack)\b/))) return { ct: parseFloat(m[1]) };
        if ((m = s.match(/([\d.]+)\s*fl\.?\s*oz/))) return { oz: parseFloat(m[1]) };
        if ((m = s.match(/([\d.]+)\s*(?:gal|gallon)/))) return { oz: parseFloat(m[1]) * 128 };
        if ((m = s.match(/([\d.]+)\s*(?:qt|quart)/))) return { oz: parseFloat(m[1]) * 32 };
        if ((m = s.match(/([\d.]+)\s*(?:pt|pint)/))) return { oz: parseFloat(m[1]) * 16 };
        if ((m = s.match(/([\d.]+)\s*(?:lb|lbs|pound)/))) return { oz: parseFloat(m[1]) * 16 };
        if ((m = s.match(/([\d.]+)\s*oz/))) return { oz: parseFloat(m[1]) };
        if (/each|\bea\b/.test(s)) return { ct: 1 };
        return null;
    }
    async function liveLookup(id) {
        const it = ITEMS[id];
        const j = await api(`/products?filter.term=${encodeURIComponent(it.t)}&filter.locationId=${S.krogerLoc.id}&filter.limit=12`);
        const must = it.must ? new RegExp(it.must, 'i') : null, not = it.not ? new RegExp(it.not, 'i') : null;
        let best = null;
        (j.data || []).forEach(p => {
            const desc = p.description || '';
            if (must && !must.test(desc)) return;
            if (not && not.test(desc)) return;
            const item = (p.items || [])[0]; if (!item || !item.price) return;
            const reg = item.price.regular, promo = item.price.promo;
            const price = promo > 0 && promo < reg ? promo : reg;
            if (!(price > 0)) return;
            const size = parseSize(item.size);
            let units = it.p;
            if (size && size.oz && it.oz) units = size.oz / it.oz;
            else if (size && size.ct && it.ct) units = size.ct * it.ct;
            if (!(units > 0) || units / it.p > 25 || units / it.p < 0.04) units = it.p;
            const per = price / units;
            const ratio = units / it.p;
            // sanity check against the usual price: way too cheap or pricey usually means the wrong product or size
            const vsUsual = per / (it.k / it.p);
            if (vsUsual < 0.35 || vsUsual > 3.5) return;
            const score = per * (ratio > 3.5 || ratio < 0.3 ? 1.6 : 1);
            const aisle = (p.aisleLocations || [])[0];
            if (!best || score < best.score) best = {
                score, price, units, name: desc, size: item.size || '', sale: promo > 0 && promo < reg,
                aisle: aisle ? (aisle.description || (aisle.number ? 'Aisle ' + aisle.number : '')) : '', aisleNum: aisle ? aisle.number : '',
                url: p.productPageURI ? 'https://www.kroger.com' + p.productPageURI.split('?')[0] : ''
            };
        });
        if (best) delete best.score;
        return best;
    }

    // ---------- settings dialog ----------
    function openSettings() {
        const d = $('settings');
        d.innerHTML = `<div class="dialog card"><button class="close" data-close aria-label="Close">✕</button>
            <h2>⚡ Live Kroger prices & real aisles</h2>
            <p>Kroger offers a <b>free</b> official developer API that returns real prices and the actual aisle for each product at your store. It works for every Kroger-family chain: Kroger, Ralphs, Fred Meyer, King Soopers, Fry's, Smith's, QFC, Harris Teeter, Mariano's, Pick 'n Save, Dillons, Food 4 Less and more.</p>
            <p>Your secret key can't live inside a public website, so it goes in a tiny free "worker" that you own. One-time setup, about 15 minutes:</p>
            <ol class="setup">
                <li>Make a free account at <a href="https://developer.kroger.com" target="_blank" rel="noopener">developer.kroger.com</a> and register an app with the <b>Product</b> scope (production environment). Copy its <b>Client ID</b> and <b>Client Secret</b>.</li>
                <li>Make a free account at <a href="https://dash.cloudflare.com" target="_blank" rel="noopener">Cloudflare</a>. Go to <b>Workers & Pages → Create → Worker</b>, name it (like <code>weekcart</code>) and deploy.</li>
                <li>Click <b>Edit code</b>, delete what's there, paste in everything from <code>worker.js</code> (it came with this site) and click <b>Deploy</b>.</li>
                <li>In the worker's <b>Settings → Variables and Secrets</b>, add <code>KROGER_CLIENT_ID</code> and <code>KROGER_CLIENT_SECRET</code> as <b>Secrets</b>. Add <code>ALLOWED_ORIGIN</code> as your site's address (like <code>https://yourname.github.io</code>).</li>
                <li>Paste your worker's address below. It looks like <code>https://weekcart.yourname.workers.dev</code>.</li>
            </ol>
            <label for="s-worker">Worker address</label>
            <input id="s-worker" placeholder="https://weekcart.yourname.workers.dev" value="${esc(S.worker)}">
            <div class="dialog-btns"><button class="btn primary" id="s-save">Save & test</button>${S.worker ? '<button class="btn ghost" id="s-off">Turn off</button>' : ''}</div>
            <div id="s-msg" class="hint"></div>
            ${S.krogerLoc ? `<p class="hint">Current store: <b>${esc(S.krogerLoc.name)}</b> ${esc(S.krogerLoc.addr || '')}</p>` : ''}
            <p class="hint">Kroger allows 10,000 lookups a day for free. WeekCart uses about 100 per store per day and saves the results, so you'll never come close.</p></div>`;
        d.hidden = false;
        d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { d.hidden = true; });
        d.onclick = e => { if (e.target === d) d.hidden = true; };
        $('s-save').onclick = async () => {
            const url = $('s-worker').value.trim();
            const msg = $('s-msg');
            if (!/^https:\/\//.test(url)) { msg.textContent = 'The address should start with https://'; return; }
            S.worker = url; S.krogerLoc = null; saveSettings();
            msg.textContent = 'Testing…';
            try {
                const list = await findStore();
                S.krogerLoc = Object.assign({ zip: S.zip }, list[0]); S.store = 'kroger'; saveSettings();
                msg.innerHTML = `✅ Connected! Nearest store: <b>${esc(list[0].name)}</b>, ${esc(list[0].addr)}`;
                renderForm();
            } catch (e) { msg.textContent = '❌ ' + (e.message || 'Could not reach the worker.') + ' Check the address, your ZIP code, and the worker\'s secrets.'; }
        };
        const off = $('s-off'); if (off) off.onclick = () => { S.worker = ''; S.krogerLoc = null; LIVE = null; saveSettings(); d.hidden = true; render(); };
    }

    // hooks for testing
    window.WC = { buildPlan, shoppingList, get S() { return S; }, get PLAN() { return PLAN; }, set PLAN(p) { PLAN = p; }, needs, costOfNeed, parseSize, render, R, ITEMS };

    document.addEventListener('DOMContentLoaded', () => {
        loadLiveCache();
        document.querySelectorAll('[data-act="settings"]').forEach(a => a.onclick = e => { e.preventDefault(); openSettings(); });
        render();
    });
})();
