export const SIZE = Object.freeze({ width: 1080, height: 1350, scale: 2 });
export const PHOTO = Object.freeze({ x: 306, y: 389, width: 522, height: 438, radius: 21 });

const asset = (file) => new URL(`../assets/${file}`, import.meta.url).href;
const INK = '#0b0b0e';
const CREAM = '#fff3bd';

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
    this.ctx.font = `${weight} ${fitted}px ${options.font || 'Space'}`;
    while (this.ctx.measureText(text).width > width && fitted > 13) {
      fitted -= 1;
      this.ctx.font = `${weight} ${fitted}px ${options.font || 'Space'}`;
    }
    this.text(text, x, y, fitted, color, weight, options);
  }

  line(x1, y1, x2, y2, color, width = 1) {
    const c = this.ctx;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.strokeStyle = color; c.lineWidth = width; c.stroke(); c.lineWidth = 1;
  }

  star(x, y, radius, color, rotation = 0) {
    const c = this.ctx;
    c.save(); c.translate(x, y); c.rotate(rotation); c.beginPath();
    for (let i = 0; i < 16; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.36;
      const a = i * Math.PI / 8;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fillStyle = color; c.fill(); c.restore();
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

    // The composition is drawn as native canvas artwork, so text remains crisp on export.
    const bg = c.createLinearGradient(0, 250, 260, 1230);
    bg.addColorStop(0, INK); bg.addColorStop(0.19, '#150b27');
    bg.addColorStop(0.52, '#570aa9'); bg.addColorStop(0.78, '#af00ed'); bg.addColorStop(1, '#eb10c2');
    c.fillStyle = bg; c.fillRect(0, 0, 1080, 1350);
    const glow = c.createRadialGradient(790, 960, 20, 790, 960, 650);
    glow.addColorStop(0, '#e936ff45'); glow.addColorStop(1, '#e936ff00');
    c.fillStyle = glow; c.fillRect(0, 350, 1080, 900);
    // Subtle grid and crosshairs add a little CTF character to the reference's gradient.
    for (let x = 50; x < 1080; x += 70) this.line(x, 390, x, 1190, '#ffffff06');
    for (let y = 420; y < 1200; y += 70) this.line(0, y, 1080, y, '#ffffff06');

    this.rounded(56, 41, 68, 68, 6, '#fff');
    c.drawImage(this.images.organizer, 60, 45, 60, 60);
    this.text('PESHAWAR', 135, 72, 21, '#fff', 700, { spacing: 1 });
    this.text('PENTESTERS', 135, 95, 21, '#fff', 700, { spacing: 1 });
    this.text('PRESENTS', 1020, 67, 16, '#b5aebf', 500, { align: 'right', spacing: 2 });
    this.text('THE WEB IS YOUR PLAYGROUND.', 1020, 93, 18, CREAM, 500, { align: 'right' });
    this.line(60, 131, 1020, 131, '#ffffff38');

    this.text('HACK THE WEB', 56, 229, 98, '#fff', 700, { spacing: -5 });
    this.text('CTF', 57, 321, 96, CREAM, 700, { spacing: -5 });
    this.rounded(266, 247, 238, 84, 8, '#7e24e9');
    this.text('2026', 282, 314, 78, CREAM, 700, { spacing: -4 });
    this.text('CAPTURE THE FLAG.', 1020, 283, 21, CREAM, 500, { align: 'right' });
    this.text('CLAIM THE PRIZE.', 1020, 309, 21, CREAM, 500, { align: 'right' });

    // Offset label and cream photo card, inspired by the supplied participant badge.
    const ribbon = c.createLinearGradient(240, 410, 300, 990);
    ribbon.addColorStop(0, '#9a2bff'); ribbon.addColorStop(1, '#fa23c4');
    this.rounded(232, 402, 586, 595, 34, ribbon);
    c.save(); c.translate(269, 965); c.rotate(-Math.PI / 2);
    this.text('HACK THE WEB ’26 / PARTICIPANT', 0, 0, 23, '#fff', 700, { spacing: 1 }); c.restore();
    c.save(); c.shadowColor = '#13001b44'; c.shadowBlur = 35; c.shadowOffsetY = 13;
    this.rounded(282, 365, 570, 632, 34, CREAM); c.restore();

    c.save(); c.beginPath(); c.roundRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height, PHOTO.radius); c.clip();
    if (this.photo) {
      const p = this.crop();
      c.fillStyle = '#e7e2d4'; c.fillRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
      c.drawImage(this.photo, p.x, p.y, p.width, p.height);
    } else {
      this.placeholder();
    }
    c.restore();

    const name = this.name.trim() || 'YOUR NAME';
    const lines = this.nameLines(name, 375, 43);
    lines.forEach((line, i) => this.fitText(line, 308, 874 + i * 43, 375, 43, INK, 700, { spacing: -1 }));
    this.fitText(this.title.trim() || 'CTF PARTICIPANT', 309, 970, 370, 22, '#4f4439', 500, { font: 'DM' });
    c.imageSmoothingEnabled = false;
    c.drawImage(this.images.qr, 714, 858, 108, 108);
    c.imageSmoothingEnabled = true;
    this.text('JOIN THE CHALLENGE', 768, 981, 13, INK, 700, { align: 'center' });
    this.star(933, 444, 48, CREAM, Math.PI / 12);
    this.star(136, 879, 26, '#fff3bdba', Math.PI / 8);
    this.line(926, 859, 970, 859, '#fff3bd90', 2); this.line(948, 837, 948, 881, '#fff3bd90', 2);
    this.line(112, 498, 140, 498, '#fff3bd70', 1.5); this.line(126, 484, 126, 512, '#fff3bd70', 1.5);
    this.text('I’M IN.', 948, 974, 27, '#fff', 700, { align: 'center' });

    this.rounded(60, 1044, 960, 102, 12, '#17042558', '#fff3bd55');
    this.text('05', 84, 1115, 59, CREAM, 700, { spacing: -3 });
    this.text('DECEMBER', 168, 1089, 21, '#fff', 700);
    this.text('2026', 168, 1117, 21, '#fff', 500);
    this.line(353, 1066, 353, 1124, '#fff3bd50');
    this.text('8–11 PM', 382, 1090, 29, CREAM, 700, { spacing: -1 });
    this.text('PAKISTAN TIME · UTC+5', 383, 1118, 18, '#fff', 500);
    this.line(701, 1066, 701, 1124, '#fff3bd50');
    this.text('ONLINE', 730, 1090, 29, CREAM, 700, { spacing: -1 });
    this.text('FREE · INDIVIDUAL', 732, 1118, 19, '#fff', 500);
    this.text('YOUR NEXT CHALLENGE STARTS HERE.', 540, 1191, 20, '#fff', 500, { align: 'center', spacing: 2 });

    // All three supplied sponsor identities appear in the downloaded poster.
    c.fillStyle = INK; c.fillRect(0, 1224, 1080, 126);
    this.text('SUPPORTED BY', 60, 1252, 15, '#bfb6ce', 500, { spacing: 2 });
    // Preserve each mark's proportions, with Webverse and Cybrixen slightly emphasized.
    const sponsorLogoSize = 48;
    const sponsorLogoY = 1296 - sponsorLogoSize / 2;
    // Trim only the black margin and compensate for the fine web details at this scale.
    const webverseSize = 62;
    c.drawImage(this.images.webverse, 48, 60, 416, 392, 60, 1296 - webverseSize / 2, webverseSize * 416 / 392, webverseSize);
    this.text('WEBVERSE', 140, 1300, 23, CREAM, 700, { spacing: 0.5 });
    this.line(363, 1268, 363, 1316, '#ffffff2a');
    // Crop only the transparent padding, preserving the sponsor's actual mark.
    const cybrixenSize = 55;
    c.drawImage(this.images.cybrixen, 15, 15, 66, 66, 405, 1296 - cybrixenSize / 2, cybrixenSize, cybrixenSize);
    this.text('CYBRIXEN', 473, 1300, 23, '#f4f1ff', 700, { spacing: 0.5 });
    this.line(674, 1268, 674, 1316, '#ffffff2a');
    const alteredWidth = sponsorLogoSize * this.images.altered.width / this.images.altered.height;
    this.rounded(867 - alteredWidth / 2 - 8, sponsorLogoY - 8, alteredWidth + 16, sponsorLogoSize + 16, 5, '#fff');
    c.drawImage(this.images.altered, 867 - alteredWidth / 2, sponsorLogoY, alteredWidth, sponsorLogoSize);
  }

  placeholder() {
    const c = this.ctx;
    const fill = c.createLinearGradient(PHOTO.x, PHOTO.y, PHOTO.x + PHOTO.width, PHOTO.y + PHOTO.height);
    fill.addColorStop(0, '#6c1bdb'); fill.addColorStop(1, '#c242e9');
    c.fillStyle = fill; c.fillRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
    c.strokeStyle = '#fff3bd35'; c.lineWidth = 1;
    for (let r = 120; r <= 470; r += 75) { c.beginPath(); c.arc(567, 608, r, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = '#fff3bd19'; c.beginPath(); c.arc(567, 574, 66, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(567, 755, 134, 112, 0, 0, Math.PI * 2); c.fill();
    this.rounded(473, 597, 188, 48, 24, '#16052cba', '#ffffff24');
    this.text('YOUR PHOTO HERE', 567, 627, 18, CREAM, 700, { align: 'center', spacing: 1 });
    this.text('THIS IS YOUR MOMENT.', 567, 431, 16, '#ffffffbc', 500, { align: 'center', spacing: 2 });
  }

  nameLines(name, width, size) {
    const c = this.ctx;
    c.font = `700 ${size}px Space`;
    if (c.measureText(name).width <= width) return [name];
    const words = name.split(/\s+/);
    if (words.length < 2) return [name];
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
