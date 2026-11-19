export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export async function copyWithStatus(text, status, confirmation) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = confirmation;
  } catch {
    const field = element('textarea', 'manual-copy');
    field.readOnly = true;
    field.value = text;
    field.setAttribute('aria-label', '可手動複製的內容');
    status.replaceChildren(element('span', '', '請選取並複製以下內容。'), field);
    field.focus();
    field.select();
  }
}

export async function shareOrCopy({ title, url }, status) {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  await copyWithStatus(url, status, '已複製分享連結。');
}
