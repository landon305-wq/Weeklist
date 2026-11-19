# WeekCart

Free weekly meal planner and grocery list. Set a budget, choose what you like to eat, pick ALDI or Kroger, and get a week of recipes plus a shopping list sorted by the store's layout.

## Put it online (GitHub Pages)
1. Make a new GitHub repository (for example `weekcart`) and upload these files: `index.html`, `style.css`, `app.js`, `data-items.js`, `data-recipes.js`.
2. In the repo, go to **Settings → Pages**, set Source to **Deploy from a branch**, pick `main` and `/ (root)`, and save.
3. After a minute, your site is at `https://YOUR-USERNAME.github.io/weekcart/`.

`worker.js` does **not** go in the repo. It's only for the optional live Kroger prices.

## Optional: live Kroger prices and real aisle numbers
On the site, click **⚡ Live prices** for step-by-step instructions (free Kroger developer account + free Cloudflare Worker running `worker.js`).

## Editing
- Prices and package sizes: `data-items.js` (`a` = ALDI price, `k` = Kroger price).
- Recipes: `data-recipes.js`. Ingredient amounts are for 4 servings and use the item's unit.
- After editing, bump the `?v=1` numbers in `index.html` so browsers load the new files.
