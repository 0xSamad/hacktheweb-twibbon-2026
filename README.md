# HACK THE WEB 2026 · Participant poster studio

A Vercel-ready participant poster maker for Peshawar Pentesters. The portrait composition uses a dark navy terminal frame, mint highlights, circuit traces, and capture-the-flag artwork. Its exported poster includes Webverse, Cybrixen, and Altered Security in equal sponsor cards with matching visible logo heights.

**Event:** 5 December 2026, 8:00–11:00 PM Pakistan Standard Time (UTC+5). Online, free, individual participation.

Upload a JPG, PNG, or WebP photo, drag or zoom it into the frame, enter a name and optional title, and download a **2160 × 2700** JPEG or PNG. Keyboard arrow keys and position sliders offer alternatives to dragging. The share panel has an editable caption and a copy button, a link to LinkedIn, and device file sharing where supported. Desktop users attach the downloaded poster and paste the caption in LinkedIn.

Photos stay in browser memory. There are no uploads, accounts, analytics, APIs, or runtime dependencies. Fonts, logos, and the registration QR code are bundled locally. The poster is drawn with Canvas 2D, so event text and geometry remain sharp on export.

## Deploy on Vercel

1. Import this GitHub repository as a new Vercel project.
2. Choose **Other** as the Framework Preset.
3. Use the repository root as the Root Directory. Leave the Build Command empty and the Output Directory at its default (the project root).
4. Deploy. No environment variables or install step are required.

The `vercel.json` file provides static hosting headers. Every file needed at runtime is already in the repository.

## Local preview

With Node.js 20 or newer:

```sh
npm run dev
```

Open http://127.0.0.1:5173. A static HTTP server also works. Use HTTP rather than opening `index.html` as a `file://` URL because the app uses JavaScript modules.

## Original design restore point

The original website was committed before the cyber design refresh as `c503db2`, with the Git tag `backup/original-poster-2026-11-19`. The tag is also saved on GitHub. The refreshed design is on `design/cyber-poster-refresh`.

To inspect the original in a separate branch, first save any current edits, then run:

```sh
git switch -c review-original-poster backup/original-poster-2026-11-19
```

Return to the refreshed design with `git switch design/cyber-poster-refresh`. To restore the original files on the current branch without rewriting history, use `git restore --source=backup/original-poster-2026-11-19 -- .`, review the diff, and commit the restoration.

## Files and content

- `index.html` and `styles.css`: responsive editor page.
- `js/config.js`: event information, registration and Discord links, post caption.
- `js/poster.js`: canvas composition, exact photo slot geometry, sponsor strip, image export.
- `js/app.js`: upload validation, crop controls, downloads, clipboard, sharing.
- `assets/`: supplied logos, bundled fonts and their OFL licenses, registration QR.
- `docs/`: desktop and mobile screenshots, an empty poster preview, and browser verification notes.

The registration URL is present in `index.html` for accessible links and in `js/config.js` for the caption. If it changes, update both and regenerate `assets/register-qr.png`. The current QR encodes the full registration URL; it does not rely on a short link or remote QR service.

**Registration:** https://script.google.com/macros/s/AKfycbz7n8MoTqDzRLVgF_y2nEZCg2XxugEDfajji6SpQpsL1fJRMu1i_lPbQxYLEGSdUGGe/exec

**Discord:** https://discord.gg/TDjcgRTwW4

## Assets

Sponsor and organizer identities were supplied by Peshawar Pentesters and retain their original artwork and aspect ratios. The three exported sponsor cards are each 300 × 82 design pixels; the logo artwork is 48 design pixels tall (96 pixels in the exported image, allowing for transparent padding). Cybrixen's supplied mark is 96 × 96; only its transparent padding is cropped. Webverse's supplied artwork includes an opaque black background. Altered Security's complete logo is contained within its card at the same height as the other marks. The page footer uses equal cards and the same 48-pixel logo height, stacking the cards on small screens.

Static poster labels are at least 20 design pixels, with larger date, time, and participation details. Editor text is at least 12 CSS pixels at every breakpoint, and input text is 16 pixels. Space Grotesk and DM Sans are bundled under the SIL Open Font License; license files are in `assets/fonts/`. Sponsor logos remain the property of their owners.
