// File: src/utils/printToBottom.js

export function printToBottom(msg) {
  const id = 'ptb-debug-log';
  let div = document.getElementById(id);

  if (!div) {
    div = document.createElement('div');
    div.id = id;
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.maxHeight = '160px';
    div.style.overflowY = 'auto';
    div.style.background = '#fef9c3';
    div.style.borderTop = '1px solid #fde68a';
    div.style.color = '#92400e';
    div.style.fontSize = '0.85rem';
    div.style.fontFamily = 'monospace';
    div.style.padding = '0.25rem 1rem';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
  }

  const line = document.createElement('div');
  line.textContent = `🐛 ${msg}`;
  div.appendChild(line);
}