# Browser verification

Cyber design refresh checked locally in Chromium on 19 November 2026.

- Desktop layout at 1440 px and mobile layout at 390 px; screenshots in this folder.
- No horizontal overflow at 320, 390, 520, 768, 1000, or 1440 px, including with a photo and long participant text.
- JPG/PNG/WebP upload path, corrupt image handling, rejection of unsupported files, and preservation of a prior valid image after an invalid replacement.
- A photo and nonblank name are required before downloading. A maximum-length, unbroken 48-character name wraps within the name card without covering the QR code. Long optional titles fit their allotted width.
- Zoom, pointer dragging, reset, keyboard arrow movement, and position sliders.
- Caption copying via the browser clipboard.
- JPEG and PNG downloads both open as 2160 × 2700 images.
- The same bundled registration QR image is used in the export, at the original rendered size, with additional white padding. The URL and QR source asset were not changed. QR decoding was verified in the previous 17 November checks; it was not repeated during this refresh.
- Visible sponsor artwork in the exported PNG measures 96, 94, and 94 pixels tall for Webverse, Cybrixen, and Altered Security respectively, accounting for transparent padding and antialiasing. All three use equal 300 × 82 design-pixel cards. Footer sponsor cards have matching dimensions at every checked viewport.
- The new poster, the default desktop editor, and the default mobile editor were visually inspected. Static poster text is at least 20 design pixels; editor copy has a 12 CSS-pixel minimum, with larger labels, buttons, and inputs.
- Participant photos and names are absent after a reload. No application request uploads a photo; browser object URLs are used for local image decoding.
- No JavaScript page errors during the checked flows.

JavaScript syntax checks (`node --check`) and `git diff --check` also pass.

Device file sharing uses the Web Share API and is offered only when the browser reports support. It has not been exercised on physical iOS or Android devices. A live Vercel deployment is not part of this verification.

`poster-preview.png` shows the empty template. `desktop.png` and `mobile.png` show the editor with its default state. No participant photo is included in the repository.
