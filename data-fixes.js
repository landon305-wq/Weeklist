// ==========================================
// WeekCart — live-price matching fixes
// Keeps ready-to-eat deli food (fried drumsticks, rotisserie, "fully cooked") from being matched
// to raw meat that a recipe needs. Applies to Kroger live prices only.
// ==========================================
(function () {
    if (!window.WC_ITEMS) return;
    const cooked = 'deli kitchen|\\bfried\\b|rotisserie|precooked|fully cooked|available \\d';
    window.WC_ITEMS.forEach(it => {
        if (it.s !== 'meat' || it.id === 'wholechk') return;
        // "cooked" alone also matched "Uncooked", which is exactly what we want
        const base = (it.not || '').replace(/(^|\|)(pre)?cooked(?=\||$)/g, (m, bar, pre) => bar + (pre ? 'precooked' : '(?<!un)cooked'));
        it.not = base ? base + '|' + cooked : cooked;
    });
})();
