// ==========================================
// WeekCart — grocery chains
// idx = price level compared with the base prices in data-items.js (base 'a' = ALDI column, 'k' = Kroger column).
// These are rough ESTIMATES from typical price comparisons, so edit them anytime.
// layout = walking order (see WC_LAYOUTS). kroger = can use live Kroger prices.
// group = heading in the store menu. Order matters for matching store names: specific names come first.
// ==========================================
(function () {
    const C = [];
    const add = (group, list) => list.forEach(([id, name, base, idx, layout, match, extra]) => C.push(Object.assign({ id, name, base, idx, layout, match, group }, extra || {})));

    add('Discount', [
        ['aldi', 'ALDI', 'a', 1.00, 'aldi', /\baldi\b/i],
        ['lidl', 'Lidl', 'a', 1.03, 'aldi', /\blidl\b/i],
        ['savealot', 'Save A Lot', 'a', 1.06, 'aldi', /save[\s-]?a[\s-]?lot/i],
        ['pricerite', 'Price Rite', 'k', 0.89, 'standard', /price ?rite/i],
        ['grocoutlet', 'Grocery Outlet', 'k', 0.88, 'standard', /grocery outlet/i],
        ['winco', 'WinCo Foods', 'k', 0.86, 'standard', /winco/i],
        ['foodmaxx', 'FoodMaxx', 'k', 0.89, 'standard', /foodmaxx/i],
        ['woodmans', "Woodman's", 'k', 0.91, 'standard', /woodman'?s/i],
        ['marketbasket', 'Market Basket', 'k', 0.88, 'standard', /market basket/i]
    ]);
    add('Supercenters', [
        ['walmart', 'Walmart', 'k', 0.90, 'walmart', /walmart|wal-mart/i],
        ['meijer', 'Meijer', 'k', 0.95, 'walmart', /meijer/i],
        ['target', 'Target', 'k', 1.02, 'walmart', /\btarget\b/i],
        ['fredmeyer', 'Fred Meyer', 'k', 1.00, 'walmart', /fred meyer/i, { kroger: true }]
    ]);
    add('Kroger family (live prices available)', [
        ['kroger', 'Kroger', 'k', 1.00, 'standard', /kroger/i, { kroger: true }],
        ['ralphs', 'Ralphs', 'k', 1.06, 'standard', /ralphs/i, { kroger: true }],
        ['kingsoopers', 'King Soopers', 'k', 1.02, 'standard', /king soopers/i, { kroger: true }],
        ['frys', "Fry's Food", 'k', 1.00, 'standard', /fry'?s/i, { kroger: true }],
        ['smiths', "Smith's", 'k', 1.00, 'standard', /smith'?s/i, { kroger: true }],
        ['qfc', 'QFC', 'k', 1.08, 'standard', /\bqfc\b|quality food cent/i, { kroger: true }],
        ['marianos', "Mariano's", 'k', 1.08, 'standard', /mariano/i, { kroger: true }],
        ['picknsave', "Pick 'n Save", 'k', 1.02, 'standard', /pick ?'?n ?save/i, { kroger: true }],
        ['dillons', 'Dillons', 'k', 1.00, 'standard', /dillons/i, { kroger: true }],
        ['food4less', 'Food 4 Less / Foods Co', 'k', 0.94, 'standard', /food 4 less|food4less|foods co\b/i, { kroger: true }],
        ['citymarket', 'City Market', 'k', 1.04, 'standard', /city market/i, { kroger: true }],
        ['harristeeter', 'Harris Teeter', 'k', 1.08, 'standard', /harris teeter/i, { kroger: true }],
        ['krogerother', "Baker's / Gerbes / Jay C / Metro Market / Pay-Less", 'k', 1.00, 'standard', /baker'?s|gerbes|jay ?c\b|metro market|pay[- ]?less|copps/i, { kroger: true }]
    ]);
    add('Albertsons family', [
        ['tomthumb', 'Tom Thumb', 'k', 1.13, 'standard', /tom thumb/i],
        ['randalls', 'Randalls', 'k', 1.13, 'standard', /randalls/i],
        ['albertsons', 'Albertsons', 'k', 1.12, 'standard', /albertsons/i],
        ['safeway', 'Safeway', 'k', 1.13, 'standard', /safeway/i],
        ['vons', 'Vons / Pavilions', 'k', 1.13, 'standard', /vons|pavilions/i],
        ['jewel', 'Jewel-Osco', 'k', 1.12, 'standard', /jewel/i],
        ['acme', 'ACME Markets', 'k', 1.14, 'standard', /\bacme\b/i],
        ['shaws', "Shaw's / Star Market", 'k', 1.14, 'standard', /shaw'?s|star market/i],
        ['albertsonsother', 'Carrs / Haggen / United / Market Street', 'k', 1.13, 'standard', /carrs|haggen|united supermarket|market street|amigos|kings food|balducci/i]
    ]);
    add('Texas & Southwest', [
        ['heb', 'H-E-B', 'k', 0.93, 'standard', /\bh-?e-?b\b/i],
        ['centralmarket', 'Central Market', 'k', 1.20, 'standard', /central market/i],
        ['fiesta', 'Fiesta Mart', 'k', 0.95, 'standard', /fiesta mart|fiesta foods/i],
        ['brookshire', "Brookshire's / Super 1 Foods", 'k', 1.07, 'standard', /brookshire'?s(?! brothers)|super 1/i],
        ['brookbros', 'Brookshire Brothers', 'k', 1.08, 'standard', /brookshire brothers/i],
        ['elrancho', 'El Rancho / La Michoacana', 'k', 0.95, 'standard', /el rancho|la michoacana/i],
        ['bashas', "Bashas' / Food City (AZ)", 'k', 1.08, 'standard', /bashas/i],
        ['homeland', 'Homeland / Harps', 'k', 1.05, 'standard', /homeland|harps/i]
    ]);
    add('South & Southeast', [
        ['publix', 'Publix', 'k', 1.15, 'standard', /publix/i],
        ['foodlion', 'Food Lion', 'k', 0.99, 'standard', /food lion/i],
        ['winndixie', 'Winn-Dixie', 'k', 1.06, 'standard', /winn[- ]?dixie/i],
        ['ingles', 'Ingles', 'k', 1.04, 'standard', /ingles/i],
        ['lowesfoods', 'Lowes Foods', 'k', 1.06, 'standard', /lowes foods/i],
        ['foodcity', 'Food City', 'k', 1.03, 'standard', /food city/i],
        ['rouses', 'Rouses', 'k', 1.10, 'standard', /rouses/i],
        ['piggly', 'Piggly Wiggly', 'k', 1.06, 'standard', /piggly wiggly/i],
        ['bilo', 'Bi-Lo / Harveys', 'k', 1.05, 'standard', /bi-?lo|harveys/i]
    ]);
    add('Midwest', [
        ['hyvee', 'Hy-Vee', 'k', 1.05, 'standard', /hy-?vee/i],
        ['schnucks', 'Schnucks', 'k', 1.06, 'standard', /schnucks/i],
        ['dierbergs', 'Dierbergs', 'k', 1.12, 'standard', /dierbergs/i],
        ['fareway', 'Fareway', 'k', 1.00, 'standard', /fareway/i],
        ['cub', 'Cub Foods', 'k', 1.03, 'standard', /\bcub\b/i],
        ['festival', 'Festival Foods', 'k', 1.05, 'standard', /festival foods/i],
        ['gianteagle', 'Giant Eagle', 'k', 1.07, 'standard', /giant eagle/i],
        ['freshthyme', 'Fresh Thyme', 'k', 1.08, 'standard', /fresh thyme/i],
        ['buehlers', "Buehler's / Marc's", 'k', 1.04, 'standard', /buehler|marc'?s/i],
        ['spartan', 'SpartanNash / Family Fare / D&W', 'k', 1.06, 'standard', /family fare|d ?& ?w|spartan|martin'?s super/i]
    ]);
    add('Northeast & Mid-Atlantic', [
        ['wegmans', 'Wegmans', 'k', 1.01, 'standard', /wegmans/i],
        ['shoprite', 'ShopRite', 'k', 1.02, 'standard', /shop ?rite/i],
        ['stopshop', 'Stop & Shop', 'k', 1.09, 'standard', /stop ?& ?shop/i],
        ['giant', 'Giant / Giant Food / Martin\'s', 'k', 1.08, 'standard', /\bgiant\b|martin'?s food/i],
        ['hannaford', 'Hannaford', 'k', 1.07, 'standard', /hannaford/i],
        ['pricechopper', 'Price Chopper / Market 32', 'k', 1.07, 'standard', /price chopper|market 32/i],
        ['tops', 'Tops Markets', 'k', 1.06, 'standard', /\btops\b/i],
        ['weis', 'Weis Markets', 'k', 1.04, 'standard', /weis/i],
        ['bigy', 'Big Y', 'k', 1.08, 'standard', /big y\b/i],
        ['keyfood', 'Key Food / C-Town / Bravo', 'k', 1.10, 'standard', /key food|c-?town|bravo super/i],
        ['stewleonards', "Stew Leonard's / Fairway", 'k', 1.15, 'standard', /stew leonard|fairway/i]
    ]);
    add('West', [
        ['staterbros', 'Stater Bros.', 'k', 1.00, 'standard', /stater/i],
        ['smartfinal', 'Smart & Final', 'k', 0.98, 'standard', /smart ?& ?final/i],
        ['raleys', "Raley's / Bel Air / Nob Hill", 'k', 1.15, 'standard', /raley'?s|bel air|nob hill/i],
        ['savemart', 'Save Mart / Lucky', 'k', 1.10, 'standard', /save mart|lucky/i],
        ['latino', 'Vallarta / Cardenas / Northgate / El Super', 'k', 0.95, 'standard', /vallarta|cardenas|northgate|el super|superior grocers|food 4 less/i]
    ]);
    add('Specialty & natural', [
        ['traderjoes', "Trader Joe's", 'k', 1.02, 'standard', /trader joe/i],
        ['sprouts', 'Sprouts', 'k', 1.12, 'standard', /sprouts/i],
        ['naturalgrocers', 'Natural Grocers', 'k', 1.15, 'standard', /natural grocers/i],
        ['wholefoods', 'Whole Foods', 'k', 1.25, 'standard', /whole foods/i]
    ]);
    add('Other', [
        ['local', 'Local supermarket (typical prices)', 'k', 1.05, 'standard', null]
    ]);
    window.WC_CHAINS = C;
})();
