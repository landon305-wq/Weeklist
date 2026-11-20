// ==========================================
// WeekCart — snack & extras aisles
// Adds ~120 store items (protein snacks, chips, sweets, bars, fruit, drinks, frozen, household),
// ~35 grab-and-go snack ideas the planner can use to hit calorie / protein goals,
// and the aisle groups shown in the "Snacks & extras" picker.
// Prices are typical store-brand estimates (ALDI-style = a, Kroger-style = k), adjusted by the app for your area.
// Row: [id, name, units per package, unit, plural, ALDI $, Kroger $, package, search term, must, not, allergens, calories per unit, protein g per unit]
// ==========================================
(function () {
    if (!window.WC_ITEMS || !window.WC_NUTR) return;
    if (window.WC_SECTIONS && !window.WC_SECTIONS.household) {
        window.WC_SECTIONS.household = { name: 'Household & paper', icon: '🧻' };
        Object.values(window.WC_LAYOUTS || {}).forEach(l => { if (!l.order.includes('household')) l.order.push('household'); });
    }
    const have = new Set(window.WC_ITEMS.map(i => i.id));
    function add(s, rows) {
        rows.forEach(([id, n, p, u, pl, a, k, pk, t, must, not, alg, cal, pro]) => {
            if (have.has(id)) return;
            const it = { id, n, s, p, u, a, k, pk, t, must };
            if (pl) it.pl = pl;
            if (u === 'oz') it.oz = 1; else it.ct = 1;
            if (not) it.not = not;
            if (alg && alg.length) it.alg = alg;
            window.WC_ITEMS.push(it); have.add(id);
            window.WC_NUTR[id] = [cal, pro];
        });
    }

    // ---------------- PROTEIN SNACKS ----------------
    add('snacks', [
        ['x_turkeyjerky', 'Turkey jerky', 3, 'oz', '', 5.49, 6.99, '3 oz bag', 'turkey jerky 3 oz', 'jerky', 'dog|pet', [], 70, 12],
        ['x_meatsticks', 'Smoked meat sticks', 10, 'stick', 'sticks', 4.99, 6.49, '10-pack', 'smoked meat sticks original', 'stick', 'dog|pet|cheese stick', [], 100, 6],
        ['x_turkeysticks', 'Turkey snack sticks', 8, 'stick', 'sticks', 4.99, 5.99, '8-pack', 'turkey snack sticks', 'turkey', 'dog|pet', [], 70, 7],
        ['x_rtdshake', 'Protein shakes (ready to drink)', 4, 'bottle', 'bottles', 6.99, 8.99, '4-pack (11 oz)', 'protein shake 30g 4 pack', 'protein', 'powder|bar', ['dairy'], 160, 30],
        ['x_protpudding', 'Protein pudding cups', 4, 'cup', 'cups', 4.49, 5.49, '4-pack', 'protein pudding cups', 'pudding', 'mix', ['dairy'], 140, 20],
        ['x_almonds', 'Roasted almonds', 16, 'oz', '', 5.49, 6.99, '16 oz bag', 'roasted salted almonds 16 oz', 'almond', 'milk|butter|flour|chocolate', ['nuts'], 165, 6],
        ['x_peanuts', 'Dry-roasted peanuts', 16, 'oz', '', 2.49, 3.29, '16 oz jar', 'dry roasted peanuts 16 oz', 'peanut', 'butter|candy|chocolate', ['nuts'], 165, 7],
        ['x_pistachios', 'Pistachios', 16, 'oz', '', 6.99, 8.99, '16 oz bag', 'roasted pistachios 16 oz', 'pistachio', 'ice cream|pudding', ['nuts'], 160, 6],
        ['x_mixednuts', 'Mixed nuts', 15, 'oz', '', 6.49, 7.99, '15 oz can', 'mixed nuts 15 oz', 'nut', 'butter|bar|chocolate', ['nuts'], 170, 5],
        ['x_cashews', 'Cashews', 16, 'oz', '', 6.99, 8.49, '16 oz bag', 'roasted cashews 16 oz', 'cashew', 'milk|butter|chocolate', ['nuts'], 160, 5],
        ['x_pepitas', 'Pumpkin seeds', 8, 'oz', '', 3.49, 4.49, '8 oz bag', 'roasted pumpkin seeds pepitas', 'pumpkin seed|pepita', 'pie|bread', [], 160, 9],
        ['x_sunflower', 'Sunflower seeds', 5, 'oz', '', 1.49, 1.99, '5 oz bag', 'sunflower seeds', 'sunflower', 'oil|butter', [], 160, 6],
        ['x_chickpeas', 'Roasted chickpeas', 6, 'oz', '', 2.99, 3.99, '6 oz bag', 'roasted chickpea snack', 'chickpea', 'can|hummus', [], 120, 6],
        ['x_porkrinds', 'Pork rinds', 3, 'oz', '', 2.49, 3.29, '3 oz bag', 'pork rinds original', 'pork rind|chicharr', '', [], 80, 9],
        ['x_protchips', 'Protein chips', 4, 'bag', 'bags', 5.99, 7.49, '4 single bags', 'protein chips', 'protein', 'bar|powder|shake', ['dairy'], 140, 18],
        ['x_pbcups', 'Peanut butter squeeze packs', 8, 'pack', 'packs', 3.49, 4.49, '8 packs', 'peanut butter squeeze packs', 'peanut butter', 'cup|candy|cracker', ['nuts'], 190, 7],
        ['x_ricecakes', 'Rice cakes', 14, 'cake', 'cakes', 1.69, 2.49, '14-cake sleeve', 'lightly salted rice cakes', 'rice cake', 'mini|chocolate|caramel', [], 35, 1]
    ]);
    add('dairy', [
        ['x_hbeggs', 'Hard-boiled eggs (peeled)', 6, 'egg', 'eggs', 2.99, 3.99, '6-pack', 'hard boiled eggs peeled', 'egg', 'salad|dye', ['egg'], 70, 6],
        ['x_skyr', 'Icelandic skyr cups', 4, 'cup', 'cups', 4.49, 5.49, '4-pack (5.3 oz)', 'icelandic skyr yogurt', 'skyr|icelandic', 'drink', ['dairy'], 110, 15],
        ['x_cottagecups', 'Cottage cheese cups', 4, 'cup', 'cups', 3.99, 4.99, '4-pack (4 oz)', 'cottage cheese single serve cups', 'cottage', '24 oz|16 oz', ['dairy'], 110, 13],
        ['x_kefir', 'Kefir (drinkable yogurt)', 4, 'cup', 'cups', 3.49, 4.29, '32 oz bottle', 'lowfat kefir 32 oz', 'kefir', '', ['dairy'], 110, 10],
        ['x_ufmilk', 'High-protein milk (ultra-filtered)', 6.5, 'cup', 'cups', 3.99, 4.99, '52 oz', 'ultra filtered milk 52 oz', 'milk', 'almond|oat|soy|chocolate', ['dairy'], 80, 13],
        ['x_chocmilk', 'Chocolate milk', 8, 'cup', 'cups', 2.49, 3.29, 'half gallon', 'lowfat chocolate milk half gallon', 'chocolate milk', 'almond|oat', ['dairy'], 190, 8],
        ['x_yogtubes', 'Yogurt tubes', 8, 'tube', 'tubes', 2.49, 3.29, '8-pack', 'yogurt tubes 8 count', 'yogurt', 'cup|tub|greek', ['dairy'], 60, 2],
        ['x_snackcheese', 'Cheddar snack bars', 10, 'bar', 'bars', 3.49, 4.29, '10-pack', 'cheddar cheese snack bars', 'cheese', 'cracker|string', ['dairy'], 100, 6],
        ['x_minicheese', 'Mini cheese rounds', 6, 'piece', 'pieces', 3.99, 4.99, '6-pack', 'mini semisoft cheese rounds', 'cheese', 'cracker|string', ['dairy'], 70, 5],
        ['x_pudding', 'Pudding cups', 4, 'cup', 'cups', 1.49, 1.99, '4-pack', 'chocolate pudding cups 4 pack', 'pudding', 'mix|protein', ['dairy'], 100, 2],
        ['x_gelatin', 'Gelatin cups', 4, 'cup', 'cups', 1.49, 1.99, '4-pack', 'gelatin snack cups', 'gelatin|jell', '', [], 70, 1]
    ]);
    add('canned', [
        ['x_tunapouch', 'Tuna pouches', 4, 'pouch', 'pouches', 4.49, 5.49, '4 pouches (2.5 oz)', 'light tuna pouch 2.5 oz', 'tuna', 'cat|dog|kit|cracker', ['fish'], 80, 17],
        ['x_tunakit', 'Tuna & crackers snack kits', 3, 'kit', 'kits', 3.99, 4.79, '3 kits', 'tuna salad cracker kit', 'tuna', 'cat|dog', ['fish', 'gluten'], 200, 14],
        ['x_chkpouch', 'Chicken breast pouches', 3, 'pouch', 'pouches', 5.49, 6.99, '3 pouches (2.6 oz)', 'chunk chicken breast pouch', 'chicken', 'dog|cat|soup|noodle', [], 90, 16],
        ['x_salmonpouch', 'Salmon pouches', 2, 'pouch', 'pouches', 4.29, 5.49, '2 pouches (2.5 oz)', 'pink salmon pouch', 'salmon', 'cat|dog', ['fish'], 70, 13]
    ]);
    add('deli', [
        ['x_snacktray', 'Salami, cheese & cracker trays', 3, 'tray', 'trays', 4.49, 5.99, '3 snack trays', 'salami cheese crackers snack tray', 'salami|snack', 'dog|pet', ['dairy', 'gluten'], 250, 11],
        ['x_hummuscups', 'Hummus snack cups', 6, 'cup', 'cups', 3.99, 4.99, '6 cups (2 oz)', 'hummus single serve cups', 'hummus', 'chip|pretzel', [], 100, 3],
        ['x_frenchonion', 'French onion dip', 1, 'tub', 'tubs', 1.79, 2.49, '16 oz tub', 'french onion dip 16 oz', 'dip', 'mix|chip', ['dairy'], 960, 12]
    ]);
    add('frozen', [
        ['x_eggbites', 'Egg bites', 4, 'bite', 'bites', 4.99, 6.49, '4-pack', 'sous vide egg bites', 'egg bite', 'dog', ['egg', 'dairy'], 150, 10],
        ['x_protwaffle', 'Protein waffles', 8, 'waffle', 'waffles', 3.99, 4.99, '8 waffles', 'protein frozen waffles', 'waffle', 'mix|syrup', ['gluten', 'egg', 'dairy'], 110, 6],
        ['x_greekbars', 'Greek yogurt bars (frozen)', 6, 'bar', 'bars', 3.99, 4.99, '6 bars', 'frozen greek yogurt bars', 'greek|yogurt', 'cup|tub', ['dairy'], 100, 6],
        ['x_nuggets', 'Chicken nuggets', 1, 'bag', 'bags', 5.99, 7.99, '2 lb bag', 'frozen chicken nuggets 2 lb', 'nugget', 'dog|plant', ['gluten'], 2400, 128],
        ['x_protmeals', 'High-protein frozen bowls', 1, 'bowl', 'bowls', 3.49, 4.49, 'single bowl', 'high protein frozen bowl', 'bowl', 'dog|pet|cereal', [], 400, 30],
        ['x_frzmeals', 'Frozen single-serve meals', 1, 'meal', 'meals', 2.29, 3.29, 'single meal', 'frozen single serve entree', 'meal|entree|bowl', 'dog|pet', [], 350, 18],
        ['x_brksandwich', 'Frozen breakfast sandwiches', 4, 'sandwich', 'sandwiches', 4.99, 6.99, '4-pack', 'frozen sausage egg cheese breakfast sandwiches', 'sandwich', 'bread|bag', ['gluten', 'egg', 'dairy'], 330, 13],
        ['x_frzburritos', 'Frozen burritos', 8, 'burrito', 'burritos', 3.99, 5.49, '8-pack', 'frozen bean cheese burritos 8 pack', 'burrito', 'bowl|seasoning', ['gluten', 'dairy'], 300, 9],
        ['x_pizzarolls', 'Pizza rolls', 1, 'bag', 'bags', 3.49, 4.99, '40-count bag', 'pepperoni pizza rolls 40 count', 'pizza roll|pizza snack', '', ['gluten', 'dairy'], 1800, 48],
        ['x_mozzsticks', 'Mozzarella sticks', 1, 'box', 'boxes', 4.49, 5.99, '24 oz box', 'frozen mozzarella sticks', 'mozzarella stick', 'string', ['dairy', 'gluten'], 2000, 80],
        ['x_fries', 'Frozen fries', 1, 'bag', 'bags', 2.49, 3.49, '32 oz bag', 'frozen french fries 32 oz', 'fries|fry', 'sweet potato', [], 1400, 14],
        ['x_potstickers', 'Potstickers', 1, 'bag', 'bags', 4.99, 6.99, '24 oz bag', 'frozen pork potstickers', 'potsticker|dumpling', '', ['gluten'], 1200, 48],
        ['x_frzfruit', 'Frozen fruit (smoothie mix)', 1, 'bag', 'bags', 5.49, 6.99, '2 lb bag', 'frozen mixed fruit 2 lb', 'fruit|berr|mango', 'bar|pie|juice', [], 500, 4],
        ['x_icepops', 'Ice pops', 1, 'box', 'boxes', 2.49, 3.29, '12-pack', 'fruit ice pops 12 count', 'pop|ice bar', '', [], 480, 0],
        ['x_icecreambars', 'Ice cream bars', 1, 'box', 'boxes', 3.49, 4.49, '6 bars', 'ice cream bars 6 count', 'bar|sandwich', 'cereal', ['dairy'], 1200, 18]
    ]);

    // ---------------- CHIPS, DIPS & SALTY ----------------
    add('snacks', [
        ['x_kettlechips', 'Kettle chips', 1, 'bag', 'bags', 2.49, 3.99, '8 oz bag', 'kettle cooked potato chips', 'kettle|chip', 'tortilla', [], 1200, 14],
        ['x_cornchips', 'Corn chips', 1, 'bag', 'bags', 1.99, 3.29, '10 oz bag', 'corn chips original', 'corn chip', 'tortilla', [], 1500, 18],
        ['x_pitachips', 'Pita chips', 1, 'bag', 'bags', 2.49, 3.49, '7 oz bag', 'sea salt pita chips', 'pita', 'bread|pocket', ['gluten'], 1000, 25],
        ['x_veggiestraws', 'Veggie straws', 1, 'bag', 'bags', 2.29, 3.49, '7 oz bag', 'veggie straws', 'veggie|vegetable', 'frozen|tray', [], 1000, 5],
        ['x_cheesepuffs', 'Cheese puffs', 1, 'bag', 'bags', 1.99, 3.29, '8 oz bag', 'cheese puffs', 'cheese', 'cracker', ['dairy'], 1300, 15],
        ['x_readypopcorn', 'Bagged popcorn (ready to eat)', 1, 'bag', 'bags', 2.29, 3.49, '6 oz bag', 'white cheddar popcorn bag', 'popcorn', 'microwave|kernel', ['dairy'], 800, 12],
        ['x_snackmix', 'Snack mix', 1, 'bag', 'bags', 2.99, 3.99, '15 oz bag', 'traditional snack mix', 'mix', 'trail|cake|drink', ['gluten'], 1700, 35],
        ['x_queso', 'Queso dip', 1, 'jar', 'jars', 2.49, 3.49, '15 oz jar', 'salsa con queso dip', 'queso', 'fresco|blanco cheese', ['dairy'], 600, 12],
        ['x_beandip', 'Bean dip', 1, 'can', 'cans', 1.79, 2.49, '9 oz can', 'bean dip', 'bean dip', '', [], 400, 20],
        ['x_raisins', 'Raisin snack boxes', 6, 'box', 'boxes', 1.99, 2.79, '6 mini boxes', 'raisins snack boxes 6 pack', 'raisin', 'bran|bread|cookie', [], 90, 1],
        ['x_driedmango', 'Dried mango', 1, 'bag', 'bags', 2.99, 3.99, '6 oz bag', 'dried mango slices', 'mango', 'frozen|juice', [], 550, 3],
        ['x_craisins', 'Dried cranberries', 1, 'bag', 'bags', 2.49, 3.29, '12 oz bag', 'dried cranberries', 'cranberr', 'juice|sauce', [], 1200, 0]
    ]);

    // ---------------- SWEETS & BAKERY ----------------
    add('snacks', [
        ['x_sandcookies', 'Sandwich cookies', 1, 'pack', 'packs', 1.99, 3.49, '14 oz pack', 'chocolate sandwich cookies', 'cookie', 'dough|ice cream|cereal', ['gluten'], 2000, 15],
        ['x_grahams', 'Graham crackers', 1, 'box', 'boxes', 1.99, 3.29, '14 oz box', 'honey graham crackers', 'graham', 'crust|pie', ['gluten'], 1700, 24],
        ['x_chocbar', 'Chocolate bars', 6, 'bar', 'bars', 3.99, 5.99, '6-pack', 'milk chocolate candy bars 6 pack', 'chocolate', 'chip|syrup|milk drink', ['dairy'], 210, 3],
        ['x_candy', 'Candy (share-size bag)', 1, 'bag', 'bags', 2.99, 3.99, '10 oz bag', 'chocolate candy share size', 'candy|chocolate', '', ['dairy'], 1400, 14],
        ['x_gummies', 'Fruit snacks', 10, 'pouch', 'pouches', 2.49, 3.49, '10 pouches', 'fruit snacks 10 count', 'fruit snack|gummi|gummy', 'vitamin', [], 80, 1],
        ['x_ricetreats', 'Crispy rice treats', 8, 'bar', 'bars', 2.49, 3.49, '8 bars', 'crispy rice marshmallow treats', 'treat|crispy', 'cereal box', [], 90, 1],
        ['x_snackcakes', 'Snack cakes', 1, 'box', 'boxes', 2.49, 3.29, '8-count box', 'snack cakes box', 'cake', 'mix|frosting', ['gluten', 'egg', 'dairy'], 1800, 12]
    ]);
    add('bakery', [
        ['x_donuts', 'Donuts', 1, 'box', 'boxes', 3.49, 4.49, '6-pack', 'glazed donuts 6 count', 'donut|doughnut', 'mini|holes', ['gluten', 'egg', 'dairy'], 1500, 18],
        ['x_muffins', 'Muffins', 1, 'pack', 'packs', 3.99, 4.99, '4-pack', 'blueberry muffins 4 count', 'muffin', 'english|mix', ['gluten', 'egg', 'dairy'], 1700, 24],
        ['x_brownies', 'Brownies', 1, 'tray', 'trays', 3.99, 4.99, '12 oz tray', 'chocolate brownies bakery', 'brownie', 'mix', ['gluten', 'egg', 'dairy'], 1600, 16]
    ]);

    // ---------------- BARS, CEREAL & BREAKFAST GRABS ----------------
    add('breakfast', [
        ['x_cerealbars', 'Cereal bars', 8, 'bar', 'bars', 1.99, 2.99, '8-count box', 'fruit cereal bars 8 count', 'bar', 'protein|granola', ['gluten'], 130, 2],
        ['x_nutbars', 'Nut bars', 5, 'bar', 'bars', 4.49, 5.99, '5-count box', 'dark chocolate nut bars', 'nut|almond', 'butter', ['nuts'], 190, 5],
        ['x_oatpackets', 'Instant oatmeal packets', 10, 'packet', 'packets', 2.49, 3.49, '10 packets', 'instant oatmeal variety pack', 'oat', 'bar|cookie', ['gluten'], 160, 4],
        ['x_protcereal', 'High-protein cereal', 7, 'bowl', 'bowls', 4.99, 6.49, '10 oz box (~7 bowls)', 'high protein cereal', 'protein', 'bar|powder|shake', ['dairy'], 160, 15],
        ['x_cereal', 'Breakfast cereal', 1, 'box', 'boxes', 2.49, 3.99, '12 oz box', 'frosted flakes cereal', 'cereal', 'bar|milk', ['gluten'], 1500, 20],
        ['x_toasterpastry', 'Toaster pastries', 1, 'box', 'boxes', 2.29, 3.29, '8-pack', 'frosted toaster pastries 8 count', 'toaster|pastr|tart', '', ['gluten'], 1600, 16]
    ]);

    // ---------------- FRUIT & VEGGIES ----------------
    add('produce', [
        ['x_blueberries', 'Blueberries', 1, 'pint', 'pints', 2.99, 3.99, '1 pint', 'blueberries pint', 'blueberr', 'frozen|muffin|dried', [], 240, 3],
        ['x_pineapple', 'Pineapple chunks', 1, 'tub', 'tubs', 3.99, 4.99, '16 oz tub', 'fresh pineapple chunks', 'pineapple', 'can|juice|frozen', [], 250, 3],
        ['x_watermelon', 'Mini watermelon', 1, 'melon', 'melons', 3.99, 4.99, 'each', 'seedless mini watermelon', 'watermelon', 'candy|juice', [], 800, 16],
        ['x_pears', 'Pears', 1, 'bag', 'bags', 3.49, 4.49, '2 lb bag', 'bartlett pears 2 lb', 'pear', 'can|cup|juice', [], 500, 3],
        ['x_snappeas', 'Sugar snap peas', 1, 'bag', 'bags', 2.49, 3.49, '8 oz bag', 'sugar snap peas 8 oz', 'snap pea', 'frozen', [], 95, 6],
        ['x_cherrytom', 'Grape tomatoes', 1, 'pint', 'pints', 2.29, 3.29, '1 pint', 'grape tomatoes pint', 'tomato', 'can|sauce|paste', [], 90, 4],
        ['x_minipeppers', 'Mini sweet peppers', 1, 'bag', 'bags', 2.99, 3.99, '1 lb bag', 'mini sweet peppers 1 lb', 'pepper', 'jalape|flakes|ground', [], 120, 4],
        ['x_veggietray', 'Veggie tray with dip', 1, 'tray', 'trays', 5.99, 7.99, '24 oz tray', 'vegetable tray with ranch', 'tray|veg', '', ['dairy'], 600, 10],
        ['x_guaccups', 'Guacamole cups', 6, 'cup', 'cups', 3.99, 4.99, '6 cups (2 oz)', 'guacamole single serve cups', 'guac', 'seasoning|mix', [], 100, 1]
    ]);

    // ---------------- DRINKS ----------------
    add('drinks', [
        ['x_kcups', 'Coffee pods', 1, 'box', 'boxes', 4.99, 7.99, '12 pods', 'medium roast coffee pods 12 count', 'pod|k-cup|cup', 'ground|creamer', [], 0, 0],
        ['x_coldbrew', 'Cold brew coffee', 1, 'bottle', 'bottles', 3.49, 4.99, '48 oz', 'cold brew coffee 48 oz', 'cold brew', 'creamer', [], 30, 0],
        ['x_applejuice', 'Apple juice', 1, 'jug', 'jugs', 1.99, 2.99, '64 oz', 'apple juice 64 oz', 'apple juice', 'box|pouch', [], 960, 0],
        ['x_juiceboxes', 'Juice boxes', 1, 'pack', 'packs', 2.49, 3.49, '8-pack', 'juice boxes 8 pack', 'juice', 'concentrate', [], 480, 0],
        ['x_lemonade', 'Lemonade', 1, 'jug', 'jugs', 1.99, 2.79, '52 oz', 'lemonade 52 oz', 'lemonade', 'mix|powder', [], 700, 0],
        ['x_icedtea', 'Sweet tea', 1, 'jug', 'jugs', 1.99, 2.79, '1 gallon', 'sweet tea gallon', 'tea', 'bag|k-cup', [], 1600, 0],
        ['x_soda', 'Soda (12-pack)', 1, 'pack', 'packs', 4.99, 7.49, '12 cans', 'cola 12 pack cans', 'cola|soda', 'diet|zero', [], 1680, 0],
        ['x_dietsoda', 'Diet soda (12-pack)', 1, 'pack', 'packs', 4.99, 7.49, '12 cans', 'diet cola 12 pack cans', 'diet|zero', '', [], 0, 0],
        ['x_sportsdrink', 'Sports drinks', 1, 'pack', 'packs', 4.49, 5.99, '8 bottles', 'sports drink 8 pack', 'sport|electrolyte|ade', 'powder', [], 1120, 0],
        ['x_energy', 'Energy drinks', 1, 'pack', 'packs', 4.99, 7.99, '4 cans', 'energy drink 4 pack', 'energy', 'bar|shot', [], 440, 0],
        ['x_electrolyte', 'Electrolyte drink mix', 1, 'box', 'boxes', 3.49, 4.99, '10 sticks', 'electrolyte drink mix sticks', 'electrolyte|hydration', '', [], 100, 0],
        ['x_almondmilk', 'Almond milk', 1, 'carton', 'cartons', 2.49, 3.29, 'half gallon', 'unsweetened almond milk half gallon', 'almond', 'butter|nut', ['nuts'], 240, 8],
        ['x_oatmilk', 'Oat milk', 1, 'carton', 'cartons', 2.99, 3.99, 'half gallon', 'oat milk half gallon', 'oat', 'meal|bar|cereal', [], 960, 16]
    ]);

    // ---------------- HOUSEHOLD (no food, but on most real lists) ----------------
    add('household', [
        ['x_papertowels', 'Paper towels', 1, 'pack', 'packs', 6.99, 9.99, '6 rolls', 'paper towels 6 rolls', 'paper towel', 'holder', [], 0, 0],
        ['x_toiletpaper', 'Toilet paper', 1, 'pack', 'packs', 7.99, 10.99, '12 rolls', 'toilet paper 12 rolls', 'bath tissue|toilet paper', '', [], 0, 0],
        ['x_napkins', 'Napkins', 1, 'pack', 'packs', 1.99, 2.99, '250 count', 'paper napkins 250 count', 'napkin', '', [], 0, 0],
        ['x_dishsoap', 'Dish soap', 1, 'bottle', 'bottles', 1.49, 2.49, '24 oz', 'dish soap 24 oz', 'dish', 'pod|dishwasher', [], 0, 0],
        ['x_dishpods', 'Dishwasher pods', 1, 'pack', 'packs', 6.99, 9.99, '40 count', 'dishwasher detergent pods', 'dishwasher', 'cleaner', [], 0, 0],
        ['x_detergent', 'Laundry detergent', 1, 'bottle', 'bottles', 6.99, 9.99, '92 oz', 'liquid laundry detergent', 'detergent', 'dish', [], 0, 0],
        ['x_handsoap', 'Hand soap', 1, 'bottle', 'bottles', 1.29, 2.29, '11 oz', 'liquid hand soap', 'hand soap', 'refill', [], 0, 0],
        ['x_sponges', 'Sponges', 1, 'pack', 'packs', 1.99, 2.99, '3-pack', 'scrub sponges 3 pack', 'sponge', 'cake', [], 0, 0],
        ['x_trashbags', 'Trash bags', 1, 'box', 'boxes', 5.99, 8.49, '40 count (13 gal)', 'tall kitchen trash bags 13 gallon', 'trash|garbage', '', [], 0, 0],
        ['x_foil', 'Aluminum foil', 1, 'roll', 'rolls', 2.99, 4.49, '75 sq ft', 'aluminum foil 75 sq ft', 'foil', 'pan', [], 0, 0],
        ['x_plasticwrap', 'Plastic wrap', 1, 'roll', 'rolls', 1.79, 2.79, '200 sq ft', 'plastic wrap 200 sq ft', 'wrap', 'tortilla', [], 0, 0],
        ['x_zipbags', 'Zip-top bags', 1, 'box', 'boxes', 2.29, 3.49, '30 gallon bags', 'gallon storage bags', 'bag', 'trash', [], 0, 0]
    ]);

    // ---------------- SNACK IDEAS (the planner picks from these to hit goals) ----------------
    if (window.WC_RECIPES) {
        const known = new Set(window.WC_RECIPES.map(r => r.id));
        const S = (id, n, emoji, pro, ing, step) => { if (!known.has(id)) window.WC_RECIPES.push({ id, type: 'snack', n, emoji, pro, time: 2, tags: [], ing, steps: [step] }); };
        S('s_turkeyjerky', 'Turkey jerky', '🦃', 'turkey', [['x_turkeyjerky', 1.5]], 'Grab-and-go lean protein.');
        S('s_meatsticks', 'Two meat sticks', '🥓', 'pork', [['x_meatsticks', 2]], 'Easy to keep in a bag or desk drawer.');
        S('s_turkeystick', 'Turkey stick & string cheese', '🧀', 'turkey', [['x_turkeysticks', 2], ['stringcheese', 1]], 'Pair two turkey sticks with a cheese stick.');
        S('s_hbeggs', 'Peeled hard-boiled eggs', '🥚', 'veg', [['x_hbeggs', 2]], 'Sprinkle with salt, pepper or everything seasoning.');
        S('s_tunapouch', 'Tuna pouch & crackers', '🐟', 'fish', [['x_tunapouch', 1], ['x_crackers', 0.1]], 'Eat the tuna on a few crackers.');
        S('s_tunakit', 'Tuna salad snack kit', '🐟', 'fish', [['x_tunakit', 1]], 'Everything is in the kit.');
        S('s_chkpouch', 'Chicken salad crackers', '🐔', 'chicken', [['x_chkpouch', 1], ['mayo', 1], ['x_crackers', 0.1]], 'Stir the chicken with mayo and spoon onto crackers.');
        S('s_salmonpouch', 'Salmon pouch & rice cakes', '🐟', 'fish', [['x_salmonpouch', 1], ['x_ricecakes', 2]], 'Spread the salmon on two rice cakes.');
        S('s_rtdshake', 'Ready-to-drink protein shake', '🥤', 'veg', [['x_rtdshake', 1]], 'Keep a few cold in the fridge.');
        S('s_skyr', 'Skyr cup', '🥄', 'veg', [['x_skyr', 1]], 'Thick, high-protein yogurt.');
        S('s_skyrparfait', 'Skyr berry parfait', '🍓', 'veg', [['x_skyr', 1], ['berries', 0.1], ['granola', 0.25]], 'Layer skyr with berries and granola.');
        S('s_cottagecup', 'Cottage cheese & pineapple', '🍍', 'veg', [['x_cottagecups', 1], ['x_pineapple', 0.15]], 'Top a cottage cheese cup with pineapple.');
        S('s_kefir', 'Kefir & a banana', '🍌', 'veg', [['x_kefir', 1], ['banana', 1]], 'A cup of kefir with a banana.');
        S('s_protpudding', 'Protein pudding cup', '🍫', 'veg', [['x_protpudding', 1]], 'Tastes like dessert, 20 g of protein.');
        S('s_ufmilk', 'Glass of high-protein milk', '🥛', 'veg', [['x_ufmilk', 1]], 'Ultra-filtered milk has about 13 g of protein a cup.');
        S('s_chocmilk', 'Chocolate milk', '🥛', 'veg', [['x_chocmilk', 1]], 'A classic after a workout.');
        S('s_minicheese', 'Mini cheese & grapes', '🍇', 'veg', [['x_minicheese', 2], ['x_grapes', 0.1]], 'Two cheese rounds and a handful of grapes.');
        S('s_snackcheese', 'Cheddar bar & apple', '🍎', 'veg', [['x_snackcheese', 1], ['apple', 1]], 'A cheese bar with apple slices.');
        S('s_snacktray', 'Salami & cheese snack tray', '🧀', 'pork', [['x_snacktray', 1]], 'Everything is in the tray.');
        S('s_eggbites', 'Egg bites', '🍳', 'veg', [['x_eggbites', 2]], 'Microwave about 1 minute.');
        S('s_almonds', 'Handful of almonds', '🌰', 'veg', [['x_almonds', 1]], 'About 23 almonds is one ounce.');
        S('s_peanuts', 'Dry-roasted peanuts', '🥜', 'veg', [['x_peanuts', 1]], 'One ounce, about a small handful.');
        S('s_pistachios', 'Pistachios', '🥜', 'veg', [['x_pistachios', 1]], 'One ounce, about 49 nuts.');
        S('s_pepitas', 'Pumpkin seeds & raisins', '🎃', 'veg', [['x_pepitas', 1], ['x_raisins', 1]], 'Mix a handful of seeds with a raisin box.');
        S('s_chickpeas', 'Roasted chickpeas', '🫘', 'veg', [['x_chickpeas', 1]], 'Crunchy like chips, with fiber and protein.');
        S('s_porkrinds', 'Pork rinds & queso', '🥓', 'pork', [['x_porkrinds', 1], ['x_queso', 0.05]], 'Dip pork rinds in warm queso.');
        S('s_protchips', 'Protein chips', '🥔', 'veg', [['x_protchips', 1]], 'One single-serve bag.');
        S('s_protbar', 'Protein bar', '🍫', 'veg', [['x_protbar', 1]], 'Keep one in your bag.');
        S('s_protcereal', 'Bowl of protein cereal', '🥣', 'veg', [['x_protcereal', 1], ['milk', 0.75]], 'With cold milk.');
        S('s_protwaffle', 'Protein waffles & peanut butter', '🧇', 'veg', [['x_protwaffle', 2], ['pb', 1]], 'Toast two waffles and spread with peanut butter.');
        S('s_pbcelery', 'Celery & peanut butter pack', '🥜', 'veg', [['x_pbcups', 1], ['celery', 2]], 'Squeeze peanut butter onto celery sticks.');
        S('s_greekbar', 'Frozen Greek yogurt bar', '🍦', 'veg', [['x_greekbars', 1]], 'A cold treat with some protein.');
        S('s_hummuscup', 'Hummus cup & snap peas', '🫛', 'veg', [['x_hummuscups', 1], ['x_snappeas', 0.25]], 'Dip snap peas in hummus.');
        S('s_guacpeppers', 'Guac & mini peppers', '🥑', 'veg', [['x_guaccups', 1], ['x_minipeppers', 0.2]], 'Dip mini peppers in guacamole.');
        S('s_blueyog', 'Yogurt cup & blueberries', '🫐', 'veg', [['yogcup', 1], ['x_blueberries', 0.25]], 'Stir blueberries into a Greek yogurt cup.');
        S('s_ricecakepb', 'Rice cakes & peanut butter', '🍘', 'veg', [['x_ricecakes', 2], ['pb', 1]], 'Spread peanut butter on two rice cakes.');
        S('s_trailmix', 'Trail mix', '🥜', 'veg', [['x_trailmix', 0.1]], 'A small handful.');
        S('s_popcorn', 'Bagged popcorn', '🍿', 'veg', [['x_readypopcorn', 0.25]], 'About 3 cups.');
    }

    // ---------------- AISLES for the "Snacks & extras" picker ----------------
    window.WC_EXTRA_GROUPS = [
        ['💪 Protein snacks', ['x_rtdshake', 'x_protbar', 'x_protpudding', 'x_protchips', 'jerky', 'x_turkeyjerky', 'x_meatsticks', 'x_turkeysticks',
            'stringcheese', 'x_snackcheese', 'x_minicheese', 'x_hbeggs', 'yogcup', 'x_skyr', 'x_cottagecups', 'cottage', 'x_kefir', 'x_ufmilk',
            'x_tunapouch', 'x_tunakit', 'x_chkpouch', 'x_salmonpouch', 'x_snacktray', 'x_eggbites', 'edamame', 'x_chickpeas', 'x_porkrinds',
            'protpowder', 'x_protcereal', 'x_protwaffle', 'x_greekbars', 'x_protmeals', 'eggwhites', 'eggs']],
        ['🥜 Nuts, seeds & trail mix', ['x_almonds', 'x_peanuts', 'x_pistachios', 'x_cashews', 'x_mixednuts', 'x_pepitas', 'x_sunflower', 'x_trailmix', 'x_pbcups', 'pb']],
        ['🍿 Chips, crackers & dips', ['x_potatochips', 'x_kettlechips', 'chips', 'x_cornchips', 'x_pitachips', 'x_veggiestraws', 'x_cheesepuffs', 'x_pretzels',
            'x_popcorn', 'x_readypopcorn', 'x_snackmix', 'x_crackers', 'x_cheesecrackers', 'x_ricecakes', 'salsa', 'x_queso', 'x_beandip', 'x_frenchonion', 'hummus', 'x_hummuscups', 'x_guaccups']],
        ['🍫 Sweets & treats', ['x_cookies', 'x_sandcookies', 'x_grahams', 'x_chocbar', 'x_candy', 'x_gummies', 'x_ricetreats', 'x_snackcakes',
            'x_pudding', 'x_gelatin', 'x_donuts', 'x_muffins', 'x_brownies']],
        ['🥣 Bars, cereal & breakfast grabs', ['x_granolabar', 'x_cerealbars', 'x_nutbars', 'x_oatpackets', 'x_cereal', 'granola', 'x_toasterpastry', 'frzwaffle', 'x_brksandwich']],
        ['🍎 Fruit & veggies', ['banana', 'apple', 'x_oranges', 'x_grapes', 'berries', 'x_blueberries', 'x_pineapple', 'x_watermelon', 'x_pears', 'avocado',
            'babycarrot', 'celery', 'cucumber', 'x_snappeas', 'x_cherrytom', 'x_minipeppers', 'x_veggietray', 'x_applesauce', 'x_fruitcups', 'x_raisins', 'x_driedmango', 'x_craisins']],
        ['🥛 Fridge & dairy', ['milk', 'x_chocmilk', 'x_almondmilk', 'x_oatmilk', 'x_yogtubes', 'yogurt', 'x_creamer', 'butter', 'slcheese', 'delitur', 'deliham']],
        ['🥤 Drinks & coffee', ['x_coffee', 'x_kcups', 'x_coldbrew', 'x_tea', 'x_water', 'x_sparkling', 'x_soda', 'x_dietsoda', 'x_sportsdrink', 'x_electrolyte',
            'x_energy', 'x_oj', 'x_applejuice', 'x_juiceboxes', 'x_lemonade', 'x_icedtea']],
        ['🧊 Frozen', ['x_frzpizza', 'x_pizzarolls', 'x_nuggets', 'x_frzburritos', 'x_frzmeals', 'x_protmeals', 'x_mozzsticks', 'x_fries', 'x_potstickers',
            'x_frzfruit', 'x_icecream', 'x_icecreambars', 'x_icepops', 'x_greekbars']],
        ['🧻 Household & paper', ['x_papertowels', 'x_toiletpaper', 'x_napkins', 'x_dishsoap', 'x_dishpods', 'x_detergent', 'x_handsoap', 'x_sponges',
            'x_trashbags', 'x_foil', 'x_plasticwrap', 'x_zipbags']]
    ];
})();
