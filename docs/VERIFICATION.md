# Browser verification

Checked locally in Chromium on 17 November 2026.

- Desktop layout at 1440 px and mobile layout at 390 px; screenshots in this folder.
- No horizontal overflow at 320, 390, 768, or 1280 px.
- JPG/PNG/WebP upload path, corrupt image handling, rejection of unsupported files, and preservation of a prior valid image after an invalid replacement.
- A photo and nonblank name are required before downloading. Long names wrap within the name card.
- Zoom, pointer dragging, reset, keyboard arrow movement, and position sliders.
- Caption copying via the browser clipboard.
- JPEG and PNG downloads both open as 2160 × 2700 images.
- The registration QR is decoded from the exported PNG and compared with the supplied Google Apps Script URL.
- Participant photos and names are absent after a reload. No application request uploads a photo; browser object URLs are used for local image decoding.
- No JavaScript page errors during the checked flows.

Device file sharing uses the Web Share API and is offered only when the browser reports support. It has not been exercised on physical iOS or Android devices. A live Vercel deployment is not part of this verification; this repository is ready to import there.

`poster-preview.png` shows the empty template. `desktop.png` and `mobile.png` show the editor with its default state. No participant photo is included in the repository.
