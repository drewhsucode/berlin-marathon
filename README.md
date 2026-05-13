# Berlin Marathon Fundraiser 🏃

A self-hosted fundraising page for the Berlin Marathon, powered by GitHub + Netlify.

---

## Project Structure

```
berlin-marathon/
├── public/
│   ├── index.html        ← main page (don't edit)
│   └── config.js         ← ✏️  ALL your settings live here
├── netlify/
│   └── functions/
│       └── donations.mjs ← serverless API (Netlify Blobs storage)
├── netlify.toml          ← Netlify build config
└── package.json
```

---

## Quick Setup

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create berlin-marathon --public --push
# or push to an existing repo manually
```

### 2. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Connect your GitHub repo
3. Netlify auto-detects `netlify.toml` — no build settings needed
4. Click **Deploy site**

### 3. Custom Domain

In Netlify → **Domain settings → Add custom domain**, enter your domain.
Then at your domain registrar, point your nameservers to Netlify's (they'll tell you which ones).

---

## Customizing the Site

**Everything is in `public/config.js`** — open it and edit:

| Setting | What it does |
|---|---|
| `goalAmount` | Your fundraising goal in dollars |
| `fundraisingDeadline` | ISO date string for when fundraising closes |
| `venmoHandle` | Your Venmo username (without @) |
| `charityUrl` | Link to the foundation |
| `team[]` | Names, Instagram handles, photo URLs for each runner |
| `heroBannerUrl` | URL or path to your group banner photo |
| `defaultAmounts` | The donation preset buttons |

After editing `config.js`, commit and push — Netlify auto-deploys in ~30 seconds.

### Adding Team Photos

Option A — upload to your repo:
```
public/photos/alice.jpg
public/photos/bob.jpg
```
Then in config.js: `photo: "photos/alice.jpg"`

Option B — use any image URL (e.g. from Instagram CDN or Google Photos)

### Adding Your Group Banner Photo
Same as above — upload to `public/` and set `heroBannerUrl: "photos/group.jpg"` in config.js.

---

## How Donations Work

- Visitor fills out the form → clicks **Open Venmo** → sends money on Venmo
- They come back to the site → click **I sent it!**
- The form data is saved to **Netlify Blobs** (built-in, no extra accounts)
- The donor appears on the donor wall instantly
- The progress bar and stats update automatically
- Page polls for new donors every 30 seconds — no refresh needed

> **Note:** Donations are self-reported (honor system), since Venmo doesn't have a public payment webhook. This is standard for personal fundraising pages.

---

## Local Development

```bash
npm install -g netlify-cli
npm install
netlify dev
```

Visit `http://localhost:8888` — functions and Blobs work locally too.

---

## Updating the Raised Total / Seeding Donors

To manually add a donation (e.g. cash donors), use the Netlify CLI or curl:

```bash
curl -X POST https://yoursite.netlify.app/api/donations \
  -H "Content-Type: application/json" \
  -d '{"name":"Cash Donor","amount":50,"message":"Good luck!","anonymous":false}'
```
