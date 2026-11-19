export const homeUrl = 'https://jakeuj.com/Nihe/';

export const treatments = [
  {
    id: 'gentle',
    name: '輕簡呵護淨膚',
    description: '基礎清潔，日常肌膚養護',
    minutes: 60,
    price: 1000,
  },
  {
    id: 'hydrate',
    name: '水靚潤澤淨膚',
    description: '保濕舒緩，肌膚屏障養護',
    minutes: 90,
    price: 1500,
  },
  {
    id: 'balance',
    name: '透皙煥采淨膚',
    description: '溫和更新，維持油水平衡',
    price: 1500,
  },
];

export const extras = [
  { id: 'cleanse', name: '淨透清肌', description: '加時 30 分鐘', price: 500 },
  { id: 'massage', name: '芙韻凝顏', description: '炫手技舒壓', price: 500 },
  { id: 'relax', name: '金緻鉑顏', description: '鈦赫茲舒壓', price: 500 },
  { id: 'scalp', name: '顱釋重負', description: '鈦磁棒舒壓', price: 500 },
];

export const storedValue = [
  { amount: 3000, bonus: 200 },
  { amount: 5000, bonus: 500 },
  { amount: 8000, bonus: 1000 },
];

const amountFormat = new Intl.NumberFormat('zh-TW');

export function money(amount) {
  return 'NT$ ' + amountFormat.format(amount);
}

export function sumPrices(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
