import './styles.css';
import { renderCard } from './card-view.js';
import { cardTitle, decodeCard } from './cards.js';
import { element, shareOrCopy } from './ui.js';

const container = document.querySelector('#shared-card');
const shareButton = document.querySelector('#share-card');
const shareStatus = document.querySelector('#share-status');
let currentCard;

function readLink() {
  shareStatus.textContent = '';
  try {
    currentCard = decodeCard(location.hash);
    renderCard(container, currentCard, 'h1');
    document.title = cardTitle(currentCard) + '｜Nihe';
    shareButton.hidden = false;
  } catch {
    currentCard = null;
    document.title = '分享卡｜Nihe';
    shareButton.hidden = true;
    container.replaceChildren(
      element('h1', 'card-title', '無法開啟這張卡'),
      element('p', 'section-lede', '請向分享者確認完整連結，或回首頁查看所有護理。'),
    );
  }
}

shareButton.addEventListener('click', () => {
  if (!currentCard) return;
  void shareOrCopy({ title: cardTitle(currentCard) + '｜Nihe', url: location.href }, shareStatus);
});
window.addEventListener('hashchange', readLink);
readLink();
