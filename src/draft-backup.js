import { backupHashPrefix, createDraftBackup, decodeDraftBackup } from './drafts.js';
import { copyWithStatus } from './ui.js';

export function setupDraftBackup({ destination, getDrafts, restoreDrafts }) {
  const panel = document.querySelector('#draft-backup');
  const form = panel.querySelector('#draft-import');
  const input = form.querySelector('#backup-url');
  const confirmation = form.querySelector('#backup-confirm');
  const confirmButton = confirmation.querySelector('#confirm-backup');
  const overwrite = confirmation.querySelector('#backup-overwrite');
  const options = [...confirmation.querySelectorAll('[name="draft-type"]')];
  const copyStatus = panel.querySelector('#backup-copy-status');
  const importStatus = panel.querySelector('#backup-import-status');
  const labels = { care: '護理推薦卡', promo: '活動卡' };
  let pendingDrafts;

  function selectedTypes() {
    return options.filter(option => option.checked).map(option => option.value);
  }

  function updateConfirmation() {
    const names = selectedTypes().map(type => labels[type]);
    confirmButton.disabled = names.length === 0;
    overwrite.textContent = names.length
      ? '匯入會覆蓋此瀏覽器的「' + names.join('」與「') + '」草稿。'
      : '請至少選擇一種草稿。';
  }

  function resetConfirmation() {
    pendingDrafts = null;
    confirmation.hidden = true;
    importStatus.textContent = '';
  }

  function finishImport(message) {
    resetConfirmation();
    input.value = '';
    if (location.hash.startsWith(backupHashPrefix)) {
      history.replaceState(history.state, '', location.pathname + location.search);
    }
    importStatus.textContent = message;
  }

  function readBackup(focusChoices = false) {
    resetConfirmation();
    try {
      pendingDrafts = decodeDraftBackup(input.value, destination);
    } catch (error) {
      importStatus.textContent = error.message;
      return;
    }
    for (const option of options) option.checked = true;
    confirmation.hidden = false;
    updateConfirmation();
    if (focusChoices) options[0].focus();
  }

  function readLocation() {
    if (!location.hash.startsWith(backupHashPrefix)) return;
    panel.open = true;
    input.value = location.href;
    readBackup();
  }

  panel.querySelector('#export-drafts').addEventListener('click', () => {
    try {
      const url = createDraftBackup(getDrafts(), destination);
      void copyWithStatus(url, copyStatus, '已複製草稿備份連結。');
    } catch (error) {
      copyStatus.textContent = error.message;
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    readBackup(true);
  });
  input.addEventListener('input', resetConfirmation);
  confirmation.addEventListener('change', updateConfirmation);
  confirmButton.addEventListener('click', () => {
    const types = selectedTypes();
    if (!pendingDrafts || types.length === 0) return;

    try {
      restoreDrafts(Object.fromEntries(types.map(type => [type, pendingDrafts[type]])));
      finishImport('已匯入' + types.map(type => labels[type]).join('與') + '草稿，可以接著編輯。');
    } catch (error) {
      importStatus.textContent = error.message;
    }
  });
  confirmation.querySelector('#cancel-backup').addEventListener('click', () => finishImport('已取消匯入。'));
  window.addEventListener('hashchange', readLocation);
  readLocation();
}
