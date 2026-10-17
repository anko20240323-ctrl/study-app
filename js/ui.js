// 画面づくりの小さな道具たち。

(function () {
  // h('div', { class: 'x', onclick: fn }, '文字', 子の要素...) で要素を作る
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k.startsWith('on') && typeof v === 'function') {
          el.addEventListener(k.slice(2), v);
        } else if (k === 'class') {
          el.className = v;
        } else if (k === 'html') {
          el.innerHTML = v;
        } else if (v === true) {
          el.setAttribute(k, '');
        } else {
          el.setAttribute(k, v);
        }
      }
    }
    for (const c of children.flat()) {
      if (c === undefined || c === null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  let toastTimer;
  function toast(msg, ms = 2600) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  // クリップボードにコピーする。うまくいかないときは、手でコピーできる箱を出す
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* 下の方法を試す */ }
    try {
      const ta = h('textarea', { readonly: true, style: 'position:fixed;top:0;left:0;opacity:0;' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      if (ok) return true;
    } catch (e) { /* 手でコピーしてもらう */ }
    showManualCopy(text);
    return false;
  }

  function showManualCopy(text) {
    const ta = h('textarea', { class: 'manual-copy', readonly: true, rows: 8 });
    ta.value = text;
    const box = h('div', { class: 'modal', role: 'dialog', 'aria-label': 'コピー用の文章' },
      h('div', { class: 'modal-card' },
        h('p', null, '自動でコピーできませんでした。下の文章を長押しして「すべて選択」→「コピー」してください。'),
        ta,
        h('button', { class: 'btn', onclick: () => box.remove() }, '閉じる'),
      ),
    );
    document.body.append(box);
    ta.focus();
    ta.select();
  }

  // 画面が勝手に消えないようにする（対応しているスマホだけ）
  let wakeLock = null;
  let wantWake = false;
  async function keepAwake(on) {
    wantWake = on;
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } else if (!on && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch (e) { /* 使えない環境では何もしない */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wantWake) keepAwake(true);
  });

  window.UI = { h, toast, copyText, keepAwake };
})();
