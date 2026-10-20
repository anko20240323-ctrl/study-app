// コードを打つ場所（打ってみる・書く練習で使う部品）。
// 課題の文・ヒント・記号ボタン・打つ場所・確かめるボタン・お手本・打った結果をまとめて作ります。

(function () {
  const { h } = UI;

  // 打ったコードが、課題の条件を満たしているか。満たしていない条件の一覧を返す
  function findMisses(p, value) {
    const code = value.toLowerCase().replace(/\s+/g, ' ');
    return (p.checks || []).filter((c) => {
      if (c.re) return !new RegExp(c.re, 'i').test(value);
      return !code.includes(c.has.toLowerCase());
    });
  }

  // p: { task, hint, starter, sample, checks, done }
  // onResult(ok, misses): 「確かめる」を押したとき
  function CodeEditor(p, { onResult } = {}) {
    const ta = h('textarea', {
      class: 'editor', rows: 7, spellcheck: 'false', autocapitalize: 'off',
      autocomplete: 'off', autocorrect: 'off', 'aria-label': 'コードを打つ場所',
    });
    ta.value = p.starter || '';
    const frame = h('iframe', { class: 'preview', sandbox: '', title: '打った結果' });
    const result = h('div', { class: 'feedback', 'aria-live': 'polite' });
    const sample = h('pre', { class: 'code sample', hidden: true }, h('code', null, p.sample));
    const tab = h('p', { class: 'tab-name', hidden: true });

    const update = () => {
      // title は画面に出ないので、「タブの名前」として見せる
      const t = ta.value.match(/<title>([\s\S]*?)<\/title>/i);
      tab.hidden = !t;
      if (t) tab.textContent = `📑 タブの名前：${t[1].trim()}`;
      frame.srcdoc = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><base target="_blank">
<style>body{font-family:sans-serif;font-size:18px;line-height:1.6;margin:12px;color:#222;word-break:break-word}img{max-width:100%}</style>
</head><body>${ta.value}</body></html>`;
    };
    let timer;
    ta.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(update, 250);
    });

    const insert = (s) => {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.setRangeText(s, start, end, 'end');
      ta.focus();
      update();
    };
    const keys = ['<', '>', '/', '"', '=', '<p>', '</p>'].map((k) => h('button', {
      class: 'key', type: 'button', onclick: () => insert(k),
    }, k));

    const check = () => {
      const misses = findMisses(p, ta.value);
      if (misses.length === 0) {
        result.replaceChildren(h('p', { class: 'fb-title right-text' }, '◎ できました！'), h('p', null, p.done || '上の結果を見てみましょう。'));
      } else {
        result.replaceChildren(
          h('p', { class: 'fb-title wrong-text' }, 'あと少しです'),
          h('ul', null, misses.map((m) => h('li', null, m.msg))),
        );
      }
      if (onResult) onResult(misses.length === 0, misses);
    };

    const reset = () => {
      ta.value = p.starter || '';
      result.replaceChildren();
      sample.hidden = true;
      update();
    };

    const el = h('div', { class: 'code-editor' },
      h('p', { class: 'task' }, p.task),
      h('details', { class: 'hint' }, h('summary', null, 'ヒントを見る'), h('p', null, p.hint)),
      h('div', { class: 'keys', 'aria-label': '記号を入れるボタン' }, keys),
      ta,
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: check }, '✓ 確かめる'),
        h('button', { class: 'btn btn-ghost', onclick: () => { sample.hidden = !sample.hidden; } }, 'お手本'),
      ),
      sample,
      result,
      h('p', { class: 'muted small' }, '▼ 打った結果（打つとすぐ変わります）'),
      tab,
      frame,
    );
    update();

    return {
      el,
      reset,
      get value() { return ta.value; },
      // 「わからないを聞く」で使う
      ctx: () => [
        `■ 課題：${p.task}`,
        `■ 打ったコード：\n\`\`\`html\n${ta.value || '（まだ何も打っていません）'}\n\`\`\``,
      ],
    };
  }

  window.CodeEditor = CodeEditor;
  window.findMisses = findMisses;
})();
