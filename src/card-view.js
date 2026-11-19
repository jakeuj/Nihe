import { cardTitle, isExpired } from './cards.js';
import { money, sumPrices } from './catalog.js';
import { element } from './ui.js';

function renderCare(card) {
  const lines = element('ul', 'line-items card-lines');
  card.items.forEach((item, index) => {
    const row = element('li');
    const label = element('span');
    label.append(element('small', 'item-role', index === 0 ? '主護理' : '加購'));
    label.append(element('span', '', item.name));
    row.append(label, element('span', '', money(item.price)));
    lines.append(row);
  });

  const total = element('div', 'total');
  total.append(element('span', '', '搭配金額'), element('strong', '', money(sumPrices(card.items))));

  const content = [lines, total];
  if (card.note) content.push(element('p', 'card-details', card.note));
  return content;
}

function renderPromo(card) {
  const date = element('time', '', card.until);
  date.dateTime = card.until;
  const dateLine = element('p', 'card-until');
  dateLine.append('活動至 ', date, '（台灣時間）');

  const content = [];
  if (isExpired(card.until)) content.push(element('p', 'expiry-note', '活動已結束'));
  content.push(dateLine, element('p', 'card-details', card.details));
  if (card.price !== null) {
    const total = element('div', 'total');
    total.append(element('span', '', '優惠金額'), element('strong', '', money(card.price)));
    content.push(total);
  }
  return content;
}

export function renderCard(container, card, heading = 'h2') {
  const title = element(heading, 'card-title', cardTitle(card));
  const label = element('p', 'card-brand', 'Nihe · ' + (card.type === 'care' ? '護理推薦卡' : '活動卡'));
  const body = card.type === 'care' ? renderCare(card) : renderPromo(card);
  const note = element('p', 'card-note', '展示版 · 卡片內容由連結製作者提供');
  container.replaceChildren(label, title, ...body, note);
}
