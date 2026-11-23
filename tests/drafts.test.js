import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDraftBackup, decodeDraftBackup, readDrafts, saveDrafts } from '../src/drafts.js';
import { encodeJsonToken } from '../src/url-token.js';

const studio = new URL('https://jakeuj.com/Nihe/studio/');
const drafts = {
  care: {
    treatment: 'hydrate',
    price: '',
    note: '  保濕 🌿\n回訪時再確認  ',
    extras: {
      cleanse: { checked: true, price: '450' },
      massage: { checked: false, price: '320' },
      relax: { checked: false, price: '500' },
      scalp: { checked: true, price: '' },
    },
  },
  promo: { title: '保濕養護', details: '', price: '0', until: '' },
};

test('the backup URL preserves both incomplete drafts, including custom disabled add-on prices', () => {
  const link = createDraftBackup(drafts, studio);
  assert.match(link, /\/Nihe\/studio\/#backup=[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeDraftBackup('  ' + link + '\n', studio), drafts);
});

test('a damaged, foreign or unsupported backup link is rejected before import', () => {
  const link = createDraftBackup(drafts, studio);
  assert.throws(() => decodeDraftBackup(link.slice(0, -10), studio), /不完整或格式錯誤/);
  assert.throws(() => decodeDraftBackup(link.replace('/studio/', '/card/'), studio), /店主工具/);
  assert.throws(() => decodeDraftBackup(link.replace('jakeuj.com', 'example.com'), studio), /店主工具/);
  const unknownVersion = studio.href + '#backup=' + encodeJsonToken({ v: 2, ...drafts });
  assert.throws(() => decodeDraftBackup(unknownVersion, studio), /版本/);

  const invalid = studio.href + '#backup=' + encodeJsonToken({
    v: 1,
    ...drafts,
    promo: { ...drafts.promo, until: '2026-02-30' },
  });
  assert.throws(() => decodeDraftBackup(invalid, studio), /截止日/);
});

function legacyStorage() {
  const entries = new Map(Object.entries({
    'nihe:studio:v1:care': JSON.stringify(drafts.care),
    'nihe:studio:v1:promo': JSON.stringify(drafts.promo),
  }));
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
}

test('legacy drafts load, and saving or importing one kind preserves the other kind', () => {
  const storage = legacyStorage();
  assert.deepEqual(readDrafts(storage), drafts);

  const updatedPromo = { ...drafts.promo, title: '新活動' };
  saveDrafts(storage, { promo: updatedPromo });
  assert.deepEqual(readDrafts(storage), { care: drafts.care, promo: updatedPromo });

  const updatedCare = { ...drafts.care, price: '1200' };
  saveDrafts(storage, { care: updatedCare });
  assert.deepEqual(readDrafts(storage), { care: updatedCare, promo: updatedPromo });
});

test('importing both drafts requires one write and leaves existing storage intact if it fails', () => {
  const storage = legacyStorage();
  const store = storage.setItem;
  let writes = 0;
  storage.setItem = () => {
    writes += 1;
    throw new Error('storage full');
  };
  const newDrafts = {
    care: { ...drafts.care, price: '1200' },
    promo: { ...drafts.promo, title: '新活動' },
  };
  assert.throws(() => saveDrafts(storage, newDrafts), /storage full/);
  assert.equal(writes, 1);
  assert.deepEqual(readDrafts(storage), drafts);

  storage.setItem = store;
  saveDrafts(storage, newDrafts);
  assert.deepEqual(readDrafts(storage), newDrafts);
});
