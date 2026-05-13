window.CAMPAIGN = {
    // ── Goals & Dates ──────────────────────────
    goalAmount: 5250,
    fundraisingDeadline: '2025-09-25T23:59:59', // ISO date string
    raceDate: '2025-09-28', // shown in hero eyebrow

    // ── Venmo ──────────────────────────────────
    venmoHandle: 'drewhsu', // without the @
    venmoNote: 'Berlin Marathon – Boomer Foundation',

    // ── Charity ────────────────────────────────
    charityName: 'Boomer Esiason Foundation',
    charityUrl: 'https://www.esiason.org',
    charityBlurb: 'fighting Cystic Fibrosis',

    // ── Team Members (up to 3) ─────────────────
    team: [
        {
            name: 'Drew',
            role: 'Runner · 26.2 miles',
            instagram: 'dreeeeeeeeeeeeeeeew', // without the @
            photo: '', // path or URL, blank = initials
        },
        {
            name: 'Runzin',
            role: 'Runner · 26.2 miles',
            instagram: 'rinzinanyetsang',
            photo: '',
        },
        {
            name: 'Tay',
            role: 'Runner · 26.2 miles',
            instagram: 'taylorhiroyasu',
            photo: '',
        },
    ],

    // ── Hero Banner ────────────────────────────
    heroBannerUrl: '', // URL or relative path to your group photo; blank = default

    // ── Default Donation Amounts ───────────────
    defaultAmounts: [25, 50, 100, 250, 500],
    defaultSelected: 100,
};
