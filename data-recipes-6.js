// ==========================================
// WeekCart — recipe pack 6: high-protein meals and snacks (for hitting protein goals)
// ==========================================
window.WC_RECIPES.push(
    // ---------------- HIGH-PROTEIN DINNERS ----------------
    { id: 'hp_chkbowl', type: 'dinner', n: 'Double-Chicken Burrito Bowls', emoji: '💪', pro: 'chicken', time: 30, tags: ['mexican', 'healthy'],
      ing: [['chkbreast', 2], ['rice', 1], ['blackbean', 1], ['salsa', 1], ['yogurt', 0.75], ['romaine', 1], ['lime', 1], ['taco', 1], ['mexcheese', 0.5]],
      steps: ['Cook the rice with a squeeze of lime.', 'Season the chicken with taco seasoning and cook 6 minutes per side. Slice.', 'Warm the beans.', 'Build bowls heavy on chicken, with rice, beans, lettuce, salsa, cheese and Greek yogurt in place of sour cream.'] },
    { id: 'hp_turkeychili', type: 'dinner', n: 'High-Protein Turkey Bean Chili', emoji: '🌶️', pro: 'turkey', time: 40, tags: ['soup', 'healthy', 'onepot'],
      ing: [['gturkey', 2], ['kidbean', 1], ['blackbean', 1], ['dicedtom', 2], ['onion', 1], ['chilipow', 3], ['cumin', 2], ['yogurt', 0.75], ['cheddar', 0.5]],
      steps: ['Brown the turkey with the onion.', 'Add spices, beans and tomatoes and simmer 25 minutes.', 'Top with Greek yogurt and a little cheddar.'] },
    { id: 'hp_sheetpanchk', type: 'dinner', n: 'Sheet-Pan Chicken, Broccoli & Sweet Potato', emoji: '🍠', pro: 'chicken', time: 40, tags: ['sheetpan', 'healthy'],
      ing: [['chkbreast', 2], ['broccoli', 1.5], ['sweetpot', 1.5], ['oil', 3], ['garpow', 1], ['paprika', 2], ['lemon', 1]],
      steps: ['Heat the oven to 425°F. Toss cubed sweet potatoes with oil and roast 15 minutes.', 'Add chicken pieces and broccoli tossed in oil, garlic powder, paprika and salt.', 'Roast 20 minutes more.', 'Finish with lemon juice. Great for meal prep.'] },
    { id: 'hp_shrimpeggrice', type: 'dinner', n: 'Shrimp & Egg White Fried Rice', emoji: '🍤', pro: 'fish', time: 25, tags: ['asian', 'healthy', 'quick'],
      ing: [['shrimp', 1.5], ['eggwhites', 1.5], ['rice', 1], ['frzpeas', 8], ['edamame', 1], ['soy', 4], ['greenonion', 1], ['oil', 2]],
      steps: ['Cook the rice and let it cool.', 'Cook the shrimp in oil until pink and set aside. Scramble the egg whites.', 'Stir-fry the peas and edamame, then the rice and soy sauce.', 'Fold in shrimp, egg whites and green onions.'] },
    { id: 'hp_steakbowl', type: 'dinner', n: 'Garlic Beef & Edamame Rice Bowls', emoji: '🥩', pro: 'beef', time: 25, tags: ['asian', 'quick'],
      ing: [['stewbeef', 1.75, 'sliced thin'], ['edamame', 1.5], ['rice', 1], ['soy', 4], ['garlic', 4], ['honey', 1], ['cornstarch', 1], ['oil', 2], ['greenonion', 1]],
      steps: ['Cook the rice.', 'Sear the beef in hot oil in batches.', 'Add garlic, edamame, soy sauce, honey and cornstarch mixed in 1/4 cup water and toss until glossy.', 'Serve over rice with green onions.'] },

    // ---------------- HIGH-PROTEIN BREAKFASTS ----------------
    { id: 'b_proteinoats', type: 'breakfast', n: 'Protein Oats', emoji: '💪', pro: 'veg', time: 10, tags: ['healthy', 'quick'],
      ing: [['oats', 2], ['milk', 2], ['protpowder', 4], ['banana', 2], ['pb', 2]],
      steps: ['Simmer the oats in milk and 1 cup water for 5 minutes.', 'Take off the heat and stir in the protein powder (it clumps if it boils).', 'Top with banana and peanut butter.'] },
    { id: 'b_eggwhite', type: 'breakfast', n: 'Egg White & Cheese Scramble on Toast', emoji: '🍳', pro: 'veg', time: 10, tags: ['healthy', 'quick'],
      ing: [['eggwhites', 2], ['eggs', 4], ['spinach', 2], ['cheddar', 0.5], ['bread', 4]],
      steps: ['Whisk the egg whites with the whole eggs, salt and pepper.', 'Wilt the spinach, then scramble the eggs gently with the cheese.', 'Serve on toast.'] },
    { id: 'b_proteinshake', type: 'breakfast', n: 'Peanut Butter Protein Shakes', emoji: '🥤', pro: 'veg', time: 5, tags: ['quick'],
      ing: [['protpowder', 4], ['milk', 4], ['banana', 2], ['pb', 4], ['oats', 0.5]],
      steps: ['Blend everything with ice until smooth.'] },
    { id: 'b_greekbowl', type: 'breakfast', n: 'Greek Yogurt Power Bowls', emoji: '🥣', pro: 'veg', time: 5, tags: ['healthy', 'quick'],
      ing: [['yogurt', 3], ['granola', 1], ['berries', 0.5], ['pb', 2], ['honey', 1]],
      steps: ['Spoon yogurt into bowls.', 'Top with granola, strawberries, a swirl of peanut butter and honey.'] },

    // ---------------- HIGH-PROTEIN LUNCHES ----------------
    { id: 'l_mealprepchk', type: 'lunch', n: 'Chicken, Rice & Broccoli Meal Prep', emoji: '🍱', pro: 'chicken', time: 30, tags: ['healthy'],
      ing: [['chkbreast', 1.5], ['rice', 1], ['frzbroc', 12], ['teriyaki', 4], ['oil', 1]],
      steps: ['Cook the rice and steam the broccoli.', 'Cook the cubed chicken in oil, then toss with teriyaki sauce.', 'Divide into containers. Keeps 4 days.'] },
    { id: 'l_proteinbox', type: 'lunch', n: 'Turkey, Egg & Cheese Protein Box', emoji: '🥚', pro: 'turkey', time: 15, tags: ['quick'],
      ing: [['delitur', 8], ['eggs', 4], ['stringcheese', 4], ['apple', 2], ['babycarrot', 6]],
      steps: ['Hard-boil the eggs for 11 minutes, cool and peel.', 'Pack each box with rolled turkey, an egg, a cheese stick, apple slices and carrots.'] },
    { id: 'l_chkwrap', type: 'lunch', n: 'Greek Yogurt Chicken Wraps', emoji: '🌯', pro: 'chicken', time: 10, tags: ['healthy', 'quick'],
      ing: [['cannedchk', 2], ['yogurt', 0.5], ['celery', 1], ['tortilla', 4], ['spinach', 2], ['lemon', 0.5]],
      steps: ['Mix the drained chicken with Greek yogurt, diced celery, lemon juice, salt and pepper.', 'Roll up in tortillas with spinach.'] },

    // ---------------- HIGH-PROTEIN SNACKS ----------------
    { id: 's_shake', type: 'snack', n: 'Protein shake', emoji: '🥤', pro: 'veg', time: 2, tags: [], ing: [['protpowder', 1], ['milk', 1]], steps: ['Shake or blend a scoop of protein with a cup of milk.'] },
    { id: 's_stringcheese', type: 'snack', n: 'String cheese & apple', emoji: '🧀', pro: 'veg', time: 1, tags: [], ing: [['stringcheese', 2], ['apple', 0.5]], steps: ['Two cheese sticks and a few apple slices.'] },
    { id: 's_edamame', type: 'snack', n: 'Salted edamame', emoji: '🫛', pro: 'veg', time: 5, tags: [], ing: [['edamame', 0.75]], steps: ['Microwave the frozen edamame 2–3 minutes and sprinkle with salt.'] },
    { id: 's_jerky', type: 'snack', n: 'Beef jerky', emoji: '🥩', pro: 'beef', time: 0, tags: [], ing: [['jerky', 1.5]], steps: ['Grab-and-go protein.'] },
    { id: 's_yogcup', type: 'snack', n: 'Greek yogurt cup', emoji: '🥄', pro: 'veg', time: 0, tags: [], ing: [['yogcup', 1]], steps: ['Grab one from the fridge.'] },
    { id: 's_cottagepb', type: 'snack', n: 'Cottage cheese & peanut butter', emoji: '🥜', pro: 'veg', time: 2, tags: [], ing: [['cottage', 0.75], ['pb', 1]], steps: ['Stir a spoon of peanut butter into cottage cheese.'] }
);
