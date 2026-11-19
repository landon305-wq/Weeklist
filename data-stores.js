// ==========================================
// WeekCart — grocery chains
// idx = price level compared with the base prices in data-items.js (ALDI-priced chains use the ALDI column).
// These are rough ESTIMATES from typical price comparisons. Edit them anytime.
// layout = which walking order to use (see WC_LAYOUTS). kroger = can use live Kroger prices.
// ==========================================
window.WC_CHAINS = [
    { id: 'aldi', name: 'ALDI', base: 'a', idx: 1.00, layout: 'aldi', match: /\baldi\b/i },
    { id: 'lidl', name: 'Lidl', base: 'a', idx: 1.03, layout: 'aldi', match: /\blidl\b/i },
    { id: 'savealot', name: 'Save A Lot', base: 'a', idx: 1.06, layout: 'aldi', match: /save[\s-]?a[\s-]?lot/i },
    { id: 'walmart', name: 'Walmart', base: 'k', idx: 0.90, layout: 'walmart', match: /walmart|wal-mart/i },
    { id: 'winco', name: 'WinCo Foods', base: 'k', idx: 0.86, layout: 'standard', match: /winco/i },
    { id: 'marketbasket', name: 'Market Basket', base: 'k', idx: 0.88, layout: 'standard', match: /market basket/i },
    { id: 'foodmaxx', name: 'FoodMaxx / Grocery Outlet', base: 'k', idx: 0.88, layout: 'standard', match: /foodmaxx|grocery outlet/i },
    { id: 'heb', name: 'H-E-B', base: 'k', idx: 0.93, layout: 'standard', match: /\bh-?e-?b\b/i },
    { id: 'meijer', name: 'Meijer', base: 'k', idx: 0.95, layout: 'walmart', match: /meijer/i },
    { id: 'kroger', name: 'Kroger', base: 'k', idx: 1.00, layout: 'standard', kroger: true,
      match: /kroger|ralphs|fred meyer|king soopers|fry'?s food|smith'?s|\bqfc\b|mariano|pick ?'?n ?save|dillons|food 4 less|foods co|city market|baker'?s|gerbes|jay ?c\b|metro market|pay[- ]?less|copps/i },
    { id: 'harristeeter', name: 'Harris Teeter', base: 'k', idx: 1.08, layout: 'standard', kroger: true, match: /harris teeter/i },
    { id: 'foodlion', name: 'Food Lion', base: 'k', idx: 0.99, layout: 'standard', match: /food lion/i },
    { id: 'target', name: 'Target', base: 'k', idx: 1.02, layout: 'walmart', match: /\btarget\b/i },
    { id: 'traderjoes', name: "Trader Joe's", base: 'k', idx: 1.02, layout: 'standard', match: /trader joe/i },
    { id: 'wegmans', name: 'Wegmans', base: 'k', idx: 1.01, layout: 'standard', match: /wegmans/i },
    { id: 'shoprite', name: 'ShopRite', base: 'k', idx: 1.02, layout: 'standard', match: /shop ?rite/i },
    { id: 'hyvee', name: 'Hy-Vee', base: 'k', idx: 1.05, layout: 'standard', match: /hy-?vee/i },
    { id: 'gianteagle', name: 'Giant Eagle', base: 'k', idx: 1.07, layout: 'standard', match: /giant eagle/i },
    { id: 'giant', name: 'Giant / Stop & Shop / Hannaford', base: 'k', idx: 1.08, layout: 'standard', match: /\bgiant\b|stop ?& ?shop|hannaford|martin'?s food/i },
    { id: 'winndixie', name: 'Winn-Dixie / Piggly Wiggly', base: 'k', idx: 1.06, layout: 'standard', match: /winn[- ]?dixie|piggly wiggly|harveys/i },
    { id: 'publix', name: 'Publix', base: 'k', idx: 1.15, layout: 'standard', match: /publix/i },
    { id: 'safeway', name: 'Safeway / Albertsons family', base: 'k', idx: 1.13, layout: 'standard', match: /safeway|albertsons|vons|jewel|acme|shaw'?s|tom thumb|randalls|pavilions|star market|carrs|haggen/i },
    { id: 'sprouts', name: 'Sprouts', base: 'k', idx: 1.12, layout: 'standard', match: /sprouts/i },
    { id: 'wholefoods', name: 'Whole Foods', base: 'k', idx: 1.25, layout: 'standard', match: /whole foods/i },
    { id: 'local', name: 'Local supermarket', base: 'k', idx: 1.05, layout: 'standard', match: null }
];
