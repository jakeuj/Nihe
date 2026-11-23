import './styles.css';
import QRCode from 'qrcode';
import { renderCard } from './card-view.js';
import { createCardLink, decodeCard, maxPrice, shareMessage } from './cards.js';
import { extras, homeUrl, money, storedValue, treatments } from './catalog.js';
import { setupDraftBackup } from './draft-backup.js';
import { readDrafts, saveDrafts } from './drafts.js';
import { copyWithStatus, element } from './ui.js';

const forms = {
  care: document.querySelector('#care-form'),
  promo: document.querySelector('#promo-form'),
};
const careFields = forms.care.elements;
const promoFields = forms.promo.elements;
const treatmentSelect = careFields.namedItem('treatment');
const draftStatus = document.querySelector('#draft-status');
const livePreview = document.querySelector('#live-preview');
const editorStatus = document.querySelector('#editor-status');
const shareStatus = document.querySelector('#card-share-status');
const shareResults = document.querySelector('#share-results');
const openCard = document.querySelector('#open-card');
const modeButtons = [...document.querySelectorAll('[data-mode]')];
const destination = new URL(import.meta.env.BASE_URL + 'card/', location.origin);

let mode = 'care';
let shareVersion = 0;
let shared;

function reportStorageUnavailable() {
  draftStatus.textContent = '此瀏覽器目前無法保存草稿。離開前可用「草稿備份」複製備份連結。';
}

function savedInput(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readDraftForm(type) {
  const values = Object.fromEntries(new FormData(forms[type]));
  if (type === 'care') {
    values.extras = Object.fromEntries(extraFields.map(({ item, input, price }) => [
      item.id, { checked: input.checked, price: price.value },
    ]));
  }
  return values;
}

function saveDraft(type) {
  try {
    saveDrafts(localStorage, { [type]: readDraftForm(type) });
  } catch {
    reportStorageUnavailable();
  }
}

function extraRow(item) {
  const row = element('div', 'editor-extra');
  const label = element('label', 'check-label');
  const input = element('input');
  input.type = 'checkbox';
  label.append(input, element('span', '', item.name));

  const priceLabel = element('label', 'extra-price-label');
  const price = element('input');
  price.type = 'number';
  price.inputMode = 'numeric';
  price.min = '0';
  price.max = String(maxPrice);
  price.step = '1';
  price.required = true;
  price.setAttribute('aria-label', item.name + '價格（NT$）');
  priceLabel.append(element('span', '', 'NT$'), price);
  row.append(label, priceLabel);
  return { item, row, input, price };
}

for (const item of treatments) {
  const option = element('option', '', item.name);
  option.value = item.id;
  treatmentSelect.append(option);
}
const extraFields = extras.map(extraRow);
document.querySelector('#editor-extras').append(...extraFields.map(field => field.row));

function applyDraft(type, draft) {
  if (type === 'care') {
    const treatment = treatments.find(item => item.id === draft.treatment) ?? treatments[0];
    treatmentSelect.value = treatment.id;
    careFields.namedItem('price').value = savedInput(draft.price, String(treatment.price));
    careFields.namedItem('note').value = savedInput(draft.note);
    for (const { item, input, price } of extraFields) {
      const addon = draft.extras?.[item.id];
      input.checked = addon?.checked === true;
      price.disabled = !input.checked;
      price.value = savedInput(addon?.price, String(item.price));
    }
    return;
  }
  for (const field of ['title', 'details', 'price', 'until']) {
    promoFields.namedItem(field).value = savedInput(draft[field]);
  }
}

let savedDrafts = { care: {}, promo: {} };
try {
  savedDrafts = readDrafts(localStorage);
} catch {
  reportStorageUnavailable();
}
for (const type of Object.keys(forms)) {
  applyDraft(type, savedDrafts[type]);
}
for (const plan of storedValue) {
  const row = element('tr');
  row.append(element('td', '', money(plan.amount)), element('td', '', money(plan.bonus)), element('td', '', plan.months + ' 個月'));
  document.querySelector('#stored-value-reference').append(row);
}

function draftCard() {
  if (mode === 'care') {
    const treatment = treatments.find(item => item.id === treatmentSelect.value);
    const addons = extraFields.filter(field => field.input.checked).map(({ item, price }) => ({
      name: item.name,
      price: price.valueAsNumber,
    }));
    return {
      v: 1,
      type: 'care',
      items: [{ name: treatment.name, price: careFields.namedItem('price').valueAsNumber }, ...addons],
      note: careFields.namedItem('note').value.trim(),
    };
  }

  const price = promoFields.namedItem('price');
  return {
    v: 1,
    type: 'promo',
    title: promoFields.namedItem('title').value.trim(),
    details: promoFields.namedItem('details').value.trim(),
    price: price.value === '' ? null : price.valueAsNumber,
    until: promoFields.namedItem('until').value,
  };
}

function refreshPreview() {
  shareVersion += 1;
  shared = null;
  shareResults.hidden = true;
  editorStatus.textContent = '';
  shareStatus.textContent = '';

  const card = draftCard();
  if (forms[mode].matches(':invalid') || (mode === 'promo' && (!card.title || !card.details))) {
    livePreview.replaceChildren(
      element('p', 'card-brand', 'Nihe'),
      element('p', 'section-lede', '填妥欄位後，即可查看卡片。'),
    );
    return;
  }
  renderCard(livePreview, card);
}

for (const [type, form] of Object.entries(forms)) {
  form.addEventListener('input', event => {
    if (event.target === treatmentSelect) {
      const treatment = treatments.find(item => item.id === treatmentSelect.value);
      careFields.namedItem('price').value = String(treatment.price);
    }
    if (type === 'care') {
      for (const { input, price } of extraFields) price.disabled = !input.checked;
    }
    saveDraft(type);
    refreshPreview();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    saveDraft(type);
    const request = ++shareVersion;
    const card = draftCard();
    editorStatus.textContent = '';
    shareStatus.textContent = '';
    try {
      const url = createCardLink(card, destination);
      const snapshot = decodeCard(new URL(url).hash);
      const canvas = await QRCode.toCanvas(url, {
        errorCorrectionLevel: 'M',
        margin: 4,
        scale: 12,
      });
      if (request !== shareVersion) return;

      canvas.id = 'card-qr';
      canvas.setAttribute('aria-label', '這張分享卡的 QR Code');
      canvas.setAttribute('role', 'img');
      document.querySelector('#card-qr').replaceWith(canvas);
      shared = { url, snapshot, canvas };
      openCard.href = url;
      shareResults.hidden = false;
      editorStatus.textContent = '分享卡已產生。';
    } catch (error) {
      if (request !== shareVersion) return;

      shared = null;
      shareResults.hidden = true;
      editorStatus.textContent = error.message || '未能產生分享卡。';
    }
  });
}

function selectMode(type) {
  mode = type;
  for (const candidate of modeButtons) {
    candidate.setAttribute('aria-pressed', String(candidate.dataset.mode === mode));
  }
  for (const [key, form] of Object.entries(forms)) form.hidden = key !== mode;
  refreshPreview();
}

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    if (mode !== button.dataset.mode) selectMode(button.dataset.mode);
  });
}

document.querySelector('#copy-card-link').addEventListener('click', () => {
  if (shared) void copyWithStatus(shared.url, shareStatus, '已複製分享連結。');
});
document.querySelector('#copy-card-message').addEventListener('click', () => {
  if (shared) void copyWithStatus(shareMessage(shared.snapshot, shared.url), shareStatus, '已複製分享文案。');
});
document.querySelector('#download-card-qr').addEventListener('click', () => {
  if (!shared) return;
  const link = element('a');
  link.href = shared.canvas.toDataURL('image/png');
  link.download = 'Nihe-分享卡-QR.png';
  link.click();
});

const promotionUrls = {
  line: 'https://line.me/R/ti/p/@695nodop',
  home: homeUrl,
};

for (const button of document.querySelectorAll('[data-promotion-copy]')) {
  const status = button.closest('.promotion-copy').querySelector('.status');
  const message = document.getElementById(button.dataset.promotionMessage);
  const url = promotionUrls[button.dataset.promotionCopy];
  const clipboardText = message ? message.textContent.trim() + '\n' + url : url;
  const confirmation = message ? '已複製文案與店卡連結。' : '已複製連結。';

  button.addEventListener('click', () => {
    status.textContent = '';
    void copyWithStatus(clipboardText, status, confirmation);
  });
  button.hidden = false;
}

refreshPreview();
document.querySelector('[data-enhanced]').hidden = false;

setupDraftBackup({
  destination: new URL(import.meta.env.BASE_URL + 'studio/', location.origin),
  getDrafts: () => ({ care: readDraftForm('care'), promo: readDraftForm('promo') }),
  restoreDrafts(updates) {
    try {
      saveDrafts(localStorage, updates);
    } catch {
      reportStorageUnavailable();
      throw new Error('此瀏覽器目前無法保存草稿。請保留備份連結，稍後再試。');
    }
    const types = Object.keys(updates);
    for (const type of types) applyDraft(type, updates[type]);
    selectMode(types.includes(mode) ? mode : types[0]);
  },
});
