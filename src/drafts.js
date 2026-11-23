import { validDate } from './cards.js';
import { extras, treatments } from './catalog.js';
import { decodeJsonToken, encodeJsonToken } from './url-token.js';

export const backupHashPrefix = '#backup=';

const storageKey = 'nihe:studio:v2:drafts';
const legacyPrefix = 'nihe:studio:v1:';
const maxBackupLength = 4096;
const malformedLink = '備份連結不完整或格式錯誤，請重新複製完整網址。';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readRecord(raw) {
  try {
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readDrafts(storage) {
  const bundle = readRecord(storage.getItem(storageKey));
  if (bundle && isRecord(bundle.care) && isRecord(bundle.promo)) return bundle;

  return {
    care: readRecord(storage.getItem(legacyPrefix + 'care')) ?? {},
    promo: readRecord(storage.getItem(legacyPrefix + 'promo')) ?? {},
  };
}

export function saveDrafts(storage, updates) {
  const drafts = { ...readDrafts(storage), ...updates };
  storage.setItem(storageKey, JSON.stringify(drafts));
}

function textField(value, maxLength) {
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new Error('備份的文字欄位格式錯誤或超過長度。');
  }
  return value;
}

function priceField(value) {
  // Drafts can include empty fields and numbers that still need correction.
  const numberInput = /^-?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/;
  if (typeof value !== 'string' || value.length > 64 ||
      (value !== '' && (!numberInput.test(value) || !Number.isFinite(Number(value))))) {
    throw new Error('備份的價格欄位格式錯誤。');
  }
  return value;
}

function normalizeDrafts(value) {
  const { care, promo } = value;
  if (!isRecord(care) || !isRecord(care.extras) || !isRecord(promo)) {
    throw new Error('備份缺少草稿資料。');
  }
  if (!treatments.some(item => item.id === care.treatment)) {
    throw new Error('備份的主護理項目無法辨識。');
  }
  if (promo.until !== '' && !validDate(promo.until)) {
    throw new Error('備份的活動截止日格式錯誤。');
  }

  const addons = Object.fromEntries(extras.map(({ id, price }) => {
    const addon = care.extras[id];
    if (addon === undefined) return [id, { checked: false, price: String(price) }];
    if (!isRecord(addon) || typeof addon.checked !== 'boolean') {
      throw new Error('備份的加購欄位格式錯誤。');
    }
    return [id, { checked: addon.checked, price: priceField(addon.price) }];
  }));

  return {
    care: {
      treatment: care.treatment,
      price: priceField(care.price),
      note: textField(care.note, 100),
      extras: addons,
    },
    promo: {
      title: textField(promo.title, 24),
      details: textField(promo.details, 100),
      price: priceField(promo.price),
      until: promo.until,
    },
  };
}

export function createDraftBackup(drafts, destination) {
  const url = new URL(destination);
  url.hash = backupHashPrefix + encodeJsonToken({ v: 1, ...normalizeDrafts(drafts) });
  if (url.href.length > maxBackupLength) throw new Error('備份連結太長，請縮短草稿文字後再匯出。');
  return url.href;
}

export function decodeDraftBackup(input, destination) {
  const link = input.trim();
  if (link.length > maxBackupLength) throw new Error(malformedLink);

  let url;
  try {
    url = new URL(link);
  } catch {
    throw new Error(malformedLink);
  }
  if (url.origin !== destination.origin || url.pathname !== destination.pathname ||
      !url.hash.startsWith(backupHashPrefix)) {
    throw new Error('請貼上 Nihe 店主工具產生的草稿備份網址。');
  }

  const token = url.hash.slice(backupHashPrefix.length);
  if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new Error(malformedLink);
  let backup;
  try {
    backup = decodeJsonToken(token);
  } catch {
    throw new Error(malformedLink);
  }
  if (backup?.v !== 1) throw new Error('此備份版本無法匯入。');
  return normalizeDrafts(backup);
}
