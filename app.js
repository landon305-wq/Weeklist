// ==========================================
// WeekCart — app
// Picks dinners (plus optional breakfasts, lunches and snacks) that fit your budget, food choices and
// daily calorie/protein goals, adds up exactly what to buy (rounded to real package sizes, sharing
// ingredients between meals so less goes to waste), and sorts the list in the order you walk the store.
// ==========================================
(function () {
    const ITEMS = {}; window.WC_ITEMS.forEach(i => { ITEMS[i.id] = i; });
    const RECIPES = window.WC_RECIPES;
    const R = {}; RECIPES.forEach(r => { R[r.id] = r; });
    const SECTIONS = window.WC_SECTIONS, LAYOUTS = window.WC_LAYOUTS, CATS = window.WC_CATEGORIES;
    const CHAINS = window.WC_CHAINS, NUTR = window.WC_NUTR, PERISH = new Set(window.WC_PERISHABLE);
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const KEY_SET = 'weekcart_settings_v1', KEY_PLAN = 'weekcart_plan_v2', KEY_LIVE = 'weekcart_live_v1';

    const $ = id => document.getElementById(id);
    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const recall = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };

    // ---------- settings ----------
    let S = Object.assign({
        store: 'aldi', storeInfo: null, zip: '', budget: 100, people: 4, dinners: 5, breakfast: false, lunch: false,
        proteins: [], styles: [], avoid: [], staples: true, worker: '', krogerLoc: null,
        calGoal: '', proGoal: '', snacks: false, leftovers: false
    }, recall(KEY_SET) || {});
    if (!CHAINS.some(c => c.id === S.store)) S.store = 'aldi';
    let PLAN = recall(KEY_PLAN);
    let LIVE = null;      // live Kroger prices: { locId, date, items: { id: {price, units, name, aisle, aisleNum, url, size} } }
    let NEARBY = null;    // stores found near the ZIP code
    let tab = 'list';

    const chain = () => CHAINS.find(c => c.id === S.store) || CHAINS[CHAINS.length - 1];
    const layout = () => LAYOUTS[chain().layout];
    const storeLabel = () => S.storeInfo && S.storeInfo.chain === S.store ? S.storeInfo.name : chain().name;

    // ---------- recipe nutrition (per serving) ----------
    const servesOf = r => r.type === 'snack' ? 1 : (r.serves || 4);
    function nutr(rid) {
        const r = R[rid]; let cal = 0, pro = 0;
        r.ing.forEach(([id, q]) => { cal += NUTR[id][0] * q; pro += NUTR[id][1] * q; });
        return { cal: Math.round(cal / servesOf(r)), pro: Math.round(pro / servesOf(r)) };
    }
    RECIPES.forEach(r => {
        r.nu = nutr(r.id);
        if (r.type === 'dinner') { if (r.nu.pro >= 35) r.tags.push('protein'); if (r.nu.cal < 600) r.tags.push('light'); }
    });

    // ---------- prices ----------
    function liveFor(id) { return chain().kroger && LIVE && LIVE.items && LIVE.items[id] ? LIVE.items[id] : null; }
    function packOf(id) { const l = liveFor(id); return l ? l.units : ITEMS[id].p; }
    function priceOf(id) {
        const l = liveFor(id); if (l) return l.price;
        const c = chain(), base = ITEMS[id][c.base] * c.idx;
        return c.idx === 1 ? base : Math.max(0.25, Math.round(base * 10) / 10 - 0.01);
    }
    const countsCost = id => !(S.staples && ITEMS[id].staple);

    // ---------- recipe filters ----------
    function allergensOf(r) { const a = new Set(); r.ing.forEach(([id]) => (ITEMS[id].alg || []).forEach(x => a.add(x))); if (r.pro === 'fish') a.add('fish'); return a; }
    const allowed = r => !S.avoid.some(x => allergensOf(r).has(x));
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
    const sidePool = type => RECIPES.filter(r => r.type === type && allowed(r) && (!S.proteins.length || r.pro === 'veg' || S.proteins.includes(r.pro)));
    const useLunchRecipes = () => S.lunch && !S.leftovers;

    // ---------- how much of each recipe to make ----------
    // returns [recipe id, multiplier of the written recipe, servings each person eats]
    function mealsOf(plan) {
        const out = [];
        const dinnerX = S.leftovers ? 2 : 1;
        plan.dinners.forEach(id => out.push([id, S.people / servesOf(R[id]) * dinnerX, dinnerX]));
        const split = (ids, days) => ids.forEach((id, i) => {
            const d = Math.floor(days / ids.length) + (i < days % ids.length ? 1 : 0);
            out.push([id, S.people / 4 * d, d]);
        });
        if (plan.breakfasts.length) split(plan.breakfasts, 7);
        if (plan.lunches.length) split(plan.lunches, 5);
        (plan.snacks || []).forEach(([id, perDay]) => out.push([id, S.people * perDay * 7, perDay * 7]));
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
    // money spent on fresh food that won't get used
    function wasteOf(need) {
        let w = 0;
        for (const id in need) if (countsCost(id) && PERISH.has(id)) w += (pkgs(id, need[id]) - need[id] / packOf(id)) * priceOf(id);
        return w;
    }
    // extra cost (plus a nudge against waste) of adding one recipe to the current needs
    function addCost(need, rid, m, wasteW) {
        let d = 0;
        R[rid].ing.forEach(([id, q]) => {
            if (!countsCost(id)) return;
            const before = need[id] || 0, after = before + q * m;
            const dp = (pkgs(id, after) - pkgs(id, before)) * priceOf(id);
            d += dp;
            if (wasteW && PERISH.has(id)) {
                const wb = before ? pkgs(id, before) - before / packOf(id) : 0, wa = pkgs(id, after) - after / packOf(id);
                d += (wa - wb) * priceOf(id) * wasteW;
            }
        });
        return d;
    }

    // ---------- daily nutrition (per person) ----------
    const goals = () => ({ cal: +S.calGoal || 0, pro: +S.proGoal || 0 });
    const hasGoals = () => goals().cal > 0 || goals().pro > 0;
    // a typical day of this plan, per person: one breakfast, one lunch, one dinner and the daily snacks
    function dailyNutrition(plan) {
        const avg = (ids, weights) => {
            if (!ids.length) return [0, 0];
            let c = 0, p = 0, w = 0;
            ids.forEach((id, i) => { const k = weights ? weights[i] : 1; c += R[id].nu.cal * k; p += R[id].nu.pro * k; w += k; });
            return [Math.round(c / w), Math.round(p / w)];
        };
        const parts = { breakfast: avg(plan.breakfasts, [4, 3]), lunch: [0, 0], dinner: avg(plan.dinners), snack: [0, 0] };
        if (plan.lunches.length) parts.lunch = avg(plan.lunches, [3, 2]);
        else if (S.leftovers && S.lunch) parts.lunch = parts.dinner.slice();
        (plan.snacks || []).forEach(([id, n]) => { parts.snack[0] += R[id].nu.cal * n; parts.snack[1] += R[id].nu.pro * n; });
        const cal = parts.dinner[0] + parts.breakfast[0] + parts.lunch[0] + parts.snack[0];
        const pro = parts.dinner[1] + parts.breakfast[1] + parts.lunch[1] + parts.snack[1];
        const covers = { breakfast: plan.breakfasts.length > 0, lunch: plan.lunches.length > 0 || (S.leftovers && S.lunch) };
        return { cal, pro, parts, covers };
    }
    // snacks that close the gap to the daily goals (per person per day, max 3)
    function pickSnacks(plan) {
        const g = goals();
        if (!S.snacks || !hasGoals()) return [];
        const d = dailyNutrition(Object.assign({}, plan, { snacks: [] }));
        // meals you didn't plan still happen: assume a typical breakfast/lunch for them
        let cal = d.cal + (d.covers.breakfast ? 0 : 350) + (d.covers.lunch ? 0 : 500);
        let pro = d.pro + (d.covers.breakfast ? 0 : 15) + (d.covers.lunch ? 0 : 20);
        const pool = RECIPES.filter(r => r.type === 'snack' && allowed(r) && (!S.proteins.length || r.pro === 'veg' || S.proteins.includes(r.pro)));
        const out = [];
        for (let i = 0; i < 3; i++) {
            const calGap = g.cal ? g.cal - cal : 0, proGap = g.pro ? g.pro - pro : 0;
            const opts = pool.filter(r => !out.some(o => o[0] === r.id));
            let best = null;
            if (proGap > 6) best = opts.filter(r => !g.cal || r.nu.cal <= calGap + 150).sort((a, b) => b.nu.pro / b.nu.cal - a.nu.pro / a.nu.cal)[0];
            else if (calGap > 120) best = opts.filter(r => r.nu.cal <= calGap + 100).sort((a, b) => b.nu.cal - a.nu.cal)[0];
            if (!best) break;
            out.push([best.id, 1]); cal += best.nu.cal; pro += best.nu.pro;
        }
        return out;
    }

    // ---------- the planner ----------
    function buildPlan() {
        const { pool, preferred, notes } = dinnerPool();
        const sc = S.people;
        const dinnerX = S.leftovers ? 2 : 1;
        const bPool = sidePool('breakfast'), lPool = sidePool('lunch');
        const singlePro = S.proteins.length === 1;
        const recent = new Set(PLAN && PLAN.dinners ? PLAN.dinners : []);
        const g = goals();
        const dinnerShare = S.snacks ? 0.36 : 0.4;
        const perMeal = S.budget / Math.max(1, S.dinners + (S.breakfast ? 2 : 0) + (useLunchRecipes() ? 2 : 0));
        const goalPenalty = r => {
            let p = 0;
            if (g.cal) { const t = g.cal * dinnerShare; p += Math.abs(r.nu.cal - t) / t * perMeal * 0.9; }
            if (g.pro) { const t = g.pro * dinnerShare; p += Math.max(0, t - r.nu.pro) / t * perMeal * 1.1; }
            return p;
        };
        const wasteW = S.people <= 2 ? 1.2 : 0.7;   // small households: work harder to finish every package
        const tries = [];
        for (let t = 0; t < 300; t++) {
            const need = {}, plan = { dinners: [], breakfasts: [], lunches: [], snacks: [] };
            const proCount = {};
            const noise = Math.max(3, perMeal * 0.15);
            const add = (rid, m) => R[rid].ing.forEach(([id, q]) => { need[id] = (need[id] || 0) + q * m; });
            const pickSide = (list, n, days) => {
                const chosen = [];
                for (let i = 0; i < n && list.length; i++) {
                    const m = sc / 4 * Math.ceil(days / n);
                    const opts = list.filter(r => !chosen.includes(r.id)).map(r => ({ id: r.id, c: addCost(need, r.id, m, wasteW) + Math.random() * noise + (g.pro ? Math.max(0, g.pro * 0.22 - r.nu.pro) / (g.pro * 0.22) * perMeal * 0.6 : 0) }));
                    if (!opts.length) break;
                    opts.sort((a, b) => a.c - b.c);
                    const pick = opts[Math.floor(Math.random() * Math.min(3, opts.length))].id;
                    chosen.push(pick); add(pick, m);
                }
                return chosen;
            };
            if (S.breakfast) plan.breakfasts = pickSide(bPool, 2, 7);
            if (useLunchRecipes()) plan.lunches = pickSide(lPool, 2, 5);
            for (let i = 0; i < S.dinners; i++) {
                const opts = pool.filter(r => !plan.dinners.includes(r.id)).map(r => {
                    const m = sc / servesOf(r) * dinnerX;
                    let c = addCost(need, r.id, m, wasteW) + Math.random() * noise * 1.6 + goalPenalty(r);
                    if (!singlePro) c += (proCount[r.pro] || 0) * 5 + ((proCount[r.pro] || 0) >= 2 ? 12 : 0);
                    if (!preferred.has(r.id)) c += 15;
                    if (recent.has(r.id)) c += perMeal * 0.6;
                    if (r.tags.includes('slowcooker') && plan.dinners.some(d => R[d].tags.includes('slowcooker'))) c += 6;
                    return { id: r.id, c };
                });
                if (!opts.length) break;
                const min = Math.min(...opts.map(o => o.c)), temp = Math.max(3, perMeal * 0.3);
                const w = opts.map(o => Math.exp(-(o.c - min) / temp));
                let rr = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
                while (k < w.length - 1 && (rr -= w[k]) > 0) k++;
                const pick = opts[k].id;
                plan.dinners.push(pick); add(pick, sc / servesOf(R[pick]) * dinnerX);
                proCount[R[pick].pro] = (proCount[R[pick].pro] || 0) + 1;
            }
            plan.snacks = pickSnacks(plan);
            const n2 = needs(plan).need;
            const cost = costOfNeed(n2), waste = wasteOf(n2);
            const variety = new Set(plan.dinners.map(d => R[d].pro)).size + new Set(plan.dinners.flatMap(d => R[d].tags)).size * 0.3;
            let fit = 0;
            if (hasGoals()) {
                const dn = dailyNutrition(plan);
                const cal = dn.cal + (dn.covers.breakfast ? 0 : 350) + (dn.covers.lunch ? 0 : 500), pro = dn.pro + (dn.covers.breakfast ? 0 : 15) + (dn.covers.lunch ? 0 : 20);
                if (g.cal) fit -= Math.abs(cal - g.cal) / g.cal * 6;
                if (g.pro) fit -= Math.max(0, g.pro - pro) / g.pro * 6;
            }
            tries.push({ plan, cost, waste, variety, fit });
        }
        const under = tries.filter(x => x.cost <= S.budget);
        let best;
        if (under.length) {
            under.forEach(x => { x.score = x.variety * 2 + Math.random() * 4 - (x.cost / S.budget) * 2 - x.waste / Math.max(20, S.budget) * 8 + x.fit; });
            under.sort((a, b) => b.score - a.score);
            best = under[Math.floor(Math.random() * Math.min(4, under.length))];
        } else {
            tries.sort((a, b) => a.cost - b.cost);
            best = tries[0];
        }
        best.plan.dinners = orderWeek(best.plan.dinners);
        return Object.assign(best.plan, { created: new Date().toISOString(), notes, have: {}, got: {}, store: S.store, overBudget: best.cost > S.budget });
    }
    function orderWeek(ids) {
        const long = ids.filter(id => R[id].time > 45), short = ids.filter(id => R[id].time <= 45);
        return shuffle(short).concat(long);
    }

    // ---------- swapping one dinner ----------
    function swapDinner(idx) {
        const { pool } = dinnerPool();
        const dinnerX = S.leftovers ? 2 : 1;
        const others = Object.assign({}, PLAN, { dinners: PLAN.dinners.filter((_, i) => i !== idx) });
        const base = needs(others).need;
        const baseCost = costOfNeed(base, PLAN.have);
        const opts = pool.filter(r => !PLAN.dinners.includes(r.id)).map(r => ({ id: r.id, c: baseCost + addCost(base, r.id, S.people / servesOf(r) * dinnerX, 0) }));
        if (!opts.length) return toast('No other recipes match your choices.');
        const fit = opts.filter(o => o.c <= S.budget);
        const list = fit.length ? fit : opts.sort((a, b) => a.c - b.c).slice(0, 3);
        const pick = list[Math.floor(Math.random() * list.length)].id;
        PLAN.dinners[idx] = pick;
        PLAN.snacks = pickSnacks(PLAN);
        store(KEY_PLAN, PLAN);
        renderResults();
        toast(`Swapped in ${R[pick].n}`);
    }

    // ---------- shopping list ----------
    function shoppingList() {
        const { need, uses } = needs(PLAN);
        const rows = Object.keys(need).map(id => {
            const it = ITEMS[id], n = pkgs(id, need[id]), live = liveFor(id);
            const left = n * packOf(id) - need[id];
            return {
                id, it, n, need: need[id], price: priceOf(id), total: n * priceOf(id), live,
                uses: [...uses[id]], staple: S.staples && it.staple, left, leftFrac: left / packOf(id)
            };
        });
        const pantry = rows.filter(r => r.staple);
        const buy = rows.filter(r => !r.staple);
        const total = buy.filter(r => !PLAN.have[r.id]).reduce((s, r) => s + r.total, 0);
        // how much of the fresh food gets used
        let freshBought = 0, freshUsed = 0;
        buy.filter(r => PERISH.has(r.id) && !PLAN.have[r.id]).forEach(r => { freshBought += r.total; freshUsed += r.need / packOf(r.id) * r.price; });
        const leftovers = buy.filter(r => PERISH.has(r.id) && r.leftFrac >= 0.3 && !PLAN.have[r.id]).sort((a, b) => b.leftFrac * b.price - a.leftFrac * a.price);
        // group by aisle (live Kroger) or by section in this store's usual layout
        const lay = layout();
        const groups = {};
        const liveMode = chain().kroger && LIVE;
        const tailOrder = { produce: -3, bakery: -2, deli: -1, meat: 900, frozen: 901, dairy: 902 };
        buy.forEach(r => {
            let key, label, icon, order;
            const num = r.live ? parseInt(r.live.aisleNum, 10) : NaN;
            if (liveMode && !isNaN(num)) { key = 'a:' + num; label = 'Aisle ' + num; icon = '🔢'; order = num; }
            else {
                key = 's:' + r.it.s; label = SECTIONS[r.it.s].name; icon = SECTIONS[r.it.s].icon;
                order = liveMode ? (r.it.s in tailOrder ? tailOrder[r.it.s] : 500 + lay.order.indexOf(r.it.s)) : lay.order.indexOf(r.it.s);
            }
            (groups[key] = groups[key] || { label, icon, order, rows: [], secs: {} }).rows.push(r);
            groups[key].secs[SECTIONS[r.it.s].name] = 1;
        });
        Object.values(groups).forEach(g => { if (g.label.startsWith('Aisle ')) g.label += ' · ' + Object.keys(g.secs).join(', '); });
        const list = Object.values(groups).sort((a, b) => a.order - b.order);
        list.forEach(g => g.rows.sort((a, b) => a.it.n.localeCompare(b.it.n)));
        return { groups: list, pantry, total, count: buy.length, usedPct: freshBought ? Math.round(freshUsed / freshBought * 100) : 100, leftovers };
    }

    // ---------- formatting amounts ----------
    function frac(x) {
        const w = Math.floor(x + 1e-6), f = x - w;
        const table = [[0, ''], [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'], [1, '']];
        let best = table[0]; table.forEach(t => { if (Math.abs(f - t[0]) < Math.abs(f - best[0])) best = t; });
        const whole = best[0] === 1 ? w + 1 : w;
        if (!whole && !best[1]) return x > 0 ? '⅛' : '0';
        return (whole ? whole : '') + best[1];
    }
    const ingName = it => it.n.replace(/ \(.+\)$/, '').toLowerCase();
    function amount(id, q) {
        const it = ITEMS[id];
        const unit = it.pl ? (q > 1.01 ? it.pl : it.u) : it.u;
        const measure = /^(slices?|cloves?|stalks?|heads?|bunch(es)?|packs?|packets?|cans?|jars?|cups?|tbsp|tsp|oz|lb)$/.test(unit);
        return measure ? `${frac(q)} ${unit} ${ingName(it)}` : `${frac(q)} ${unit}`;
    }
    const pkgText = (r) => { const pk = r.live ? (r.live.size || '') : r.it.pk; return pk; };
    function leftoverText(r) {
        const f = r.leftFrac;
        const amt = f >= 0.9 ? 'almost a whole' : f >= 0.6 ? 'about ⅔ of a' : f >= 0.45 ? 'about half a' : 'about ⅓ of a';
        return `${amt} ${r.it.pk.replace(/^~/, '').replace(/^about /, '')} of ${r.it.n.toLowerCase()}`;
    }

    // ==========================================
    // RENDER
    // ==========================================
    function chips(group, list, selected) {
        return list.map(c => `<button type="button" class="chip ${selected.includes(c.id) ? 'on' : ''}" data-chip="${group}" data-id="${c.id}" aria-pressed="${selected.includes(c.id)}">${c.icon} ${esc(c.name)}</button>`).join('');
    }
    function storeHint() {
        const c = chain();
        if (c.kroger && S.worker) return `<span class="live-dot"></span> Live prices and real aisle numbers from ${S.krogerLoc ? esc(S.krogerLoc.name) : 'your nearest ' + esc(c.name) + '-family store'}.`;
        let t = c.id === 'local' ? 'We don\'t have price data for this store, so it uses typical supermarket prices.' : `Prices are typical ${esc(c.name)} estimates.`;
        if (c.kroger) t += ' <a href="#" data-act="settings">Turn on live prices & real aisles</a> (free).';
        return t;
    }
    function storeBox() {
        const c = chain();
        const info = S.storeInfo && S.storeInfo.chain === S.store ? S.storeInfo : null;
        const near = NEARBY ? (NEARBY.error ? `<p class="hint err">${esc(NEARBY.error)}</p>`
            : NEARBY.loading ? '<p class="hint">🔎 Looking for grocery stores near you…</p>'
            : `<div class="near-list">${NEARBY.list.map((s, i) => `<button type="button" class="near ${info && info.name === s.name && info.addr === s.addr ? 'on' : ''}" data-near="${i}">
                <span class="near-name">${esc(s.name)}</span><span class="near-sub">${s.dist.toFixed(1)} mi${s.addr ? ' · ' + esc(s.addr) : ''}</span>
                <span class="near-tag ${s.chain === 'local' ? 'est' : ''}">${s.chain === 'local' ? 'typical prices' : esc(CHAINS.find(x => x.id === s.chain).name) + ' prices'}</span></button>`).join('')}</div>
                <p class="hint">Store list from OpenStreetMap. ${NEARBY.list.length ? '' : 'Nothing found nearby. Pick a chain below.'}</p>`) : '';
        return `<div class="field">
            <label>Store</label>
            <div class="store-cur"><span class="store-icon">🏪</span><div><b>${esc(info ? info.name : c.name)}</b><small>${info ? `${info.dist.toFixed(1)} mi · ${esc(info.addr || '')}` : 'Pick a store near you, or a chain'}</small></div></div>
            <div class="row store-row">
                <button type="button" class="btn small" id="find-stores">📍 Find stores near my ZIP</button>
                <select id="f-chain" aria-label="Or pick a chain">${CHAINS.map(x => `<option value="${x.id}" ${x.id === S.store ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
            </div>
            ${near}
            <p class="hint" id="store-hint">${storeHint()}</p>
        </div>`;
    }
    function renderForm() {
        const lay = layout();
        $('form').innerHTML = `
            <div class="row">
                <div class="field"><label for="f-zip">ZIP code</label><input id="f-zip" inputmode="numeric" maxlength="5" placeholder="e.g. 45202" value="${esc(S.zip)}"></div>
                <div class="field"><label for="f-budget">Weekly budget</label><div class="money-in"><span>$</span><input id="f-budget" type="number" min="20" max="1000" step="5" value="${S.budget}"></div></div>
            </div>
            ${storeBox()}
            <div class="row">
                <div class="field"><label>People</label><div class="stepper" data-step="people"><button type="button" data-d="-1" aria-label="fewer people">−</button><b>${S.people}</b><button type="button" data-d="1" aria-label="more people">+</button></div></div>
                <div class="field"><label>Dinners</label><div class="stepper" data-step="dinners"><button type="button" data-d="-1" aria-label="fewer dinners">−</button><b>${S.dinners}</b><button type="button" data-d="1" aria-label="more dinners">+</button></div></div>
            </div>
            <div class="field toggles">
                <label class="tog"><input type="checkbox" id="f-breakfast" ${S.breakfast ? 'checked' : ''}><span></span> Add breakfasts for the week</label>
                <label class="tog"><input type="checkbox" id="f-lunch" ${S.lunch ? 'checked' : ''}><span></span> Add weekday lunches</label>
                <label class="tog"><input type="checkbox" id="f-leftovers" ${S.leftovers ? 'checked' : ''}><span></span> <i class="tog-t">Cook once, eat twice <small>(double dinners for leftovers)</small></i></label>
                <p class="hint" id="one-hint" ${S.people === 1 && !S.leftovers ? '' : 'hidden'}>🙋 Cooking for one? Turn on <b>Cook once, eat twice</b>. Recipes come in family-size packages, so making 2 servings and eating the second for lunch wastes far less.</p>
            </div>
            <div class="field goals">
                <label>Daily goals per person <small>(optional)</small></label>
                <div class="row">
                    <div class="goal-in"><input id="f-cal" type="number" min="800" max="6000" step="50" placeholder="2000" value="${esc(S.calGoal)}"><span>calories</span></div>
                    <div class="goal-in"><input id="f-pro" type="number" min="20" max="400" step="5" placeholder="120" value="${esc(S.proGoal)}"><span>g protein</span></div>
                </div>
                <label class="tog"><input type="checkbox" id="f-snacks" ${S.snacks ? 'checked' : ''}><span></span> Add snacks to help reach my goals</label>
            </div>
            <div class="field"><label>Proteins <small>(pick any, or none for all)</small></label><div class="chips">${chips('proteins', window.WC_CATEGORIES.protein, S.proteins)}</div></div>
            <div class="field"><label>Meal styles <small>(optional)</small></label><div class="chips">${chips('styles', CATS.style, S.styles)}</div></div>
            <div class="field"><label>Avoid <small>(allergies & dislikes)</small></label><div class="chips avoid">${chips('avoid', CATS.avoid, S.avoid)}</div></div>
            <div class="field toggles"><label class="tog"><input type="checkbox" id="f-staples" ${S.staples ? 'checked' : ''}><span></span> I already have basics (oil, flour, salt, spices, ketchup…)</label></div>
            <button type="button" class="btn primary big" id="go">🛒 Make my plan</button>
            <p class="hint center">${esc(lay.name)} layout: ${esc(lay.note)}</p>`;
        bindForm();
    }

    function bar(v, goal) { const p = Math.min(100, v / goal * 100); return `<div class="nbar ${v > goal * 1.1 ? 'over' : v < goal * 0.85 ? 'under' : 'ok'}"><i style="width:${p}%"></i></div>`; }
    function nutritionCard() {
        const d = dailyNutrition(PLAN), g = goals();
        const missing = [!d.covers.breakfast && 'breakfast', !d.covers.lunch && 'lunch'].filter(Boolean);
        const row = (label, v, goal, unit) => `<div class="nrow"><div class="nrow-top"><span>${label}</span><b>${v.toLocaleString()}${unit}${goal ? ` <small>/ ${goal.toLocaleString()}${unit}</small>` : ''}</b></div>${goal ? bar(v, goal) : ''}</div>`;
        const parts = Object.entries(d.parts).filter(([, v]) => v[0] > 0).map(([k, v]) => `<span>${{ dinner: '🍽️ Dinners', breakfast: '🌅 Breakfasts', lunch: '🥪 Lunches', snack: '🍎 Snacks' }[k]} ${v[0]} cal · ${v[1]}g</span>`).join('');
        return `<div class="card nutri"><div class="kicker">A TYPICAL DAY ON THIS PLAN, PER PERSON</div>
            ${!hasGoals() ? '<p class="hint">Add daily goals on the left to plan around calories and protein.</p>' : ''}
            ${row('🔥 Calories', d.cal, g.cal, '')}${row('💪 Protein', d.pro, g.pro, 'g')}
            <div class="nparts">${parts}</div>
            ${missing.length ? `<p class="hint">Your plan doesn't include ${missing.join(' or ')}, so ${hasGoals() ? 'the rest of your day comes from food you plan yourself' : 'these totals only count the meals in your plan'}.</p>` : ''}
            ${PLAN.dinners.length < 7 && !(S.leftovers && !S.lunch) ? `<p class="hint">${7 - PLAN.dinners.length} night${7 - PLAN.dinners.length === 1 ? ' is' : 's are'} left open for eating out or using up what's in the fridge.</p>` : ''}
            ${PLAN.snacks && PLAN.snacks.length ? `<p class="hint">🍎 Daily snacks added for your goals: ${PLAN.snacks.map(([id]) => esc(R[id].n)).join(', ')}.</p>` : ''}
        </div>`;
    }

    function renderResults() {
        const box = $('results');
        if (!PLAN) { box.innerHTML = emptyState(); return; }
        if (PLAN.store !== S.store) { box.innerHTML = `<div class="card empty"><p>You switched stores. Press <b>Make my plan</b> to rebuild your list for ${esc(storeLabel())}.</p></div>`; return; }
        const L = shoppingList();
        const pct = Math.min(100, L.total / S.budget * 100);
        const servings = mealsOf(PLAN).reduce((s, [rid, m]) => s + m * servesOf(R[rid]), 0);
        const over = L.total > S.budget;
        const src = chain().kroger && LIVE ? `Live prices from ${S.krogerLoc ? esc(S.krogerLoc.name) : 'Kroger'} · ${esc(LIVE.date)}` : `Estimated ${esc(chain().name === 'Local supermarket' ? 'typical supermarket' : chain().name)} prices`;
        const head = `<div class="card summary">
            <div class="sum-top"><div><div class="kicker">THIS WEEK AT ${esc(storeLabel().toUpperCase())}</div><div class="sum-total ${over ? 'over' : ''}">${money(L.total)}<small> of ${money(S.budget)}</small></div></div>
            <div class="sum-side"><b>${money(L.total / Math.max(1, servings))}</b><span>per serving</span></div></div>
            <div class="budget-bar ${over ? 'over' : ''}"><i style="width:${pct}%"></i></div>
            <p class="hint">${over ? `⚠️ This is the cheapest plan that matches your choices. Try fewer dinners, turning off snacks, or adding "Meatless" and "Chicken".` : `🎉 ${money(S.budget - L.total)} left over.`} ${src}. Prices are approximate, so check the shelf tag.</p>
            <div class="waste"><span class="waste-pct ${L.usedPct >= 85 ? 'good' : L.usedPct >= 70 ? 'ok' : 'meh'}">🥬 ${L.usedPct}%</span><span>of the fresh food you buy gets used in this plan.${L.leftovers.length ? ` Extra: ${L.leftovers.slice(0, 3).map(leftoverText).map(esc).join('; ')}.` : ''}</span></div>
            ${PLAN.notes && PLAN.notes.length ? `<p class="hint note">ℹ️ ${PLAN.notes.map(esc).join(' ')}</p>` : ''}
        </div>`;
        const nCount = PLAN.dinners.length + PLAN.breakfasts.length + PLAN.lunches.length;
        const tabs = `<div class="tabs" role="tablist">
            <button role="tab" data-tab="list" class="${tab === 'list' ? 'on' : ''}">🛒 List <small>${L.count}</small></button>
            <button role="tab" data-tab="recipes" class="${tab === 'recipes' ? 'on' : ''}">🍽️ Recipes <small>${nCount}</small></button>
            <button role="tab" data-tab="week" class="${tab === 'week' ? 'on' : ''}">📅 Week</button></div>`;
        const body = tab === 'recipes' ? recipesView() : tab === 'week' ? weekView() : listView(L);
        box.innerHTML = head + nutritionCard() + tabs + tools() + body;
        bindResults();
    }
    function tools() {
        return `<div class="list-tools"><button class="btn small primary-soft" data-act="print">🖨️ Print list & recipes</button><button class="btn small" data-act="copy">📋 Copy list</button><button class="btn small" data-act="regen">🔄 New plan</button></div>`;
    }
    function emptyState() {
        return `<div class="card empty"><div class="empty-art">🥕🧅🥖🧀🍗</div><h2>Your week, planned in one click</h2>
            <p>Set your budget, goals and what you like to eat. WeekCart picks dinners that share ingredients (so less goes to waste), adds up exactly what to buy in real package sizes, and puts the list in the order you walk the store.</p></div>`;
    }

    function listView(L) {
        const groups = L.groups.map(g => `<section class="aisle"><h3>${g.icon} ${esc(g.label)}</h3>${g.rows.map(r => {
            const have = PLAN.have[r.id], got = PLAN.got[r.id];
            const name = r.live ? r.live.name : r.it.n;
            return `<div class="item ${got ? 'got' : ''} ${have ? 'have' : ''}">
                <label class="check"><input type="checkbox" data-got="${r.id}" ${got ? 'checked' : ''} aria-label="Got ${esc(r.it.n)}"><span></span></label>
                <div class="item-main"><div class="item-name">${r.n > 1 ? `<b>${r.n}×</b> ` : ''}${esc(name)}</div>
                <div class="item-sub">${esc(pkgText(r))}${r.live && r.live.url ? ` · <a href="${esc(r.live.url)}" target="_blank" rel="noopener">view</a>` : ''} · for ${esc(r.uses.slice(0, 3).join(', '))}${r.uses.length > 3 ? ' +' + (r.uses.length - 3) : ''}</div></div>
                <div class="item-right"><div class="item-price">${have ? '<s>' + money(r.total) + '</s>' : money(r.total)}</div><button class="have-btn" data-have="${r.id}">${have ? 'Need it' : 'Have it'}</button></div></div>`;
        }).join('')}</section>`).join('');
        const pantry = L.pantry.length ? `<details class="card pantry"><summary>🧂 Check your pantry for ${L.pantry.length} basics (not in the total)</summary><ul>${L.pantry.map(r => `<li>${esc(r.it.n)}</li>`).join('')}</ul></details>` : '';
        return `<p class="hint">Tap an item when it's in your cart. Tap "Have it" for things already at home, and it comes off your total.</p>
            <div class="card list">${groups}</div>${pantry}`;
    }

    function recipeCard(rid, kind, idx, forPrint) {
        const r = R[rid];
        const batch = kind === 'dinner' ? S.people / servesOf(r) * (S.leftovers ? 2 : 1) : S.people / servesOf(r);
        let cost = 0; r.ing.forEach(([id, q]) => { if (countsCost(id)) cost += q / packOf(id) * priceOf(id); });
        const per = cost / servesOf(r);
        const timeTxt = r.time >= 120 ? `${Math.round(r.time / 60)} hr (hands-off)` : `${r.time} min`;
        const tags = r.tags.map(t => (CATS.style.find(c => c.id === t) || {}).name).filter(Boolean);
        const makes = Math.round(batch * servesOf(r) * 10) / 10;
        const sub = kind === 'dinner' ? (S.leftovers ? `makes ${makes} servings: dinner + leftovers` : `makes ${makes} servings`)
            : kind === 'breakfast' ? 'about 3–4 mornings' : kind === 'lunch' ? 'about 2–3 days' : 'daily snack';
        return `<article class="card recipe">
            <div class="rec-head"><span class="rec-emoji">${r.emoji}</span><div class="rec-title"><div class="kicker">${kind.toUpperCase()} · ${sub}</div><h3>${esc(r.n)}</h3>
            <div class="rec-meta">⏱️ ${timeTxt} · ~${money(per)}/serving</div>
            <div class="rec-nutri"><span>🔥 ${r.nu.cal} cal</span><span>💪 ${r.nu.pro}g protein</span><small>per serving</small></div>
            ${tags.length ? `<div class="rec-tags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}</div></div>
            ${forPrint ? '' : '<details><summary>Ingredients & steps</summary>'}
                <ul class="ing">${r.ing.map(([id, q, note]) => `<li>${esc(amount(id, q * batch))}${note ? ` <small>(${esc(note)})</small>` : ''}</li>`).join('')}</ul>
                <ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
            ${forPrint ? '' : '</details>'}
            ${kind === 'dinner' && !forPrint ? `<button class="btn small ghost" data-swap="${idx}">🔄 Swap this meal</button>` : ''}
        </article>`;
    }
    function recipesHTML(forPrint) {
        let html = PLAN.dinners.map((id, i) => recipeCard(id, 'dinner', i, forPrint)).join('');
        if (PLAN.breakfasts.length) html += `<h3 class="group-h">🌅 Breakfasts</h3>` + PLAN.breakfasts.map(id => recipeCard(id, 'breakfast', 0, forPrint)).join('');
        if (PLAN.lunches.length) html += `<h3 class="group-h">🥪 Lunches</h3>` + PLAN.lunches.map(id => recipeCard(id, 'lunch', 0, forPrint)).join('');
        if (PLAN.snacks && PLAN.snacks.length) html += `<h3 class="group-h">🍎 Snacks</h3>` + PLAN.snacks.map(([id]) => recipeCard(id, 'snack', 0, forPrint)).join('');
        return html;
    }
    const recipesView = () => recipesHTML(false);
    function weekSlots() {
        const n = PLAN.dinners.length;
        const slots = Array(7).fill(null);
        const spots = n >= 7 ? [0, 1, 2, 3, 4, 5, 6] : [[0, 2, 4], [0, 2, 4, 6], [0, 1, 3, 4, 6], [0, 1, 2, 3, 4, 6]][Math.max(0, n - 3)] || [0, 2];
        PLAN.dinners.forEach((id, i) => { slots[spots[i]] = id; });
        return slots;
    }
    function weekView() {
        const slots = weekSlots();
        const rows = DAYS.map((d, i) => {
            const id = slots[i];
            const prev = slots.slice(0, i).reverse().find(Boolean);
            const b = PLAN.breakfasts.length ? R[PLAN.breakfasts[i % PLAN.breakfasts.length]] : null;
            let lunch = '';
            if (PLAN.lunches.length && i < 5) lunch = `🥪 ${esc(R[PLAN.lunches[i % PLAN.lunches.length]].n)}`;
            else if (S.leftovers && S.lunch && prev) lunch = `🥡 Leftover ${esc(R[prev].n)}`;
            let dinner;
            if (id) dinner = `${R[id].emoji} <b>${esc(R[id].n)}</b>${R[id].tags.includes('slowcooker') ? ' <small>start it in the morning</small>' : ''}`;
            else if (S.leftovers && !S.lunch && prev) dinner = `♻️ <b>Leftovers</b> <small>(${esc(R[prev].n)})</small>`;
            else dinner = `🍽️ <b>Free night</b> <small>(no meal planned)</small>`;
            const snacks = PLAN.snacks && PLAN.snacks.length ? `<div class="mini">🍎 ${PLAN.snacks.map(([sid]) => esc(R[sid].n)).join(' · ')}</div>` : '';
            return `<div class="day"><div class="day-name">${d.slice(0, 3)}</div><div class="day-meals">
                ${b ? `<div class="mini">🌅 ${esc(b.n)}</div>` : ''}${lunch ? `<div class="mini">${lunch}</div>` : ''}${snacks}
                <div class="dinner">${dinner}</div></div></div>`;
        }).join('');
        return `<div class="card week">${rows}</div><p class="hint center">Quick meals go early in the week. Slow-cooker and longer recipes land on the days with more time.</p>`;
    }

    // ---------- print: list + recipes + week, on paper ----------
    function printAll() {
        const L = shoppingList();
        const d = dailyNutrition(PLAN), g = goals();
        const list = L.groups.map(gr => `<div class="p-group"><h3>${gr.icon} ${esc(gr.label)}</h3><ul>${gr.rows.filter(r => !PLAN.have[r.id]).map(r =>
            `<li><span class="p-box"></span>${r.n > 1 ? `<b>${r.n}×</b> ` : ''}${esc(r.live ? r.live.name : r.it.n)} <small>${esc(pkgText(r))}</small><em>${money(r.total)}</em></li>`).join('')}</ul></div>`).join('');
        const slots = weekSlots();
        const week = DAYS.map((day, i) => `<tr><th>${day.slice(0, 3)}</th><td>${slots[i] ? esc(R[slots[i]].n) : (S.leftovers && !S.lunch ? 'Leftovers' : 'Free night')}</td></tr>`).join('');
        $('print-area').innerHTML = `
            <header class="p-head"><h1>🛒 WeekCart</h1><div><b>${esc(storeLabel())}</b> · ${S.people} ${S.people === 1 ? 'person' : 'people'} · ${money(L.total)} of ${money(S.budget)}<br>
            <small>Daily per person: ${d.cal} cal${g.cal ? ' (goal ' + g.cal + ')' : ''} · ${d.pro}g protein${g.pro ? ' (goal ' + g.pro + 'g)' : ''}</small></div></header>
            <h2>Shopping list</h2><div class="p-list">${list}</div>
            ${L.pantry.length ? `<p class="p-pantry"><b>Check your pantry:</b> ${L.pantry.map(r => esc(r.it.n)).join(', ')}</p>` : ''}
            <h2 class="p-break">This week</h2><table class="p-week">${week}</table>
            <h2>Recipes</h2><div class="p-recipes">${recipesHTML(true)}</div>`;
        document.body.classList.add('printing');
        const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
        window.addEventListener('afterprint', done);
        try { window.print(); } catch (e) { done(); }
        setTimeout(() => { if (!window.matchMedia('print').matches) done(); }, 1500);
    }

    function render() { renderForm(); renderResults(); }

    // ==========================================
    // NEARBY STORES (free: ZIP → location from zippopotam.us, stores from OpenStreetMap)
    // ==========================================
    function milesBetween(a, b, c, d) {
        const r = x => x * Math.PI / 180, R0 = 3958.8;
        const dl = r(c - a), dn = r(d - b);
        const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2;
        return 2 * R0 * Math.asin(Math.sqrt(h));
    }
    function chainFor(tags) {
        const text = [tags.brand, tags.name, tags.operator].filter(Boolean).join(' ');
        const c = CHAINS.find(x => x.match && x.match.test(text));
        return c ? c.id : 'local';
    }
    async function findNearby() {
        if (!/^\d{5}$/.test(S.zip)) { toast('Enter your 5-digit ZIP code first.'); $('f-zip').focus(); return; }
        NEARBY = { loading: true }; renderForm();
        try {
            const zr = await fetch(`https://api.zippopotam.us/us/${S.zip}`);
            if (!zr.ok) throw new Error('That ZIP code wasn\'t found.');
            const z = await zr.json();
            const lat = parseFloat(z.places[0].latitude), lon = parseFloat(z.places[0].longitude);
            let list = [];
            for (const meters of [12000, 30000]) {
                const q = `[out:json][timeout:25];nwr["shop"="supermarket"](around:${meters},${lat},${lon});out center tags;`;
                const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: new URLSearchParams({ data: q }) });
                if (!res.ok) throw new Error('The store map is busy. Try again in a minute.');
                const j = await res.json();
                list = (j.elements || []).map(e => {
                    const t = e.tags || {}, la = e.lat || (e.center && e.center.lat), lo = e.lon || (e.center && e.center.lon);
                    if (!t.name || !la) return null;
                    const addr = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ') + (t['addr:city'] ? (t['addr:street'] ? ', ' : '') + t['addr:city'] : '');
                    return { name: t.name, addr, dist: milesBetween(lat, lon, la, lo), chain: chainFor(t) };
                }).filter(Boolean);
                if (list.length >= 4) break;
            }
            const seen = new Set();
            list = list.sort((a, b) => a.dist - b.dist).filter(s => { const k = s.name + '|' + Math.round(s.dist * 10); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 12);
            NEARBY = { list, city: z.places[0]['place name'] };
        } catch (e) {
            NEARBY = { error: (e && e.message && !/fetch/i.test(e.message) ? e.message : 'Couldn\'t reach the store finder. Check your internet, or pick a chain from the menu.') };
        }
        renderForm();
    }

    // ==========================================
    // EVENTS
    // ==========================================
    function saveSettings() { store(KEY_SET, S); }
    function setStore(id, info) {
        S.store = id; S.storeInfo = info || null; saveSettings(); loadLiveCache(); render();
    }
    function bindForm() {
        document.querySelectorAll('[data-chip]').forEach(b => b.onclick = () => {
            const g = b.dataset.chip, id = b.dataset.id, arr = S[g];
            const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
            saveSettings(); b.classList.toggle('on'); b.setAttribute('aria-pressed', arr.includes(id));
        });
        document.querySelectorAll('[data-step]').forEach(st => st.querySelectorAll('button').forEach(b => b.onclick = () => {
            const k = st.dataset.step, lim = k === 'people' ? [1, 10] : [2, 7];
            S[k] = Math.max(lim[0], Math.min(lim[1], S[k] + +b.dataset.d));
            st.querySelector('b').textContent = S[k]; saveSettings();
            $('one-hint').hidden = !(S.people === 1 && !S.leftovers);
        }));
        $('f-zip').oninput = e => { S.zip = e.target.value.replace(/\D/g, '').slice(0, 5); e.target.value = S.zip; saveSettings(); };
        $('f-budget').oninput = e => { const v = parseFloat(e.target.value); if (v > 0) { S.budget = v; saveSettings(); } };
        $('f-breakfast').onchange = e => { S.breakfast = e.target.checked; saveSettings(); };
        $('f-lunch').onchange = e => { S.lunch = e.target.checked; saveSettings(); };
        $('f-leftovers').onchange = e => { S.leftovers = e.target.checked; saveSettings(); $('one-hint').hidden = !(S.people === 1 && !S.leftovers); };
        $('f-snacks').onchange = e => { S.snacks = e.target.checked; saveSettings(); };
        $('f-cal').oninput = e => { S.calGoal = e.target.value; saveSettings(); };
        $('f-pro').oninput = e => { S.proGoal = e.target.value; saveSettings(); };
        $('f-staples').onchange = e => { S.staples = e.target.checked; saveSettings(); if (PLAN) renderResults(); };
        $('f-chain').onchange = e => { NEARBY = null; setStore(e.target.value, null); };
        $('find-stores').onclick = findNearby;
        document.querySelectorAll('[data-near]').forEach(b => b.onclick = () => {
            const s = NEARBY.list[+b.dataset.near];
            setStore(s.chain, { name: s.name, addr: s.addr, dist: s.dist, chain: s.chain });
            toast(`Shopping at ${s.name}`);
        });
        $('go').onclick = generate;
        bindSettingsLinks();
    }
    function bindSettingsLinks() { document.querySelectorAll('[data-act="settings"]').forEach(a => a.onclick = e => { e.preventDefault(); openSettings(); }); }
    function bindResults() {
        document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; renderResults(); });
        document.querySelectorAll('[data-got]').forEach(c => c.onchange = () => { PLAN.got[c.dataset.got] = c.checked; store(KEY_PLAN, PLAN); c.closest('.item').classList.toggle('got', c.checked); });
        document.querySelectorAll('[data-have]').forEach(b => b.onclick = () => { const id = b.dataset.have; PLAN.have[id] = !PLAN.have[id]; store(KEY_PLAN, PLAN); renderResults(); });
        document.querySelectorAll('[data-swap]').forEach(b => b.onclick = () => swapDinner(+b.dataset.swap));
        document.querySelectorAll('#results [data-act]').forEach(b => b.onclick = e => {
            const a = b.dataset.act;
            if (a === 'print') printAll();
            if (a === 'copy') copyList();
            if (a === 'regen') generate();
            if (a === 'settings') { e.preventDefault(); openSettings(); }
        });
    }
    async function generate() {
        const btn = $('go');
        if (chain().kroger && S.worker) {
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
        const lines = [`WeekCart: ${storeLabel()} list (${money(L.total)})`, ''];
        L.groups.forEach(g => { lines.push(`${g.icon} ${g.label.toUpperCase()}`); g.rows.filter(r => !PLAN.have[r.id]).forEach(r => lines.push(`☐ ${r.n > 1 ? r.n + '× ' : ''}${r.live ? r.live.name : r.it.n} (${pkgText(r)}) ${money(r.total)}`)); lines.push(''); });
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
    window.WC = { buildPlan, shoppingList, dailyNutrition, get S() { return S; }, get PLAN() { return PLAN; }, set PLAN(p) { PLAN = p; }, needs, costOfNeed, parseSize, render, R, ITEMS, chain, findNearby, printAll };

    document.addEventListener('DOMContentLoaded', () => {
        loadLiveCache();
        if (PLAN && !PLAN.snacks) PLAN.snacks = [];
        document.querySelectorAll('[data-act="settings"]').forEach(a => a.onclick = e => { e.preventDefault(); openSettings(); });
        render();
    });
})();
