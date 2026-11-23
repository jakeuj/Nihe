import { money, sumPrices } from './catalog.js';
import { decodeJsonToken, encodeJsonToken } from './url-token.js';

export const maxPrice = 99999;
export const maxShareUrlBytes = 750;

const maxTokenLength = 1400;
const itemLimit = 5;
const taipeiDate = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function validPrice(value) {
  return Number.isInteger(value) && value >= 0 && value <= maxPrice;
}

function readText(value, length, required = false) {
  if (typeof value !== 'string' || value.length > length) throw new Error('文字長度超出限制。');
  const text = value.trim();
  if (required && !text) throw new Error('請填寫完整的活動資料。');
  return text;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function normalizedItem(item) {
  if (!item || !validPrice(item.price)) throw new Error('請檢查護理價格。');
  return { name: readText(item.name, 32, true), price: item.price };
}

function normalizeCard(value) {
  if (value?.v !== 1) throw new Error('無法讀取這個版本的分享卡。');

  if (value.type === 'care') {
    if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > itemLimit) {
      throw new Error('請選擇一款主護理。');
    }
    return { v: 1, type: 'care', items: value.items.map(normalizedItem), note: readText(value.note, 100) };
  }
  if (value.type === 'promo') {
    if (!validDate(value.until)) throw new Error('請選擇有效的截止日。');
    if (value.price !== null && !validPrice(value.price)) throw new Error('請檢查優惠金額。');

    return {
      v: 1,
      type: 'promo',
      title: readText(value.title, 24, true),
      details: readText(value.details, 100, true),
      price: value.price,
      until: value.until,
    };
  }
  throw new Error('無法辨識分享卡類型。');
}

export function decodeCard(hash) {
  const token = hash.startsWith('#') ? hash.slice(1) : hash;
  if (token.length < 1 || token.length > maxTokenLength || !/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('分享卡連結不完整或格式錯誤。');
  }
  return normalizeCard(decodeJsonToken(token));
}

export function createCardLink(card, destination) {
  const url = new URL(destination);
  url.hash = encodeJsonToken(normalizeCard(card));
  if (new TextEncoder().encode(url.href).length > maxShareUrlBytes) {
    throw new Error('卡片連結太長。請縮短說明或推薦語，再產生 QR Code。');
  }
  return url.href;
}

export function isExpired(until, now = new Date()) {
  return until < taipeiDate.format(now);
}

export function cardTitle(card) {
  return card.type === 'care' ? '你的護理推薦' : card.title;
}

export function shareMessage(card, url) {
  if (card.type === 'care') {
    return [
      'Nihe｜護理推薦',
      card.items.map(item => item.name).join('＋'),
      '搭配金額 ' + money(sumPrices(card.items)),
      card.note,
      url,
    ].filter(Boolean).join('\n');
  }

  return [
    'Nihe｜' + card.title,
    isExpired(card.until) ? '活動已結束' : '活動至 ' + card.until,
    card.price === null ? '' : '優惠金額 ' + money(card.price),
    card.details,
    url,
  ].filter(Boolean).join('\n');
}
