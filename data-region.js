// ==========================================
// WeekCart — regional grocery price levels
// Grocery index by state, Q3 2026, from the C2ER Cost of Living Index as published by MERIC
// (Missouri Economic Research and Information Center): https://meric.mo.gov/cost-living-data-series
// 100 = U.S. average. 108 means groceries cost about 8% more than average.
// Update these numbers each quarter if you like.
// ==========================================
window.WC_GROCERY_INDEX = {
    source: 'MERIC / C2ER Cost of Living Index, grocery, Q3 2026',
    states: {
        AL: 96.4, AK: 124.9, AZ: 100.2, AR: 93.8, CA: 109.4, CO: 101.0, CT: 105.9, DE: 103.1, DC: 108.1, FL: 105.2,
        GA: 97.4, HI: 134.3, ID: 97.8, IL: 99.5, IN: 98.2, IA: 96.7, KS: 95.2, KY: 100.8, LA: 95.5, ME: 101.7,
        MD: 108.5, MA: 105.1, MI: 99.0, MN: 99.8, MS: 94.0, MO: 95.7, MT: 102.1, NE: 98.9, NV: 103.3, NH: 99.9,
        NJ: 106.7, NM: 96.1, NY: 102.0, NC: 101.2, ND: 94.6, OH: 98.2, OK: 94.5, OR: 105.1, PA: 99.2, RI: 104.0,
        SC: 99.3, SD: 97.5, TN: 96.6, TX: 95.7, UT: 98.1, VT: 102.4, VA: 100.1, WA: 106.1, WV: 96.4, WI: 99.7, WY: 99.7
    },
    names: {
        AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
        DC: 'Washington, D.C.', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
        KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
        MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
        NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
        PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
        VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
    },
    // first three digits of a ZIP code → state (works offline)
    zip3: [
        [10, 27, 'MA'], [28, 29, 'RI'], [30, 38, 'NH'], [39, 49, 'ME'], [50, 54, 'VT'], [55, 55, 'MA'], [56, 59, 'VT'], [60, 69, 'CT'],
        [70, 89, 'NJ'], [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'], [200, 200, 'DC'], [201, 201, 'VA'], [202, 205, 'DC'],
        [206, 219, 'MD'], [220, 246, 'VA'], [247, 268, 'WV'], [270, 289, 'NC'], [290, 299, 'SC'], [300, 319, 'GA'], [320, 349, 'FL'],
        [350, 369, 'AL'], [370, 385, 'TN'], [386, 397, 'MS'], [398, 399, 'GA'], [400, 427, 'KY'], [430, 459, 'OH'], [460, 479, 'IN'],
        [480, 499, 'MI'], [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'], [569, 569, 'DC'], [570, 577, 'SD'], [580, 588, 'ND'],
        [590, 599, 'MT'], [600, 629, 'IL'], [630, 658, 'MO'], [660, 679, 'KS'], [680, 693, 'NE'], [700, 714, 'LA'], [716, 729, 'AR'],
        [730, 749, 'OK'], [750, 799, 'TX'], [800, 816, 'CO'], [820, 831, 'WY'], [832, 838, 'ID'], [840, 847, 'UT'], [850, 865, 'AZ'],
        [870, 884, 'NM'], [885, 885, 'TX'], [889, 898, 'NV'], [900, 961, 'CA'], [967, 968, 'HI'], [970, 979, 'OR'], [980, 994, 'WA'],
        [995, 999, 'AK']
    ]
};
