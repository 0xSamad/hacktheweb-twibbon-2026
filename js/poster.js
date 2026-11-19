export const SIZE = Object.freeze({ width: 1080, height: 1350, scale: 2 });
export const PHOTO = Object.freeze({ x: 244, y: 420, width: 592, height: 414, radius: 8 });

const asset = (file) => new URL(`../assets/${file}`, import.meta.url).href;
const INK = '#070e18';
const CYAN = '#70ffe1';
const WHITE = '#f4f8ff';
const MUTED = '#b3c6d9';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src.split('/').pop()}. Refresh to try again.`));
    image.src = src;
  });
}

export class Poster {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.photo = null;
    this.name = '';
    this.title = '';
    this.zoom = 1;
    this.panX = 0.5;
    this.panY = 0.5;
    this.ready = false;
  }

  async init() {
    const [, , organizer, webverse, cybrixen, altered, qr] = await Promise.all([
      document.fonts.load('700 80px Space'), document.fonts.load('400 24px DM'),
      loadImage(asset('organizer.png')), loadImage(asset('webverse.png')),
      loadImage(asset('cybrixen.png')), loadImage(asset('altered-security-outline.png')),
      loadImage(asset('register-qr.png')),
    ]);
    this.images = { organizer, webverse, cybrixen, altered, qr };
    this.ready = true;
    this.draw();
  }

  rounded(x, y, w, h, radius, fill, stroke) {
    const c = this.ctx;
    c.beginPath(); c.roundRect(x, y, w, h, radius);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }

  text(text, x, y, size, color = '#fff', weight = 700, options = {}) {
    const c = this.ctx;
    c.font = `${weight} ${size}px ${options.font || 'Space'}, Arial, sans-serif`;
    c.fillStyle = color;
    c.textAlign = options.align || 'left';
    c.textBaseline = 'alphabetic';
    c.letterSpacing = `${options.spacing || 0}px`;
    c.fillText(text, x, y);
    c.letterSpacing = '0px';
  }

  fitText(text, x, y, width, size, color, weight = 700, options = {}) {
    let fitted = size;
    this.ctx.letterSpacing = `${options.spacing || 0}px`;
    this.ctx.font = `${weight} ${fitted}px ${options.font || 'Space'}, Arial, sans-serif`;
    while (this.ctx.measureText(text).width > width && fitted > 13) {
      fitted -= 1;
      this.ctx.font = `${weight} ${fitted}px ${options.font || 'Space'}, Arial, sans-serif`;
    }
    this.text(text, x, y, fitted, color, weight, options);
  }

  line(x1, y1, x2, y2, color, width = 1) {
    const c = this.ctx;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.strokeStyle = color; c.lineWidth = width; c.stroke(); c.lineWidth = 1;
  }

  flag(x, y, size, color) {
    const c = this.ctx;
    c.save(); c.translate(x, y); c.scale(size / 48, size / 48);
    this.line(8, 44, 8, 4, color, 3);
    c.beginPath(); c.moveTo(10, 6); c.lineTo(39, 6); c.lineTo(31, 17);
    c.lineTo(39, 28); c.lineTo(10, 28); c.closePath();
    c.fillStyle = color; c.fill(); c.restore();
  }

  circuit(points, color = '#70ffe135') {
    const c = this.ctx;
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.strokeStyle = color; c.lineWidth = 2; c.stroke(); c.lineWidth = 1;
    for (const [x, y] of [points[0], points[points.length - 1]]) {
      c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fillStyle = color; c.fill();
    }
  }

  corners(x, y, w, h, color = CYAN) {
    const d = 23;
    for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      this.line(cx, cy, cx + dx * d, cy, color, 3);
      this.line(cx, cy, cx, cy + dy * d, color, 3);
    }
  }

  sponsors() {
    const c = this.ctx;
    c.fillStyle = '#050a11'; c.fillRect(0, 1194, SIZE.width, 156);
    this.line(60, 1194, 1020, 1194, '#70ffe14d');
    this.text('SUPPORTED BY', 60, 1225, 22, MUTED, 500, { spacing: 2 });
    // Every sponsor has the same card, a 48 px visible mark, and unchanged proportions.
    const y = 1242, cardWidth = 300, cardHeight = 82, markSize = 48;
    [60, 390, 720].forEach((x) => this.rounded(x, y, cardWidth, cardHeight, 8, '#f4f8ff'));
    const centerY = y + cardHeight / 2;
    const lockup = (image, label, centerX, crop) => {
      c.font = '700 24px Space, Arial, sans-serif';
      const width = markSize + 14 + c.measureText(label).width;
      const x = centerX - width / 2;
      if (crop) c.drawImage(image, ...crop, x, centerY - markSize / 2, markSize, markSize);
      else c.drawImage(image, x, centerY - markSize / 2, markSize, markSize);
      this.text(label, x + markSize + 14, centerY + 8, 24, '#142239');
    };
    lockup(this.images.webverse, 'WEBVERSE', 210);
    lockup(this.images.cybrixen, 'CYBRIXEN', 540, [15, 15, 66, 66]);
    const alteredWidth = markSize * this.images.altered.width / this.images.altered.height;
    c.drawImage(this.images.altered, 870 - alteredWidth / 2, centerY - markSize / 2, alteredWidth, markSize);
  }

  crop() {
    if (!this.photo) return null;
    const s = Math.max(PHOTO.width / this.photo.width, PHOTO.height / this.photo.height) * this.zoom;
    const width = this.photo.width * s, height = this.photo.height * s;
    return { width, height, overflowX: width - PHOTO.width, overflowY: height - PHOTO.height,
      x: PHOTO.x - (width - PHOTO.width) * this.panX,
      y: PHOTO.y - (height - PHOTO.height) * this.panY };
  }

  setPhoto(photo) {
    this.photo = photo;
    this.reset();
  }

  reset() { this.zoom = 1; this.panX = 0.5; this.panY = 0.5; this.draw(); }

  draw() {
    if (!this.ready) return;
    const c = this.ctx;
    c.setTransform(SIZE.scale, 0, 0, SIZE.scale, 0, 0);
    c.clearRect(0, 0, SIZE.width, SIZE.height);

    // Native canvas geometry and bundled fonts keep the export crisp and self-contained.
    c.fillStyle = INK; c.fillRect(0, 0, SIZE.width, SIZE.height);
    for (const [x, y, color] of [[180, 480, '#12695655'], [1030, 780, '#6a30bb44']]) {
      const glow = c.createRadialGradient(x, y, 0, x, y, 650);
      glow.addColorStop(0, color); glow.addColorStop(1, '#070e1800');
      c.fillStyle = glow; c.fillRect(0, 0, SIZE.width, 1194);
    }
    for (let x = 12; x < 1080; x += 48) this.line(x, 138, x, 1194, '#70ffe109');
    for (let y = 150; y < 1194; y += 48) this.line(0, y, 1080, y, '#70ffe109');
    this.circuit([[60, 416], [112, 416], [160, 464], [160, 588], [206, 634]]);
    this.circuit([[36, 684], [92, 684], [132, 724], [132, 894], [186, 948]]);
    this.circuit([[1020, 420], [972, 420], [924, 468], [924, 564], [878, 610]]);
    this.circuit([[1032, 722], [984, 722], [948, 758], [948, 928], [894, 982]], '#b79aff66');
    this.circuit([[60, 1008], [102, 1008], [146, 964]], '#70ffe15c');
    this.corners(40, 154, 1000, 1016, '#70ffe14a');

    this.rounded(60, 42, 66, 66, 6, '#fff');
    c.drawImage(this.images.organizer, 64, 46, 58, 58);
    this.text('PESHAWAR', 142, 70, 25, WHITE, 700, { spacing: 1 });
    this.text('PENTESTERS', 142, 100, 25, WHITE, 700, { spacing: 1 });
    this.rounded(724, 48, 296, 54, 5, '#102a2a', '#70ffe14d');
    this.flag(740, 60, 30, CYAN);
    this.text('CAPTURE THE FLAG', 785, 82, 22, CYAN);
    this.line(60, 134, 1020, 134, '#70ffe155');

    this.text('HACK THE WEB', 56, 237, 106, WHITE, 700, { spacing: -5 });
    this.text('CTF', 60, 320, 72, CYAN, 700, { spacing: -3 });
    this.rounded(212, 261, 209, 70, 5, CYAN);
    this.text('2026', 233, 313, 57, INK, 700, { spacing: -2 });
    this.text('WEB SECURITY CHALLENGE', 1020, 286, 25, WHITE, 500, { align: 'right' });
    this.text('FIND THE FLAG. OWN THE WEB.', 1020, 322, 23, CYAN, 500, { align: 'right' });

    // A terminal-style participant credential replaces the decorative event badge.
    c.save(); c.shadowColor = '#70ffe125'; c.shadowBlur = 38;
    this.rounded(222, 366, 636, 644, 12, '#101e2c', '#70ffe166'); c.restore();
    this.corners(218, 362, 644, 652);
    [254, 276, 298].forEach((x, i) => {
      c.beginPath(); c.arc(x, 392, 5, 0, Math.PI * 2);
      c.fillStyle = ['#b79aff', '#f5d980', CYAN][i]; c.fill();
    });
    this.text('PARTICIPANT // HACK THE WEB', 324, 400, 22, MUTED, 500);

    c.save(); c.beginPath(); c.roundRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height, PHOTO.radius); c.clip();
    if (this.photo) {
      const p = this.crop();
      c.fillStyle = '#172b3a'; c.fillRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
      c.drawImage(this.photo, p.x, p.y, p.width, p.height);
    } else {
      this.placeholder();
    }
    c.restore();
    this.corners(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height, '#70ffe190');

    const name = this.name.trim() || 'YOUR NAME';
    const lines = this.nameLines(name, 445, 44);
    lines.forEach((line, i) => this.fitText(line, 246, 885 + i * 46, 445, 44, WHITE, 700, { spacing: -1 }));
    this.fitText(this.title.trim() || 'CTF PARTICIPANT', 246, 981, 445, 26, CYAN, 500, { font: 'DM' });
    this.rounded(716, 854, 120, 120, 4, '#fff');
    c.imageSmoothingEnabled = false;
    c.drawImage(this.images.qr, 722, 860, 108, 108);
    c.imageSmoothingEnabled = true;
    this.text('JOIN CTF', 776, 998, 20, MUTED, 500, { align: 'center' });
    c.save(); c.translate(106, 925); c.rotate(-Math.PI / 2);
    this.text('WEB SECURITY / CAPTURE THE FLAG', 0, 0, 23, MUTED, 500, { spacing: 2 }); c.restore();
    c.save(); c.translate(991, 518); c.rotate(Math.PI / 2);
    this.text('EXPLORE. EXPLOIT. CAPTURE.', 0, 0, 23, '#c8b2f5', 500, { spacing: 2 }); c.restore();
    this.flag(900, 924, 54, '#b79aff');

    this.rounded(60, 1044, 960, 106, 8, '#102231', '#70ffe155');
    this.text('05 DEC', 84, 1088, 34, WHITE);
    this.text('2026', 84, 1125, 27, CYAN, 500);
    this.line(324, 1064, 324, 1130, '#70ffe155');
    this.text('8–11 PM', 352, 1088, 34, WHITE);
    this.text('PKT / UTC+5', 352, 1125, 25, CYAN, 500);
    this.line(670, 1064, 670, 1130, '#70ffe155');
    this.text('ONLINE', 698, 1088, 34, WHITE);
    this.text('FREE · INDIVIDUAL', 698, 1125, 25, CYAN, 500);
    this.sponsors();
  }

  placeholder() {
    const c = this.ctx;
    const fill = c.createLinearGradient(PHOTO.x, PHOTO.y, PHOTO.x + PHOTO.width, PHOTO.y + PHOTO.height);
    fill.addColorStop(0, '#123b3d'); fill.addColorStop(1, '#202240');
    c.fillStyle = fill; c.fillRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
    for (let y = PHOTO.y; y < PHOTO.y + PHOTO.height; y += 8) this.line(PHOTO.x, y, PHOTO.x + PHOTO.width, y, '#70ffe108');
    c.strokeStyle = '#70ffe12b'; c.lineWidth = 1;
    for (let r = 128; r <= 320; r += 70) { c.beginPath(); c.arc(540, 637, r, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = '#b3c6d926'; c.beginPath(); c.arc(540, 585, 62, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(540, 780, 132, 122, 0, 0, Math.PI * 2); c.fill();
    this.rounded(388, 637, 304, 62, 4, '#07131f', '#70ffe155');
    this.text('YOUR PHOTO HERE', 540, 676, 25, CYAN, 700, { align: 'center' });
    this.text('THE NEXT FLAG IS YOURS.', 540, 470, 23, WHITE, 500, { align: 'center', spacing: 1 });
  }

  nameLines(name, width, size) {
    const c = this.ctx;
    c.font = `700 ${size}px Space`;
    if (c.measureText(name).width <= width) return [name];
    const words = name.split(/\s+/);
    if (words.length < 2) {
      const letters = Array.from(name);
      const middle = Math.ceil(letters.length / 2);
      return [letters.slice(0, middle).join(''), letters.slice(middle).join('')];
    }
    let split = 1, best = Infinity;
    for (let i = 1; i < words.length; i++) {
      const left = c.measureText(words.slice(0, i).join(' ')).width;
      const right = c.measureText(words.slice(i).join(' ')).width;
      if (Math.max(left, right) < best) { best = Math.max(left, right); split = i; }
    }
    return [words.slice(0, split).join(' '), words.slice(split).join(' ')];
  }

  blob(format = 'jpeg') {
    this.draw();
    return new Promise((resolve, reject) => this.canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not create your poster. Please try again.')),
      `image/${format}`, 0.96,
    ));
  }
}
