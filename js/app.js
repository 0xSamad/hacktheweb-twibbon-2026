import { EVENT, CAPTION } from './config.js';
import { Poster, PHOTO, SIZE } from './poster.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#poster');
const poster = new Poster(canvas);
const board = $('#poster-board');
const fileInput = $('#photo');
const nameInput = $('#participant-name');
const titleInput = $('#participant-title');
const zoomInput = $('#zoom');
const horizontal = $('#horizontal');
const vertical = $('#vertical');
const editorStatus = $('#editor-status');
const shareStatus = $('#share-status');
const caption = $('#caption');
const download = $('#download');
const share = $('#share-device');
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
let format = 'jpeg';
let activePhotoUrl = null;
let loadSequence = 0;
let dragging = null;
let exporting = false;

caption.value = CAPTION;
document.querySelectorAll('[data-event-link]').forEach((link) => { link.href = EVENT[link.dataset.eventLink]; });

function feedback(element, text, tone = '') {
  element.textContent = text;
  element.className = `feedback ${tone}`.trim();
}

function controls() {
  zoomInput.value = Math.round(poster.zoom * 100);
  $('#zoom-output').value = `${Math.round(poster.zoom * 100)}%`;
  horizontal.value = Math.round(poster.panX * 100);
  vertical.value = Math.round(poster.panY * 100);
  $('#photo-controls').disabled = !poster.photo;
  board.classList.toggle('has-photo', Boolean(poster.photo));
  const complete = poster.ready && poster.photo && nameInput.value.trim();
  download.disabled = !complete || exporting;
  share.disabled = !complete || exporting;
  return Boolean(complete);
}

function update() {
  poster.name = nameInput.value;
  poster.title = titleInput.value;
  $('#name-count').textContent = `${nameInput.value.length} / 48`;
  poster.draw();
  const ready = controls();
  feedback(editorStatus, ready ? 'Looking good. Your poster is ready.' : 'Add your photo and name to download.', ready ? 'success' : '');
}

nameInput.addEventListener('input', update);
titleInput.addEventListener('input', update);

async function choosePhoto(file) {
  if (!file) return;
  const sequence = ++loadSequence;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    feedback(editorStatus, 'Choose a JPG, PNG, or WebP photo.', 'error');
    fileInput.value = '';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    feedback(editorStatus, 'That photo is larger than 20 MB. Choose a smaller image.', 'error');
    fileInput.value = '';
    return;
  }
  feedback(editorStatus, 'Opening your photo…');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (sequence !== loadSequence) { URL.revokeObjectURL(url); return; }
    const previous = activePhotoUrl;
    activePhotoUrl = url;
    poster.setPhoto(image);
    if (previous) URL.revokeObjectURL(previous);
    $('#upload-label').textContent = 'Change your photo';
    $('#photo-hint').textContent = 'Drag the preview or use the controls to adjust your crop. Your photo stays on this device.';
    update();
  } catch {
    URL.revokeObjectURL(url);
    if (sequence === loadSequence) feedback(editorStatus, 'We couldn’t open that image. Try another JPG, PNG, or WebP.', 'error');
  } finally {
    fileInput.value = '';
  }
}

fileInput.addEventListener('change', () => choosePhoto(fileInput.files[0]));
const dropArea = $('#upload-area');
for (const event of ['dragenter', 'dragover']) {
  dropArea.addEventListener(event, (e) => { e.preventDefault(); dropArea.classList.add('drag-over'); });
}
for (const event of ['dragleave', 'drop']) {
  dropArea.addEventListener(event, (e) => { e.preventDefault(); dropArea.classList.remove('drag-over'); });
}
dropArea.addEventListener('drop', (e) => choosePhoto(e.dataTransfer.files[0]));

zoomInput.addEventListener('input', () => {
  poster.zoom = clamp(Number(zoomInput.value) / 100, 1, 3);
  controls(); poster.draw();
});
horizontal.addEventListener('input', () => { poster.panX = Number(horizontal.value) / 100; poster.draw(); });
vertical.addEventListener('input', () => { poster.panY = Number(vertical.value) / 100; poster.draw(); });
$('#reset-photo').addEventListener('click', () => { poster.reset(); controls(); });

function point(event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * SIZE.width / bounds.width,
    y: (event.clientY - bounds.top) * SIZE.height / bounds.height };
}

canvas.addEventListener('pointerdown', (e) => {
  if (!poster.photo || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const p = point(e);
  if (p.x < PHOTO.x || p.x > PHOTO.x + PHOTO.width || p.y < PHOTO.y || p.y > PHOTO.y + PHOTO.height) return;
  e.preventDefault(); canvas.focus({ preventScroll: true });
  dragging = { ...p, pointerId: e.pointerId };
  canvas.setPointerCapture(e.pointerId);
  board.classList.add('is-dragging');
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragging || dragging.pointerId !== e.pointerId) return;
  const p = point(e), crop = poster.crop();
  if (crop.overflowX > 0.01) poster.panX = clamp(poster.panX - (p.x - dragging.x) / crop.overflowX);
  if (crop.overflowY > 0.01) poster.panY = clamp(poster.panY - (p.y - dragging.y) / crop.overflowY);
  dragging = { ...p, pointerId: e.pointerId };
  controls(); poster.draw();
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  canvas.addEventListener(event, () => { dragging = null; board.classList.remove('is-dragging'); });
}
canvas.addEventListener('keydown', (e) => {
  if (!poster.photo || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  const amount = e.shiftKey ? 0.1 : 0.02;
  if (e.key === 'ArrowLeft') poster.panX = clamp(poster.panX + amount);
  if (e.key === 'ArrowRight') poster.panX = clamp(poster.panX - amount);
  if (e.key === 'ArrowUp') poster.panY = clamp(poster.panY + amount);
  if (e.key === 'ArrowDown') poster.panY = clamp(poster.panY - amount);
  controls(); poster.draw();
});

document.querySelectorAll('[data-format]').forEach((button) => {
  button.addEventListener('click', () => {
    format = button.dataset.format;
    document.querySelectorAll('[data-format]').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  });
});

function fileName() {
  const name = nameInput.value.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'participant';
  return `hack-the-web-2026-${name}.${format === 'jpeg' ? 'jpg' : 'png'}`;
}

function save(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = fileName(); document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

download.addEventListener('click', async () => {
  if (!controls()) return;
  exporting = true; controls();
  feedback(editorStatus, 'Preparing your high resolution poster…');
  try {
    save(await poster.blob(format));
    feedback(editorStatus, 'Poster downloaded. Share it and tag Peshawar Pentesters!', 'success');
  } catch (error) {
    feedback(editorStatus, error.message, 'error');
  } finally { exporting = false; controls(); }
});

$('#copy-caption').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(caption.value);
    feedback(shareStatus, 'Caption copied. Paste it with your poster on LinkedIn.', 'success');
  } catch {
    $('#caption-details').open = true;
    caption.focus(); caption.select();
    const copied = document.execCommand('copy');
    feedback(shareStatus, copied ? 'Caption copied.' : 'Your caption is selected. Copy it using your device’s copy command.', copied ? 'success' : '');
  }
});

if (navigator.share && navigator.canShare) {
  const sample = new File([''], 'poster.jpg', { type: 'image/jpeg' });
  share.hidden = !navigator.canShare({ files: [sample] });
}
share.addEventListener('click', async () => {
  if (!controls()) return;
  try {
    const file = new File([await poster.blob(format)], fileName(), { type: `image/${format}` });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: caption.value, title: EVENT.name });
      feedback(shareStatus, 'Poster sent to your chosen share app.', 'success');
    } else {
      save(file);
      feedback(shareStatus, 'Poster downloaded. Copy the caption to add it to your post.');
    }
  } catch (error) {
    if (error.name !== 'AbortError') feedback(shareStatus, 'Device sharing is unavailable. Use Download your poster and Copy caption.', 'error');
  }
});

window.addEventListener('beforeunload', () => { if (activePhotoUrl) URL.revokeObjectURL(activePhotoUrl); });

try {
  await poster.init();
  board.setAttribute('aria-busy', 'false');
  $('#loading').hidden = true;
  update();
} catch (error) {
  board.setAttribute('aria-busy', 'false');
  $('#loading').textContent = 'Your frame couldn’t load. Refresh the page to try again.';
  feedback(editorStatus, error.message, 'error');
}
