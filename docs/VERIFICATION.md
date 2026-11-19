# Browser verification

Original-design text and sponsor adjustments checked locally in Chromium on 19 November 2026.

- Desktop layout at 1440 px and mobile layout at 390 px; screenshots in this folder.
- No horizontal overflow at 320, 390, 520, 768, 1000, or 1440 px.
- The new empty poster is compared pixel by pixel with a fresh render of the saved original commit. All pixels outside the intended small-text and sponsor areas are identical, including the gradient, stars, main headings, photo frame, and other artwork.
- PNG upload, name-required download gating, a two-line participant name, and the enlarged optional title.
- Zoom and reset photo controls.
- JPEG and PNG downloads both open as 2160 × 2700 images.
- Sponsor artwork heights measured from an actual exported PNG are 95, 94, and 94 pixels for Webverse, Cybrixen, and Altered Security, after transparent/plain background padding is accounted for.
- Desktop, mobile, and poster screenshots in this folder show the original design with the typography and sponsor adjustments.
- No JavaScript page errors during the checked flows.

JavaScript syntax and `git diff --check` also pass. The photo geometry, event links, QR image, upload handlers, clipboard, and sharing code are unchanged from the original checkpoint. The broader upload-validation, dragging, keyboard controls, clipboard, QR decoding, and privacy checks listed in the 17 November verification were not repeated for these visual-only changes.

Device file sharing uses the Web Share API and is offered only when the browser reports support. It has not been exercised on physical iOS or Android devices. A live Vercel deployment is not part of this verification; this repository is ready to import there.

`poster-preview.png` shows the empty template. `desktop.png` and `mobile.png` show the editor with its default state. No participant photo is included in the repository.
