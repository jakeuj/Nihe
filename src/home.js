import './styles.css';
import { extras, homeUrl, money, storedValue, sumPrices, treatments } from './catalog.js';
import { copyWithStatus, element, shareOrCopy } from './ui.js';

const form = document.querySelector('#care-picker');
const lines = document.querySelector('#selection-lines');
const empty = document.querySelector('#selection-empty');
const total = document.querySelector('#selection-total');
const copyButton = document.querySelector('#copy-selection');
const selectionStatus = document.querySelector('#selection-status');
const shareButton = document.querySelector('#share-home');

function itemOption(item, isMain) {
  const label = element('label', isMain ? 'treatment-option' : 'extra-option');
  const input = element('input', 'choice-input');
  input.type = isMain ? 'radio' : 'checkbox';
  input.name = isMain ? 'treatment' : 'extra';
  input.value = item.id;

  const information = element('div', 'option-info');
  information.append(element('strong', 'option-name', item.name));
  information.append(element('span', 'option-description', item.description));

  const marker = element('span', 'choice-marker');
  marker.setAttribute('aria-hidden', 'true');
  const price = element('span', 'option-price', money(item.price));

  if (isMain) {
    const top = element('div', 'option-top');
    top.append(element('span', 'duration', item.minutes ? item.minutes + ' 分鐘' : '時間待確認'), marker);
    label.append(input, top, information, price);
  } else {
    label.append(input, marker, information, price);
  }
  return label;
}

function planItem(plan) {
  const row = element('li', 'plan');
  const deposit = element('div', 'plan-deposit');
  deposit.append(element('strong', '', '儲值 ' + money(plan.amount)), element('span', '', '使用期限 ' + plan.months + ' 個月'));
  const bonus = element('div', 'plan-bonus');
  bonus.append(element('strong', '', '贈送 ' + money(plan.bonus)), element('span', '', plan.tagline));
  row.append(deposit, bonus);
  return row;
}

function selectedItems() {
  const data = new FormData(form);
  const treatment = treatments.find(item => item.id === data.get('treatment'));
  if (!treatment) return [];

  const extraIds = data.getAll('extra');
  return [treatment, ...extras.filter(item => extraIds.includes(item.id))];
}

function renderSelection() {
  const items = selectedItems();
  const hasTreatment = items.length > 0;
  for (const input of form.querySelectorAll('input[name="extra"]')) {
    input.disabled = !hasTreatment;
  }
  lines.replaceChildren(...items.map(item => {
    const row = element('li');
    row.append(element('span', '', item.name), element('span', '', money(item.price)));
    return row;
  }));

  empty.hidden = hasTreatment;
  lines.hidden = !hasTreatment;
  copyButton.disabled = !hasTreatment;
  total.textContent = hasTreatment ? money(sumPrices(items)) : '—';
  selectionStatus.textContent = '';
}

document.querySelector('#treatment-options').append(...treatments.map(item => itemOption(item, true)));
document.querySelector('#extra-options').append(...extras.map(item => itemOption(item, false)));
document.querySelector('#stored-plans').append(...storedValue.map(planItem));
form.addEventListener('change', renderSelection);
form.addEventListener('submit', event => event.preventDefault());
copyButton.addEventListener('click', () => {
  const items = selectedItems();
  if (!items.length) return;

  const details = items.map(item => item.name + '　' + money(item.price));
  const text = ['Nihe｜我的護理搭配', ...details, '搭配金額　' + money(sumPrices(items)), homeUrl].join('\n');
  void copyWithStatus(text, selectionStatus, '已複製搭配摘要。');
});
shareButton.addEventListener('click', () => {
  void shareOrCopy({ title: 'Nihe｜客製化臉部養護', url: homeUrl }, document.querySelector('#share-status'));
});

renderSelection();
document.querySelector('[data-enhanced]').hidden = false;
shareButton.hidden = false;
