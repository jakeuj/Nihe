export const homeUrl = 'https://jakeuj.com/Nihe/';

export const treatments = [
  {
    id: 'gentle',
    name: '輕簡呵護淨膚',
    description: '想做個基礎清潔、簡單照顧肌膚，可以從這款開始。',
    minutes: 60,
    price: 1000,
  },
  {
    id: 'hydrate',
    name: '水靚潤澤淨膚',
    description: '覺得臉乾、緊繃時，可以選這款保濕舒緩，照顧肌膚屏障。',
    minutes: 90,
    price: 1500,
  },
  {
    id: 'balance',
    name: '透皙煥采淨膚',
    description: '容易出油時，可以選這款做溫和更新，照顧肌膚的油水平衡。',
    minutes: 90,
    price: 1500,
  },
];

export const extras = [
  { id: 'cleanse', name: '淨透清肌', description: '多留 30 分鐘做淨膚。', price: 500 },
  { id: 'massage', name: '芙韻凝顏', description: '想加做手技舒壓。', price: 500 },
  { id: 'relax', name: '金緻鉑顏', description: '想試試鈦赫茲舒壓。', price: 500 },
  { id: 'scalp', name: '顱釋重負', description: '用鈦磁棒讓頭部放鬆一下。', price: 500 },
];

export const storedValue = [
  { amount: 3000, bonus: 200, months: 3 },
  { amount: 5000, bonus: 500, months: 6 },
  { amount: 8000, bonus: 1000, months: 12 },
];

const amountFormat = new Intl.NumberFormat('zh-TW');

export function money(amount) {
  return 'NT$ ' + amountFormat.format(amount);
}

export function sumPrices(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
