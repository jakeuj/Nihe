import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCardLink, decodeCard, isExpired, maxShareUrlBytes, shareMessage } from '../src/cards.js';
import { extras, sumPrices, treatments } from '../src/catalog.js';

const destination = 'https://jakeuj.com/jake-shop/card/';
const care = {
  v: 1,
  type: 'care',
  items: [
    { name: '水靚潤澤淨膚', price: 1200 },
    { name: '顱釋重負', price: 500 },
  ],
  note: '店主推薦，保濕＋舒壓 🌿',
};
const promo = {
  v: 1,
  type: 'promo',
  title: '保濕體驗',
  details: '適用於水靚潤澤淨膚。',
  price: null,
  until: '2028-02-29',
};

function linkToken(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

test('a recommendation preserves its original labels, prices and Traditional Chinese text', () => {
  const link = createCardLink(care, destination);
  assert.ok(link.startsWith(destination + '#'));
  assert.ok(link.length < maxShareUrlBytes);
  const restored = decodeCard(new URL(link).hash);
  assert.deepEqual(restored, care);
  assert.match(shareMessage(restored, link), /搭配金額 NT\$ 1,700/);
});

test('an activity card accepts leap-day expiration and zero promotional pricing', () => {
  assert.deepEqual(decodeCard(new URL(createCardLink(promo, destination)).hash), promo);
  const free = { ...promo, price: 0 };
  assert.match(shareMessage(free, destination), /優惠金額 NT\$ 0/);
  assert.throws(() => createCardLink({ ...promo, until: '2027-02-29' }, destination), /截止日/);
  assert.throws(() => createCardLink({ ...promo, title: '  ' }, destination), /活動資料/);
});

test('the cutoff is midnight after the last day in Taipei', () => {
  assert.equal(isExpired('2028-02-29', new Date('2028-02-29T15:59:59.999Z')), false);
  assert.equal(isExpired('2028-02-29', new Date('2028-02-29T16:00:00.000Z')), true);
});

test('corrupt or unknown fragments and invalid prices are rejected', () => {
  for (const hash of ['', '#broken!', '#////', '#1234', '#' + 'A'.repeat(1500), linkToken({ ...care, v: 2 })]) {
    assert.throws(() => decodeCard(hash));
  }
  for (const price of [-1, 9.5, '100', 100000]) {
    assert.throws(() => decodeCard(linkToken({ ...care, items: [{ name: '淨膚', price }] })), /護理價格/);
  }
});

test('all current add-ons fit in one QR and the link refuses excessive text', () => {
  const items = [treatments[1], ...extras].map(({ name, price }) => ({ name, price }));
  assert.equal(sumPrices(items), 3500);
  const fullCard = { ...care, items };
  assert.deepEqual(decodeCard(new URL(createCardLink(fullCard, destination)).hash), fullCard);
  assert.throws(() => createCardLink({ ...fullCard, items: items.map(item => ({ ...item, price: 99999 })), note: '舒'.repeat(100) }, destination), /太長/);
});
