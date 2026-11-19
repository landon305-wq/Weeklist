// ==========================================
// WeekCart — grocery catalog
// Prices are ESTIMATES of typical store-brand prices (late 2026), used when live prices aren't available.
//   p  = how many recipe-units come in one package     u  = recipe unit (count items use a noun, with pl = plural)
//   a  = typical ALDI price per package                k  = typical Kroger price per package
//   pk = package description shown on the list         t  = search term for live Kroger prices
//   oz = ounces per recipe unit (for converting live package sizes)   ct = counted item
//   must / not = words a live product name must / must not contain     staple = most kitchens already have it
//   alg = allergens / diet flags
// ==========================================
window.WC_SECTIONS = {
    produce:    { name: 'Produce',              icon: '🥬' },
    bakery:     { name: 'Bread & bakery',       icon: '🍞' },
    deli:       { name: 'Deli',                 icon: '🥪' },
    meat:       { name: 'Meat & seafood',       icon: '🥩' },
    dairy:      { name: 'Dairy & eggs',         icon: '🥛' },
    breakfast:  { name: 'Breakfast & cereal',   icon: '🥣' },
    pasta:      { name: 'Pasta, rice & grains', icon: '🍝' },
    canned:     { name: 'Canned goods & soup',  icon: '🥫' },
    intl:       { name: 'International',        icon: '🌮' },
    condiments: { name: 'Sauces & condiments',  icon: '🧂' },
    baking:     { name: 'Baking & spices',      icon: '🧁' },
    frozen:     { name: 'Frozen',               icon: '🧊' }
};

// Typical walking orders. Real stores vary; in live Kroger mode the list uses the real aisle numbers instead.
window.WC_LAYOUTS = {
    aldi: {
        name: 'ALDI-style', note: 'Small no-frills stores (ALDI, Lidl, Save A Lot) are laid out almost the same everywhere: produce and bread first, then the dry-goods aisles, then the refrigerated wall (meat, deli, dairy) along the back, and frozen near the registers.',
        order: ['produce', 'bakery', 'breakfast', 'pasta', 'canned', 'intl', 'condiments', 'baking', 'meat', 'deli', 'dairy', 'frozen']
    },
    standard: {
        name: 'Supermarket', note: 'Typical supermarket flow: produce at the entrance, bakery and deli next, meat along the back wall, the center aisles, then frozen and dairy last so cold things stay cold.',
        order: ['produce', 'bakery', 'deli', 'meat', 'pasta', 'intl', 'canned', 'condiments', 'baking', 'breakfast', 'frozen', 'dairy']
    },
    walmart: {
        name: 'Supercenter', note: 'Supercenters (Walmart, Target, Meijer) usually put produce at the grocery entrance, bakery and deli beside it, dry-goods aisles in the middle, and meat, dairy and frozen along the back wall.',
        order: ['produce', 'bakery', 'deli', 'pasta', 'canned', 'intl', 'condiments', 'baking', 'breakfast', 'meat', 'dairy', 'frozen']
    }
};

window.WC_ITEMS = [
    // ---------- produce ----------
    { id: 'onion', n: 'Yellow onions', s: 'produce', p: 6, u: 'onion', pl: 'onions', a: 2.49, k: 3.49, pk: '3 lb bag', t: 'yellow onions 3 lb', oz: 8, must: 'onion', not: 'powder|ring|green|red|soup|dip' },
    { id: 'redonion', n: 'Red onion', s: 'produce', p: 1, u: 'red onion', pl: 'red onions', a: 0.89, k: 1.19, pk: 'each', t: 'red onion', ct: 1, must: 'red onion' },
    { id: 'garlic', n: 'Garlic', s: 'produce', p: 30, u: 'clove', pl: 'cloves', a: 1.49, k: 1.99, pk: '3 bulbs', t: 'garlic bulbs', ct: 10, must: 'garlic', not: 'powder|salt|bread|minced|sauce|knot' },
    { id: 'bellpep', n: 'Bell peppers', s: 'produce', p: 3, u: 'bell pepper', pl: 'bell peppers', a: 2.99, k: 3.99, pk: '3-pack', t: 'bell peppers 3 pack', ct: 1, must: 'pepper', not: 'flake|ground|seasoning|stuffed' },
    { id: 'carrot', n: 'Carrots', s: 'produce', p: 8, u: 'carrot', pl: 'carrots', a: 1.29, k: 1.69, pk: '2 lb bag', t: 'carrots 2 lb', oz: 4, must: 'carrot', not: 'cake|baby|juice|chip' },
    { id: 'babycarrot', n: 'Baby carrots', s: 'produce', p: 16, u: 'oz', a: 1.19, k: 1.49, pk: '1 lb bag', t: 'baby carrots 1 lb', oz: 1, must: 'baby carrot' },
    { id: 'celery', n: 'Celery', s: 'produce', p: 8, u: 'stalk', pl: 'stalks', a: 1.49, k: 1.99, pk: 'bunch', t: 'celery', ct: 8, must: 'celery', not: 'salt|seed|soup' },
    { id: 'potato', n: 'Russet potatoes', s: 'produce', p: 5, u: 'lb', a: 3.49, k: 4.49, pk: '5 lb bag', t: 'russet potatoes 5 lb', oz: 16, must: 'potato', not: 'sweet|chip|mash|tot|fry|fries|salad' },
    { id: 'sweetpot', n: 'Sweet potatoes', s: 'produce', p: 3, u: 'lb', a: 2.99, k: 3.99, pk: '3 lb bag', t: 'sweet potatoes', oz: 16, must: 'sweet potato', not: 'fries|chip|tot' },
    { id: 'broccoli', n: 'Broccoli crowns', s: 'produce', p: 1, u: 'lb', a: 1.79, k: 2.29, pk: 'about 1 lb', t: 'broccoli crowns', oz: 16, must: 'broccoli', not: 'frozen|slaw|rice|cheese' },
    { id: 'romaine', n: 'Romaine hearts', s: 'produce', p: 3, u: 'head', pl: 'heads', a: 2.49, k: 3.49, pk: '3-pack', t: 'romaine hearts', ct: 1, must: 'romaine' },
    { id: 'tomato', n: 'Roma tomatoes', s: 'produce', p: 4, u: 'tomato', pl: 'tomatoes', a: 1.29, k: 1.49, pk: 'about 1 lb', t: 'roma tomatoes', oz: 4, must: 'tomato', not: 'sauce|paste|can|diced|crushed|sun|soup|cherry|grape' },
    { id: 'cilantro', n: 'Cilantro', s: 'produce', p: 1, u: 'bunch', pl: 'bunches', a: 0.79, k: 0.99, pk: 'bunch', t: 'cilantro bunch', ct: 1, must: 'cilantro', not: 'paste|lime rice|dressing' },
    { id: 'lime', n: 'Limes', s: 'produce', p: 8, u: 'lime', pl: 'limes', a: 2.49, k: 2.99, pk: '2 lb bag', t: 'limes bag', oz: 4, must: 'lime', not: 'juice|chip|soda|water' },
    { id: 'lemon', n: 'Lemons', s: 'produce', p: 6, u: 'lemon', pl: 'lemons', a: 2.99, k: 3.99, pk: '2 lb bag', t: 'lemons bag', oz: 5, must: 'lemon', not: 'juice|pepper|soda|water|cake|tea' },
    { id: 'banana', n: 'Bananas', s: 'produce', p: 6, u: 'banana', pl: 'bananas', a: 1.39, k: 1.79, pk: 'bunch (~2.5 lb)', t: 'bananas', oz: 6.5, must: 'banana', not: 'bread|chip|pepper|muffin|dried' },
    { id: 'apple', n: 'Apples', s: 'produce', p: 8, u: 'apple', pl: 'apples', a: 3.49, k: 4.49, pk: '3 lb bag', t: 'gala apples 3 lb', oz: 6, must: 'apple', not: 'juice|sauce|chip|pie|cider|vinegar|dried' },
    { id: 'berries', n: 'Strawberries', s: 'produce', p: 1, u: 'lb', a: 2.49, k: 3.49, pk: '1 lb', t: 'strawberries 1 lb', oz: 16, must: 'strawberr', not: 'jam|preserve|frozen|yogurt|dried' },
    { id: 'spinach', n: 'Baby spinach', s: 'produce', p: 6, u: 'cup', pl: 'cups', a: 1.99, k: 2.99, pk: '6 oz bag', t: 'baby spinach', oz: 1, must: 'spinach', not: 'dip|frozen|wrap' },
    { id: 'zucchini', n: 'Zucchini', s: 'produce', p: 1, u: 'zucchini', pl: 'zucchini', a: 0.89, k: 1.19, pk: 'each', t: 'zucchini', ct: 1, must: 'zucchini', not: 'noodle|spiral|bread' },
    { id: 'mushroom', n: 'White mushrooms', s: 'produce', p: 8, u: 'oz', a: 1.79, k: 2.49, pk: '8 oz', t: 'sliced white mushrooms 8 oz', oz: 1, must: 'mushroom', not: 'soup|can|jar|portobello' },
    { id: 'greenonion', n: 'Green onions', s: 'produce', p: 1, u: 'bunch', pl: 'bunches', a: 0.69, k: 0.99, pk: 'bunch', t: 'green onions', ct: 1, must: 'green onion|scallion' },
    { id: 'cucumber', n: 'Cucumber', s: 'produce', p: 1, u: 'cucumber', pl: 'cucumbers', a: 0.59, k: 0.79, pk: 'each', t: 'cucumber', ct: 1, must: 'cucumber', not: 'pickle|english|mini' },
    { id: 'avocado', n: 'Avocados', s: 'produce', p: 4, u: 'avocado', pl: 'avocados', a: 2.99, k: 3.99, pk: '4-pack bag', t: 'avocados bag', ct: 1, must: 'avocado', not: 'oil|dip|guac|ranch' },
    { id: 'jalapeno', n: 'Jalapeños', s: 'produce', p: 3, u: 'jalapeño', pl: 'jalapeños', a: 0.39, k: 0.59, pk: 'a few loose', t: 'jalapeno peppers', oz: 0.75, must: 'jalape', not: 'jar|sliced|pickled|chip|popper|can' },
    { id: 'slaw', n: 'Coleslaw mix', s: 'produce', p: 4, u: 'cup', pl: 'cups', a: 1.49, k: 1.99, pk: '14 oz bag', t: 'coleslaw mix', oz: 3.5, must: 'slaw', not: 'dressing|broccoli' },
    // ---------- bakery ----------
    { id: 'bread', n: 'Sandwich bread', s: 'bakery', p: 20, u: 'slice', pl: 'slices', a: 1.39, k: 1.79, pk: '20 oz loaf', t: 'white sandwich bread', ct: 20, must: 'bread', not: 'crumb|stick|garlic|mix|flour|pudding|banana', alg: ['gluten'] },
    { id: 'buns', n: 'Hamburger buns', s: 'bakery', p: 8, u: 'bun', pl: 'buns', a: 1.09, k: 1.49, pk: '8-pack', t: 'hamburger buns 8 ct', ct: 1, must: 'bun', not: 'hot dog|honey bun|cinnamon', alg: ['gluten'] },
    { id: 'hoagie', n: 'Hoagie rolls', s: 'bakery', p: 6, u: 'roll', pl: 'rolls', a: 2.29, k: 2.99, pk: '6-pack', t: 'hoagie rolls', ct: 1, must: 'hoagie|sub roll', alg: ['gluten'] },
    { id: 'tortilla', n: 'Flour tortillas (8 in)', s: 'bakery', p: 10, u: 'tortilla', pl: 'tortillas', a: 1.89, k: 2.49, pk: '10-pack', t: 'flour tortillas 8 inch 10 count', ct: 1, must: 'flour tortilla', not: 'chip|bowl|street|burrito size', alg: ['gluten'] },
    { id: 'corntort', n: 'Corn tortillas', s: 'bakery', p: 30, u: 'corn tortilla', pl: 'corn tortillas', a: 1.99, k: 2.49, pk: '30-pack', t: 'corn tortillas 30 count', ct: 1, must: 'corn tortilla', not: 'chip' },
    // ---------- deli ----------
    { id: 'rotis', n: 'Rotisserie chicken', s: 'deli', p: 1, u: 'rotisserie chicken', pl: 'rotisserie chickens', a: 4.99, k: 6.99, pk: 'whole, cooked', t: 'rotisserie chicken', ct: 1, must: 'rotisserie', not: 'seasoning|salad|soup' },
    { id: 'delitur', n: 'Sliced deli turkey', s: 'deli', p: 9, u: 'oz', a: 2.99, k: 3.99, pk: '9 oz pack', t: 'oven roasted turkey breast lunch meat', oz: 1, must: 'turkey', not: 'ground|bacon|sausage|stick|burger|frozen|whole' },
    { id: 'hummus', n: 'Hummus', s: 'deli', p: 10, u: 'oz', a: 2.49, k: 3.29, pk: '10 oz tub', t: 'classic hummus 10 oz', oz: 1, must: 'hummus', not: 'chip|cracker' },
    // ---------- meat & seafood ----------
    { id: 'chkbreast', n: 'Boneless chicken breasts', s: 'meat', p: 3, u: 'lb', a: 8.97, k: 10.47, pk: '~3 lb family pack', t: 'boneless skinless chicken breasts', oz: 16, must: 'chicken breast', not: 'breaded|nugget|tender|strip|canned|cooked|grilled|fried|frozen|deli|lunch' },
    { id: 'chkthigh', n: 'Boneless chicken thighs', s: 'meat', p: 2.5, u: 'lb', a: 7.49, k: 8.99, pk: '~2.5 lb pack', t: 'boneless skinless chicken thighs', oz: 16, must: 'thigh', not: 'frozen|cooked|breaded' },
    { id: 'gbeef', n: 'Ground beef 80/20', s: 'meat', p: 1, u: 'lb', a: 5.79, k: 6.49, pk: '1 lb', t: '80/20 ground beef 1 lb', oz: 16, must: 'ground beef|ground chuck', not: 'frozen|patties|patty|lean 9|96|93', alg: ['beef'] },
    { id: 'gturkey', n: 'Ground turkey', s: 'meat', p: 1, u: 'lb', a: 3.49, k: 4.29, pk: '1 lb', t: 'ground turkey 1 lb', oz: 16, must: 'ground turkey', not: 'frozen|patties|burger|sausage' },
    { id: 'stewbeef', n: 'Beef stew meat', s: 'meat', p: 1, u: 'lb', a: 6.99, k: 7.99, pk: '1 lb', t: 'beef stew meat', oz: 16, must: 'stew', not: 'canned|can|soup|seasoning|frozen', alg: ['beef'] },
    { id: 'porkchop', n: 'Boneless pork chops', s: 'meat', p: 2, u: 'lb', a: 6.59, k: 7.99, pk: '~2 lb pack', t: 'boneless pork chops', oz: 16, must: 'pork chop|pork loin chop', not: 'breaded|frozen|seasoning', alg: ['pork'] },
    { id: 'porkshould', n: 'Pork shoulder (Boston butt)', s: 'meat', p: 3, u: 'lb', a: 7.47, k: 8.97, pk: '~3 lb roast', t: 'pork shoulder boston butt', oz: 16, must: 'pork', not: 'pulled|cooked|bbq|chop|ground|sausage|bacon', alg: ['pork'] },
    { id: 'itsausage', n: 'Italian sausage links', s: 'meat', p: 1, u: 'lb', a: 3.99, k: 4.99, pk: '1 lb (5 links)', t: 'mild italian sausage links', oz: 16, must: 'italian sausage', not: 'turkey|chicken|pizza|frozen|cooked', alg: ['pork'] },
    { id: 'smsausage', n: 'Smoked sausage', s: 'meat', p: 13, u: 'oz', a: 3.29, k: 3.99, pk: '13–14 oz rope', t: 'smoked sausage rope 14 oz', oz: 1, must: 'smoked sausage', not: 'turkey|cheese|link|stick|bite', alg: ['pork'] },
    { id: 'bacon', n: 'Bacon', s: 'meat', p: 12, u: 'slice', pl: 'slices', a: 4.99, k: 5.99, pk: '12 oz pack', t: 'hickory smoked bacon 12 oz', ct: 12, must: 'bacon', not: 'bits|turkey|cooked|precooked|bacon ranch|pieces|canadian', alg: ['pork'] },
    // ---------- dairy & eggs ----------
    { id: 'eggs', n: 'Large eggs', s: 'dairy', p: 12, u: 'egg', pl: 'eggs', a: 2.79, k: 3.29, pk: 'dozen', t: 'large white eggs 12 count', ct: 1, must: 'egg', not: 'nog|noodle|substitute|beaters|liquid|white|hard|bites|roll', alg: ['egg'] },
    { id: 'milk', n: 'Milk (2%)', s: 'dairy', p: 16, u: 'cup', pl: 'cups', a: 2.89, k: 3.29, pk: '1 gallon', t: '2% reduced fat milk gallon', oz: 8, must: 'milk', not: 'chocolate|almond|oat|soy|coconut|lactose|half|evaporated|condensed|powder', alg: ['dairy'] },
    { id: 'butter', n: 'Butter', s: 'dairy', p: 32, u: 'tbsp', a: 3.79, k: 4.49, pk: '1 lb (4 sticks)', t: 'salted butter 4 sticks', oz: 0.5, must: 'butter', not: 'peanut|almond|apple|cookie|popcorn|spread|garlic|milk|cracker', alg: ['dairy'] },
    { id: 'cheddar', n: 'Shredded cheddar', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 2.19, k: 2.49, pk: '8 oz bag', t: 'shredded sharp cheddar cheese 8 oz', oz: 4, must: 'cheddar', not: 'sauce|cracker|chip|slice|block|soup|mac', alg: ['dairy'] },
    { id: 'mozz', n: 'Shredded mozzarella', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 2.19, k: 2.49, pk: '8 oz bag', t: 'shredded mozzarella cheese 8 oz', oz: 4, must: 'mozzarella', not: 'stick|string|ball|fresh|pearl|slice', alg: ['dairy'] },
    { id: 'mexcheese', n: 'Shredded Mexican blend', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 2.19, k: 2.49, pk: '8 oz bag', t: 'shredded mexican style four cheese blend 8 oz', oz: 4, must: 'mexican', not: 'dip|sauce|rice|seasoning', alg: ['dairy'] },
    { id: 'parm', n: 'Grated parmesan', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 2.99, k: 3.79, pk: '8 oz shaker', t: 'grated parmesan cheese 8 oz', oz: 4, must: 'parmesan', not: 'crisps|cracker|dressing|sauce|chicken', alg: ['dairy'] },
    { id: 'sourcream', n: 'Sour cream', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 1.69, k: 1.99, pk: '16 oz tub', t: 'sour cream 16 oz', oz: 8, must: 'sour cream', not: 'onion|dip|chip', alg: ['dairy'] },
    { id: 'creamch', n: 'Cream cheese', s: 'dairy', p: 8, u: 'oz', a: 1.59, k: 1.99, pk: '8 oz brick', t: 'cream cheese 8 oz brick', oz: 1, must: 'cream cheese', not: 'spread|whipped|frosting|bagel|strawberry|chive', alg: ['dairy'] },
    { id: 'yogurt', n: 'Plain Greek yogurt', s: 'dairy', p: 4, u: 'cup', pl: 'cups', a: 3.49, k: 4.29, pk: '32 oz tub', t: 'plain nonfat greek yogurt 32 oz', oz: 8, must: 'greek', not: 'vanilla|strawberry|honey|blueberry|bar|dip|dressing|frozen', alg: ['dairy'] },
    { id: 'cream', n: 'Heavy cream', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 3.29, k: 3.99, pk: '1 pint', t: 'heavy whipping cream 16 oz', oz: 8, must: 'cream', not: 'sour|cheese|ice|coffee|creamer|whipped|half', alg: ['dairy'] },
    { id: 'slcheese', n: 'Sliced cheddar', s: 'dairy', p: 10, u: 'slice', pl: 'slices', a: 2.29, k: 2.79, pk: '8 oz (10 slices)', t: 'sliced sharp cheddar cheese', ct: 10, must: 'slice', not: 'shred|block|cracker', alg: ['dairy'] },
    { id: 'ricotta', n: 'Ricotta', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 2.49, k: 2.99, pk: '15 oz tub', t: 'whole milk ricotta cheese 15 oz', oz: 7.5, must: 'ricotta', alg: ['dairy'] },
    // ---------- breakfast ----------
    { id: 'oats', n: 'Old-fashioned oats', s: 'breakfast', p: 15, u: 'cup', pl: 'cups', a: 3.29, k: 3.99, pk: '42 oz canister', t: 'old fashioned oats 42 oz', oz: 2.8, must: 'oat', not: 'bar|milk|cookie|instant|cereal|flour|granola' },
    { id: 'pancake', n: 'Pancake mix (complete)', s: 'breakfast', p: 7, u: 'cup', pl: 'cups', a: 1.99, k: 2.49, pk: '32 oz box', t: 'complete buttermilk pancake mix', oz: 4.5, must: 'pancake', not: 'syrup|frozen|bites|mini', alg: ['gluten', 'dairy', 'egg'] },
    { id: 'syrup', n: 'Pancake syrup', s: 'breakfast', p: 3, u: 'cup', pl: 'cups', a: 1.79, k: 2.29, pk: '24 oz bottle', t: 'original pancake syrup 24 oz', oz: 8, must: 'syrup', not: 'chocolate|caramel|cough|corn|simple|strawberry' },
    { id: 'granola', n: 'Granola', s: 'breakfast', p: 4, u: 'cup', pl: 'cups', a: 2.49, k: 3.29, pk: '12 oz bag', t: 'granola cereal', oz: 3, must: 'granola', not: 'bar|bites', alg: ['gluten', 'nuts'] },
    { id: 'pb', n: 'Peanut butter', s: 'breakfast', p: 32, u: 'tbsp', a: 1.95, k: 2.49, pk: '16 oz jar', t: 'creamy peanut butter 16 oz', oz: 0.5, must: 'peanut butter', not: 'cup|cracker|cookie|cereal|bar|powder|pretzel|filled', alg: ['nuts'] },
    { id: 'jelly', n: 'Grape jelly', s: 'breakfast', p: 30, u: 'tbsp', a: 1.49, k: 1.99, pk: '18 oz jar', t: 'grape jelly 18 oz', oz: 0.6, must: 'jelly|jam|preserve', not: 'bean|candy' },
    { id: 'honey', n: 'Honey', s: 'breakfast', p: 16, u: 'tbsp', a: 3.29, k: 3.99, pk: '12 oz bottle', t: 'clover honey 12 oz', oz: 0.75, must: 'honey', not: 'mustard|oat|nut|graham|bbq|ham|roasted|cereal' },
    // ---------- pasta, rice ----------
    { id: 'spaghetti', n: 'Spaghetti', s: 'pasta', p: 1, u: 'lb', a: 1.15, k: 1.29, pk: '1 lb box', t: 'spaghetti pasta 16 oz', oz: 16, must: 'spaghetti', not: 'spaghettio|sauce|squash|meatball', alg: ['gluten'] },
    { id: 'penne', n: 'Penne', s: 'pasta', p: 1, u: 'lb', a: 1.15, k: 1.29, pk: '1 lb box', t: 'penne rigate pasta 16 oz', oz: 16, must: 'penne', alg: ['gluten'] },
    { id: 'elbow', n: 'Elbow macaroni', s: 'pasta', p: 1, u: 'lb', a: 1.15, k: 1.29, pk: '1 lb box', t: 'elbow macaroni 16 oz', oz: 16, must: 'elbow', not: 'cheese|dinner', alg: ['gluten'] },
    { id: 'eggnoodle', n: 'Egg noodles', s: 'pasta', p: 0.75, u: 'lb', a: 1.79, k: 1.99, pk: '12 oz bag', t: 'wide egg noodles 12 oz', oz: 16, must: 'egg noodle', alg: ['gluten', 'egg'] },
    { id: 'lasagna', n: 'Lasagna noodles', s: 'pasta', p: 1, u: 'lb', a: 1.49, k: 1.79, pk: '1 lb box', t: 'lasagna noodles 16 oz', oz: 16, must: 'lasagna', not: 'frozen|sauce|bake', alg: ['gluten'] },
    { id: 'rice', n: 'Long grain white rice', s: 'pasta', p: 4.5, u: 'cup', pl: 'cups', a: 1.79, k: 2.29, pk: '2 lb bag', t: 'long grain white rice 2 lb', oz: 7, must: 'rice', not: 'brown|cake|krispie|vinegar|mix|seasoned|cauliflower|minute|instant|wild|jasmine|basmati|spanish|cereal|pudding|noodle' },
    { id: 'ramen', n: 'Ramen noodles (3 oz packs)', s: 'pasta', p: 6, u: 'pack', pl: 'packs', a: 1.49, k: 1.99, pk: '6-pack', t: 'ramen noodle soup 6 pack', ct: 1, must: 'ramen', alg: ['gluten'] },
    // ---------- canned ----------
    { id: 'blackbean', n: 'Black beans', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.75, k: 0.99, pk: '15 oz can', t: 'black beans 15 oz can', oz: 15, must: 'black bean', not: 'soup|chip|dip|refried|seasoned|corn' },
    { id: 'kidbean', n: 'Kidney beans', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.75, k: 0.99, pk: '15 oz can', t: 'dark red kidney beans 15 oz', oz: 15, must: 'kidney' },
    { id: 'chickpea', n: 'Chickpeas', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.79, k: 0.99, pk: '15 oz can', t: 'chickpeas garbanzo beans 15 oz', oz: 15, must: 'chickpea|garbanzo', not: 'hummus|snack|pasta|roasted' },
    { id: 'refried', n: 'Refried beans', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.99, k: 1.29, pk: '16 oz can', t: 'traditional refried beans 16 oz', oz: 16, must: 'refried' },
    { id: 'dicedtom', n: 'Diced tomatoes', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.75, k: 0.99, pk: '14.5 oz can', t: 'diced tomatoes 14.5 oz can', oz: 14.5, must: 'diced tomato', not: 'green chil|rotel|chili ready' },
    { id: 'crushtom', n: 'Crushed tomatoes', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 1.29, k: 1.69, pk: '28 oz can', t: 'crushed tomatoes 28 oz', oz: 28, must: 'crushed tomato' },
    { id: 'tompaste', n: 'Tomato paste', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.59, k: 0.79, pk: '6 oz can', t: 'tomato paste 6 oz', oz: 6, must: 'tomato paste' },
    { id: 'broth', n: 'Chicken broth', s: 'canned', p: 4, u: 'cup', pl: 'cups', a: 1.49, k: 1.99, pk: '32 oz carton', t: 'chicken broth 32 oz carton', oz: 8, must: 'chicken broth|chicken stock', not: 'bone|cube|base|bouillon|soup' },
    { id: 'tuna', n: 'Chunk light tuna', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.89, k: 1.09, pk: '5 oz can', t: 'chunk light tuna in water 5 oz', oz: 5, must: 'tuna', not: 'kit|salad|pouch|cat|albacore|steak', alg: ['fish'] },
    { id: 'corncan', n: 'Whole kernel corn', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.65, k: 0.89, pk: '15 oz can', t: 'whole kernel sweet corn 15 oz can', oz: 15, must: 'corn', not: 'cream|chip|meal|starch|flake|tortilla|dog|pop|bread|frozen|muffin|black bean' },
    { id: 'soupcream', n: 'Cream of chicken soup', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.85, k: 1.19, pk: '10.5 oz can', t: 'condensed cream of chicken soup', oz: 10.5, must: 'cream of chicken', alg: ['dairy', 'gluten'] },
    // ---------- international ----------
    { id: 'taco', n: 'Taco seasoning', s: 'intl', p: 1, u: 'packet', pl: 'packets', a: 0.55, k: 0.79, pk: '1 oz packet', t: 'taco seasoning mix 1 oz', oz: 1, must: 'taco seasoning', not: 'shell|kit|sauce|dinner' },
    { id: 'salsa', n: 'Salsa', s: 'intl', p: 2, u: 'cup', pl: 'cups', a: 1.99, k: 2.49, pk: '16 oz jar', t: 'medium chunky salsa 16 oz', oz: 8, must: 'salsa', not: 'verde|con queso|dip|chip|fresh' },
    { id: 'enchsauce', n: 'Red enchilada sauce', s: 'intl', p: 1, u: 'can', pl: 'cans', a: 1.29, k: 1.69, pk: '10 oz can', t: 'red enchilada sauce 10 oz', oz: 10, must: 'enchilada sauce', not: 'green|verde' },
    { id: 'greenchile', n: 'Diced green chiles', s: 'intl', p: 1, u: 'can', pl: 'cans', a: 0.89, k: 1.19, pk: '4 oz can', t: 'diced green chiles 4 oz', oz: 4, must: 'green chile', not: 'tomato|sauce|enchilada|salsa' },
    { id: 'soy', n: 'Soy sauce', s: 'intl', p: 30, u: 'tbsp', a: 1.49, k: 1.99, pk: '15 oz bottle', t: 'soy sauce 15 oz', oz: 0.5, must: 'soy sauce', not: 'lite|less sodium|packet', alg: ['gluten'] },
    { id: 'teriyaki', n: 'Teriyaki sauce', s: 'intl', p: 20, u: 'tbsp', a: 1.99, k: 2.79, pk: '10 oz bottle', t: 'teriyaki sauce', oz: 0.5, must: 'teriyaki', not: 'jerky|chicken|beef|marinated|frozen|bowl', alg: ['gluten'] },
    { id: 'coconut', n: 'Coconut milk', s: 'intl', p: 1, u: 'can', pl: 'cans', a: 1.29, k: 1.79, pk: '13.5 oz can', t: 'coconut milk 13.5 oz can', oz: 13.5, must: 'coconut milk', not: 'beverage|creamer|carton|yogurt|ice' },
    { id: 'curry', n: 'Curry powder', s: 'intl', p: 20, u: 'tsp', a: 1.29, k: 1.99, pk: 'spice jar', t: 'curry powder', oz: 0.1, must: 'curry powder' },
    // ---------- condiments ----------
    { id: 'marinara', n: 'Marinara / pasta sauce', s: 'condiments', p: 1, u: 'jar', pl: 'jars', a: 1.79, k: 2.29, pk: '24 oz jar', t: 'traditional pasta sauce 24 oz jar', oz: 24, must: 'sauce|marinara', not: 'alfredo|pizza|pesto|vodka|cheese|soy|hot|bbq|enchilada|steak|squeeze' },
    { id: 'bbq', n: 'BBQ sauce', s: 'condiments', p: 1.75, u: 'cup', pl: 'cups', a: 1.29, k: 1.99, pk: '18 oz bottle', t: 'original barbecue sauce 18 oz', oz: 10, must: 'barbecue|bbq', not: 'chip|chicken|pork|seasoning|rub|pulled' },
    { id: 'mayo', n: 'Mayonnaise', s: 'condiments', p: 60, u: 'tbsp', a: 2.99, k: 3.49, pk: '30 oz jar', t: 'real mayonnaise 30 oz', oz: 0.5, must: 'mayo', not: 'spicy|chipotle|garlic|sriracha|packet', alg: ['egg'] },
    { id: 'ranch', n: 'Ranch dressing', s: 'condiments', p: 16, u: 'tbsp', a: 1.79, k: 2.29, pk: '16 oz bottle', t: 'ranch dressing 16 oz', oz: 1, must: 'ranch', not: 'chip|seasoning|mix|dip|cracker|pretzel|bacon', alg: ['dairy', 'egg'] },
    { id: 'caesar', n: 'Caesar dressing', s: 'condiments', p: 16, u: 'tbsp', a: 1.79, k: 2.49, pk: '16 oz bottle', t: 'caesar dressing', oz: 1, must: 'caesar', not: 'kit|salad|crouton', alg: ['dairy', 'egg', 'fish'] },
    { id: 'pesto', n: 'Basil pesto', s: 'condiments', p: 0.75, u: 'cup', pl: 'cups', a: 2.49, k: 3.49, pk: '6 oz jar', t: 'basil pesto 6 oz jar', oz: 8, must: 'pesto', not: 'pasta|chicken|bread|pizza', alg: ['dairy', 'nuts'] },
    { id: 'italdress', n: 'Italian dressing', s: 'condiments', p: 16, u: 'tbsp', a: 1.49, k: 1.99, pk: '16 oz bottle', t: 'zesty italian dressing 16 oz', oz: 1, must: 'italian', not: 'seasoning|bread|sausage|mix|cheese' },
    { id: 'breadcrumb', n: 'Bread crumbs', s: 'condiments', p: 3.5, u: 'cup', pl: 'cups', a: 1.29, k: 1.69, pk: '15 oz canister', t: 'plain bread crumbs 15 oz', oz: 4.25, must: 'crumb', not: 'panko|seasoned|italian|graham|cookie|cracker', alg: ['gluten'] },
    // ---------- baking & spices (staples most kitchens already have) ----------
    { id: 'oil', n: 'Vegetable or olive oil', s: 'baking', p: 96, u: 'tbsp', a: 3.49, k: 4.29, pk: '48 oz bottle', t: 'vegetable oil 48 oz', oz: 0.5, must: 'oil', not: 'spray|coconut|sesame|truffle|motor', staple: 1 },
    { id: 'flour', n: 'All-purpose flour', s: 'baking', p: 18, u: 'cup', pl: 'cups', a: 2.19, k: 2.79, pk: '5 lb bag', t: 'all purpose flour 5 lb', oz: 4.4, must: 'flour', not: 'tortilla|almond|coconut|bread flour|self|cake|whole wheat', staple: 1, alg: ['gluten'] },
    { id: 'sugar', n: 'Sugar', s: 'baking', p: 10, u: 'cup', pl: 'cups', a: 2.99, k: 3.49, pk: '4 lb bag', t: 'granulated sugar 4 lb', oz: 7, must: 'sugar', not: 'brown|powder|free|cookie|cane syrup|candy', staple: 1 },
    { id: 'brownsugar', n: 'Brown sugar', s: 'baking', p: 4.5, u: 'cup', pl: 'cups', a: 1.89, k: 2.49, pk: '2 lb bag', t: 'light brown sugar 2 lb', oz: 7, must: 'brown sugar', not: 'oat|cinnamon|bacon|syrup|ham', staple: 1 },
    { id: 'salt', n: 'Salt', s: 'baking', p: 100, u: 'tsp', a: 0.59, k: 0.79, pk: '26 oz canister', t: 'iodized salt 26 oz', oz: 0.2, must: 'salt', not: 'garlic|seasoned|sea salt grinder|epsom|pepper|chip|caramel|butter|pretzel', staple: 1 },
    { id: 'pepper', n: 'Black pepper', s: 'baking', p: 40, u: 'tsp', a: 1.69, k: 2.29, pk: 'spice jar', t: 'ground black pepper', oz: 0.08, must: 'black pepper', not: 'grinder|corn|chip|lemon|garlic', staple: 1 },
    { id: 'garpow', n: 'Garlic powder', s: 'baking', p: 30, u: 'tsp', a: 1.19, k: 1.79, pk: 'spice jar', t: 'garlic powder', oz: 0.1, must: 'garlic powder', not: 'salt|onion', staple: 1 },
    { id: 'italseas', n: 'Italian seasoning', s: 'baking', p: 30, u: 'tsp', a: 1.19, k: 1.79, pk: 'spice jar', t: 'italian seasoning', oz: 0.05, must: 'italian seasoning', not: 'dressing|mix|bread', staple: 1 },
    { id: 'chilipow', n: 'Chili powder', s: 'baking', p: 30, u: 'tsp', a: 1.19, k: 1.79, pk: 'spice jar', t: 'chili powder', oz: 0.1, must: 'chili powder', staple: 1 },
    { id: 'cumin', n: 'Ground cumin', s: 'baking', p: 30, u: 'tsp', a: 1.49, k: 1.99, pk: 'spice jar', t: 'ground cumin', oz: 0.07, must: 'cumin', staple: 1 },
    { id: 'paprika', n: 'Paprika', s: 'baking', p: 30, u: 'tsp', a: 1.19, k: 1.79, pk: 'spice jar', t: 'paprika', oz: 0.08, must: 'paprika', not: 'chip', staple: 1 },
    { id: 'cinnamon', n: 'Ground cinnamon', s: 'baking', p: 30, u: 'tsp', a: 1.19, k: 1.79, pk: 'spice jar', t: 'ground cinnamon', oz: 0.08, must: 'cinnamon', not: 'roll|toast|cereal|sugar|bread|stick|apple', staple: 1 },
    { id: 'cornstarch', n: 'Cornstarch', s: 'baking', p: 50, u: 'tbsp', a: 1.29, k: 1.79, pk: '16 oz box', t: 'corn starch 16 oz', oz: 0.3, must: 'starch', staple: 1 },
    { id: 'ketchup', n: 'Ketchup', s: 'baking', p: 60, u: 'tbsp', a: 1.69, k: 2.29, pk: '32 oz bottle', t: 'tomato ketchup 32 oz', oz: 0.5, must: 'ketchup', not: 'chip|packet', staple: 1 },
    { id: 'mustard', n: 'Yellow mustard', s: 'baking', p: 40, u: 'tbsp', a: 0.89, k: 1.29, pk: '20 oz bottle', t: 'yellow mustard 20 oz', oz: 0.5, must: 'mustard', not: 'honey|dijon|seed|powder|green|pretzel|spicy', staple: 1 },
    { id: 'vinegar', n: 'White vinegar', s: 'baking', p: 64, u: 'tbsp', a: 1.19, k: 1.49, pk: '32 oz bottle', t: 'distilled white vinegar 32 oz', oz: 0.5, must: 'vinegar', not: 'cider|balsamic|rice|wine|chip|cleaning', staple: 1 },
    // ---------- frozen ----------
    { id: 'frzbroc', n: 'Frozen broccoli florets', s: 'frozen', p: 12, u: 'oz', a: 1.09, k: 1.49, pk: '12 oz bag', t: 'frozen broccoli florets 12 oz', oz: 1, must: 'broccoli', not: 'cheese|rice|fresh|crown|slaw' },
    { id: 'frzmixed', n: 'Frozen mixed vegetables', s: 'frozen', p: 16, u: 'oz', a: 0.99, k: 1.29, pk: '1 lb bag', t: 'frozen mixed vegetables 16 oz', oz: 1, must: 'mixed vegetable', not: 'can|stir' },
    { id: 'frzpeas', n: 'Frozen peas', s: 'frozen', p: 12, u: 'oz', a: 1.09, k: 1.29, pk: '12 oz bag', t: 'frozen sweet peas 12 oz', oz: 1, must: 'pea', not: 'can|snap|snow|chick|pod|peanut|carrot' },
    { id: 'frzcorn', n: 'Frozen corn', s: 'frozen', p: 12, u: 'oz', a: 0.99, k: 1.29, pk: '12 oz bag', t: 'frozen sweet corn 12 oz', oz: 1, must: 'corn', not: 'can|cob|dog|bread|chip|tortilla|pop|starch' },
    { id: 'frzstirfry', n: 'Frozen stir-fry vegetables', s: 'frozen', p: 16, u: 'oz', a: 1.69, k: 2.29, pk: '1 lb bag', t: 'frozen stir fry vegetables 16 oz', oz: 1, must: 'stir fry|stir-fry', not: 'sauce|chicken|beef|shrimp|meal|noodle|rice' },
    { id: 'frzgreenbean', n: 'Frozen green beans', s: 'frozen', p: 12, u: 'oz', a: 0.99, k: 1.29, pk: '12 oz bag', t: 'frozen cut green beans 12 oz', oz: 1, must: 'green bean', not: 'can|casserole|fresh' },
    { id: 'salmon', n: 'Frozen salmon fillets', s: 'frozen', p: 1, u: 'lb', a: 6.99, k: 8.99, pk: '1 lb bag (4 fillets)', t: 'frozen atlantic salmon fillets 16 oz', oz: 16, must: 'salmon', not: 'smoked|burger|can|pouch|cat|dog|sushi|jerky', alg: ['fish'] },
    { id: 'tilapia', n: 'Frozen tilapia fillets', s: 'frozen', p: 1, u: 'lb', a: 4.49, k: 5.49, pk: '1 lb bag', t: 'frozen tilapia fillets 16 oz', oz: 16, must: 'tilapia', not: 'breaded|battered|crusted', alg: ['fish'] },
    { id: 'shrimp', n: 'Frozen raw shrimp', s: 'frozen', p: 1, u: 'lb', a: 6.99, k: 8.99, pk: '1 lb bag', t: 'frozen raw shrimp peeled deveined 16 oz', oz: 16, must: 'shrimp', not: 'breaded|popcorn|cooked|ring|cocktail|tempura|scampi|bowl|fried', alg: ['shellfish'] },
    { id: 'meatballs', n: 'Frozen Italian meatballs', s: 'frozen', p: 28, u: 'meatball', pl: 'meatballs', a: 5.49, k: 6.99, pk: '28 oz bag', t: 'frozen italian style meatballs 28 oz', ct: 1, must: 'meatball', not: 'turkey|chicken|vegetarian|meatless|sub|sauce', alg: ['gluten', 'dairy', 'beef', 'pork', 'egg'] },
    { id: 'hashbrown', n: 'Frozen shredded hash browns', s: 'frozen', p: 30, u: 'oz', a: 2.29, k: 2.99, pk: '30 oz bag', t: 'frozen shredded hash browns 30 oz', oz: 1, must: 'hash brown', not: 'patties|patty|casserole|bowl|cheesy' },
    // ---------- added with the bigger recipe collection ----------
    { id: 'cabbage', n: 'Green cabbage', s: 'produce', p: 1, u: 'head', pl: 'heads', a: 1.49, k: 1.99, pk: 'about 2 lb head', t: 'green cabbage', ct: 1, must: 'cabbage', not: 'slaw|red|napa|kimchi|sauerkraut' },
    { id: 'tofu', n: 'Firm tofu', s: 'produce', p: 1, u: 'block', pl: 'blocks', a: 1.79, k: 2.29, pk: '14 oz block', t: 'extra firm tofu 14 oz', oz: 14, must: 'tofu' },
    { id: 'naan', n: 'Naan flatbread', s: 'bakery', p: 2, u: 'naan', pl: 'naan', a: 2.99, k: 3.49, pk: '2-pack', t: 'naan flatbread 2 count', ct: 1, must: 'naan', not: 'chip|dipper|mini', alg: ['gluten', 'dairy'] },
    { id: 'engmuffin', n: 'English muffins', s: 'bakery', p: 6, u: 'English muffin', pl: 'English muffins', a: 1.49, k: 1.99, pk: '6-pack', t: 'english muffins 6 count', ct: 1, must: 'english muffin', not: 'sandwich|pizza|frozen', alg: ['gluten'] },
    { id: 'bagel', n: 'Bagels', s: 'bakery', p: 6, u: 'bagel', pl: 'bagels', a: 1.99, k: 2.49, pk: '6-pack', t: 'plain bagels 6 count', ct: 1, must: 'bagel', not: 'chip|bite|seasoning|cream cheese|thin|mini', alg: ['gluten'] },
    { id: 'deliham', n: 'Sliced deli ham', s: 'deli', p: 9, u: 'oz', a: 2.99, k: 3.99, pk: '9 oz pack', t: 'smoked ham lunch meat', oz: 1, must: 'ham', not: 'steak|spiral|hock|shank|whole|turkey|hamburger|graham|shame', alg: ['pork'] },
    { id: 'pepperoni', n: 'Sliced pepperoni', s: 'deli', p: 6, u: 'oz', a: 2.29, k: 2.99, pk: '6 oz bag', t: 'sliced pepperoni 6 oz', oz: 1, must: 'pepperoni', not: 'pizza|roll|stick|turkey', alg: ['pork', 'beef'] },
    { id: 'drumstick', n: 'Chicken drumsticks', s: 'meat', p: 3, u: 'lb', a: 4.47, k: 5.97, pk: '~3 lb value pack', t: 'chicken drumsticks', oz: 16, must: 'drumstick', not: 'frozen|cooked|breaded|turkey' },
    { id: 'brksausage', n: 'Ground breakfast sausage', s: 'meat', p: 1, u: 'lb', a: 2.99, k: 3.99, pk: '1 lb roll', t: 'pork breakfast sausage roll 16 oz', oz: 16, must: 'sausage', not: 'link|patt|turkey|chicken|cooked|smoked|italian|biscuit|gravy', alg: ['pork'] },
    { id: 'hotdog', n: 'Hot dogs', s: 'meat', p: 8, u: 'hot dog', pl: 'hot dogs', a: 1.99, k: 2.99, pk: '8-pack', t: 'beef franks 8 count', ct: 1, must: 'frank|hot dog|wiener', not: 'bun|chili|corn dog|turkey|chicken', alg: ['beef'] },
    { id: 'cottage', n: 'Cottage cheese', s: 'dairy', p: 2, u: 'cup', pl: 'cups', a: 2.29, k: 2.79, pk: '16 oz tub', t: 'small curd cottage cheese 16 oz', oz: 8, must: 'cottage', not: 'pineapple|fruit|cup', alg: ['dairy'] },
    { id: 'feta', n: 'Crumbled feta', s: 'dairy', p: 1, u: 'cup', pl: 'cups', a: 2.49, k: 2.99, pk: '4 oz tub', t: 'crumbled feta cheese 4 oz', oz: 4, must: 'feta', not: 'dressing|dip|spinach|fat free', alg: ['dairy'] },
    { id: 'lentils', n: 'Dry lentils', s: 'pasta', p: 2.25, u: 'cup', pl: 'cups', a: 1.29, k: 1.69, pk: '1 lb bag', t: 'dry lentils 16 oz bag', oz: 7, must: 'lentil', not: 'soup|chip|pasta|can' },
    { id: 'cornbread', n: 'Corn muffin mix', s: 'baking', p: 1, u: 'box', pl: 'boxes', a: 0.59, k: 0.79, pk: '8.5 oz box', t: 'corn muffin mix 8.5 oz', oz: 8.5, must: 'corn', not: 'meal|starch|syrup|chip|tortilla|can|kernel', alg: ['gluten', 'dairy'] },
    { id: 'pinto', n: 'Pinto beans', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.75, k: 0.99, pk: '15 oz can', t: 'pinto beans 15 oz can', oz: 15, must: 'pinto', not: 'refried' },
    { id: 'whitebean', n: 'Great northern beans', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.79, k: 0.99, pk: '15 oz can', t: 'great northern beans 15 oz', oz: 15, must: 'northern|cannellini|white bean', not: 'soup|chili' },
    { id: 'tomsauce', n: 'Tomato sauce', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 0.59, k: 0.79, pk: '15 oz can', t: 'tomato sauce 15 oz can', oz: 15, must: 'tomato sauce', not: 'pasta|pizza|basil|garlic' },
    { id: 'cannedchk', n: 'Canned chicken breast', s: 'canned', p: 1, u: 'can', pl: 'cans', a: 2.79, k: 3.49, pk: '12.5 oz can', t: 'chunk chicken breast 12.5 oz can', oz: 12.5, must: 'chicken', not: 'soup|broth|noodle|salad kit|dog|cat|stock' },
    { id: 'vegbroth', n: 'Vegetable broth', s: 'canned', p: 4, u: 'cup', pl: 'cups', a: 1.49, k: 1.99, pk: '32 oz carton', t: 'vegetable broth 32 oz carton', oz: 8, must: 'vegetable broth|vegetable stock', not: 'cube|base|bouillon|soup' },
    { id: 'gravy', n: 'Brown gravy mix', s: 'condiments', p: 1, u: 'packet', pl: 'packets', a: 0.79, k: 1.09, pk: '0.87 oz packet', t: 'brown gravy mix packet', oz: 0.87, must: 'gravy', not: 'jar|turkey|chicken|sausage|country|biscuit', alg: ['gluten'] },
    { id: 'sriracha', n: 'Sriracha hot sauce', s: 'intl', p: 34, u: 'tbsp', a: 2.49, k: 3.29, pk: '17 oz bottle', t: 'sriracha hot chili sauce', oz: 0.5, must: 'sriracha', not: 'mayo|chip|seasoning|ketchup' },
    { id: 'chips', n: 'Tortilla chips', s: 'intl', p: 13, u: 'oz', a: 2.19, k: 2.99, pk: '13 oz bag', t: 'restaurant style tortilla chips 13 oz', oz: 1, must: 'tortilla chip', not: 'scoop|lime|nacho cheese|dip|strip' },
    { id: 'frzwaffle', n: 'Frozen waffles', s: 'frozen', p: 10, u: 'waffle', pl: 'waffles', a: 1.69, k: 2.49, pk: '10-pack', t: 'frozen homestyle waffles 10 count', ct: 1, must: 'waffle', not: 'fries|cone|syrup|chicken|mix', alg: ['gluten', 'egg', 'dairy'] },
    { id: 'pierogi', n: 'Frozen potato pierogies', s: 'frozen', p: 12, u: 'pierogi', pl: 'pierogies', a: 2.29, k: 2.99, pk: '16 oz box (12)', t: 'frozen potato cheddar pierogies 16 oz', ct: 1, must: 'pierog', alg: ['gluten', 'dairy', 'egg'] },
    { id: 'frzspinach', n: 'Frozen chopped spinach', s: 'frozen', p: 10, u: 'oz', a: 0.99, k: 1.29, pk: '10 oz box', t: 'frozen chopped spinach 10 oz', oz: 1, must: 'spinach', not: 'dip|artichoke|souffle|creamed|fresh' }
];

// ---------- nutrition: [calories, grams of protein] per recipe unit (approximate, USDA-style averages) ----------
window.WC_NUTR = {
    onion: [44, 1.2], redonion: [44, 1.2], garlic: [4, 0.2], bellpep: [30, 1], carrot: [25, 0.6], babycarrot: [10, 0.2], celery: [6, 0.3],
    potato: [350, 9.3], sweetpot: [390, 7.3], broccoli: [154, 12.8], romaine: [29, 2], tomato: [11, 0.5], cilantro: [10, 0.9], lime: [20, 0.5],
    lemon: [17, 0.6], banana: [105, 1.3], apple: [95, 0.5], berries: [145, 3], spinach: [7, 0.9], zucchini: [33, 2.4], mushroom: [6, 0.9],
    greenonion: [32, 1.8], cucumber: [45, 2], avocado: [240, 3], jalapeno: [4, 0.1], slaw: [17, 0.9],
    bread: [70, 2.5], buns: [120, 4], hoagie: [210, 7], tortilla: [140, 4], corntort: [52, 1.4],
    rotis: [1400, 190], delitur: [30, 5], hummus: [70, 2],
    chkbreast: [545, 102], chkthigh: [640, 88], gbeef: [1000, 77], gturkey: [680, 85], stewbeef: [700, 92], porkchop: [650, 95],
    porkshould: [1050, 77], itsausage: [1300, 60], smsausage: [90, 3.5], bacon: [45, 3],
    eggs: [72, 6.3], milk: [122, 8], butter: [102, 0.1], cheddar: [455, 26], mozz: [340, 24], mexcheese: [440, 26], parm: [420, 28],
    sourcream: [445, 5], creamch: [99, 1.7], yogurt: [130, 23], cream: [820, 7], slcheese: [90, 5.5], ricotta: [430, 28],
    oats: [300, 10.5], pancake: [450, 10], syrup: [840, 0], granola: [480, 12], pb: [95, 3.5], jelly: [50, 0], honey: [64, 0.1],
    spaghetti: [1600, 56], penne: [1600, 56], elbow: [1600, 56], eggnoodle: [1730, 64], lasagna: [1600, 56], rice: [675, 13], ramen: [380, 9],
    blackbean: [385, 25], kidbean: [350, 23], chickpea: [420, 21], refried: [400, 22], dicedtom: [70, 3], crushtom: [230, 11], tompaste: [140, 7],
    broth: [10, 1.5], tuna: [100, 22], corncan: [230, 7], soupcream: [300, 6],
    taco: [90, 2], salsa: [70, 3], enchsauce: [80, 2], greenchile: [20, 1], soy: [9, 1.3], teriyaki: [16, 1], coconut: [700, 7], curry: [7, 0.3],
    marinara: [400, 12], bbq: [400, 1], mayo: [95, 0.1], ranch: [70, 0.2], caesar: [80, 0.3], pesto: [1100, 20], italdress: [40, 0], breadcrumb: [430, 14],
    oil: [120, 0], flour: [455, 13], sugar: [775, 0], brownsugar: [830, 0], salt: [0, 0], pepper: [6, 0.2], garpow: [10, 0.5], italseas: [5, 0.2],
    chilipow: [8, 0.4], cumin: [8, 0.4], paprika: [6, 0.3], cinnamon: [6, 0.1], cornstarch: [30, 0], ketchup: [20, 0.2], mustard: [10, 0.6], vinegar: [3, 0],
    frzbroc: [9, 0.8], frzmixed: [18, 0.9], frzpeas: [22, 1.5], frzcorn: [24, 0.8], frzstirfry: [10, 0.6], frzgreenbean: [9, 0.5],
    salmon: [950, 92], tilapia: [435, 90], shrimp: [385, 92], meatballs: [80, 4.5], hashbrown: [20, 0.5],
    cabbage: [225, 11.5], tofu: [330, 35], naan: [260, 9], engmuffin: [130, 5], bagel: [260, 10], deliham: [30, 5], pepperoni: [140, 6],
    drumstick: [560, 60], brksausage: [1300, 60], hotdog: [150, 5], cottage: [220, 25], feta: [400, 21], lentils: [680, 50], cornbread: [900, 15],
    pinto: [350, 21], whitebean: [350, 23], tomsauce: [80, 3], cannedchk: [380, 70], vegbroth: [15, 0.5], gravy: [80, 2], sriracha: [15, 0.3],
    chips: [140, 2], frzwaffle: [95, 2], pierogi: [77, 2], frzspinach: [7, 0.8]
};
// Spoils within about a week (used for the "fresh food used" meter and to steer away from waste).
// Onions, potatoes, garlic, carrots, cheese, eggs, butter and frozen/canned food keep for weeks, and meat can be frozen.
window.WC_PERISHABLE = ['romaine', 'spinach', 'cilantro', 'berries', 'banana', 'avocado', 'tomato', 'mushroom', 'greenonion', 'cucumber',
    'zucchini', 'bellpep', 'broccoli', 'slaw', 'celery', 'rotis', 'delitur', 'hummus', 'cream', 'ricotta', 'milk', 'bread', 'buns', 'hoagie', 'sourcream',
    'deliham', 'cottage', 'naan', 'bagel', 'tofu'];
