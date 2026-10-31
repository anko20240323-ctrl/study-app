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

  // ---- 部品ボタン：お手本を、タップで組み立てる部品に分ける ----
  // mode 'symbol'（記号ごと）: <  /  title  >  たつやのページ
  // mode 'tag'（タグごと）   : <title>  たつやのページ  </title>
  const VOID = new Set(['br', 'img', 'meta', 'hr', 'input', '!doctype']);
  const BLOCK = new Set(['html', 'head', 'body', 'ul', 'ol']);

  function tokenize(code, mode) {
    const out = [];
    for (const m of code.match(/<[^>]+>|[^<]+/g) || []) {
      if (!m.startsWith('<')) {
        const txt = m.trim();
        if (txt) out.push({ t: txt, kind: 'text' });
        continue;
      }
      if (mode === 'tag') {
        out.push({ t: m, kind: 'tag' });
        continue;
      }
      let rest = m.slice(1, -1);
      out.push({ t: '<', kind: 'sym' });
      if (rest.startsWith('/')) {
        out.push({ t: '/', kind: 'sym' });
        rest = rest.slice(1);
      }
      const name = rest.match(/^\S+/)[0];
      out.push({ t: name, kind: 'name' });
      for (const a of rest.slice(name.length).matchAll(/([^\s=]+)(?:\s*=\s*("[^"]*"))?/g)) {
        out.push({ t: a[1], kind: 'attr' });
        if (a[2]) {
          out.push({ t: '=', kind: 'sym' });
          out.push({ t: a[2], kind: 'val' });
        }
      }
      out.push({ t: '>', kind: 'sym' });
    }
    return out;
  }

  // 部品が多すぎるとき（20個より多い）は、前のほうの行を最初から入れておく
  const MAX_PARTS = 20;
  function splitForParts(sample, mode) {
    const lines = sample.split('\n');
    let k = lines.length;
    let count = 0;
    while (k > 0) {
      const n = tokenize(lines[k - 1], mode).length;
      if (count + n > MAX_PARTS && count > 0) break;
      count += n;
      k--;
    }
    const prefix = lines.slice(0, k).join('\n');
    return { prefix: prefix ? `${prefix}\n` : '', tokens: tokenize(lines.slice(k).join('\n'), mode) };
  }

  // 部品をつなぐ：属性の前には空白、閉じタグや大きな入れ物のタグのあとは改行
  function joinPart(value, tok) {
    if (tok.kind === 'attr') return `${value} ${tok.t}`;
    let v = value + tok.t;
    const tagEnd = (tok.kind === 'sym' && tok.t === '>') || tok.kind === 'tag';
    if (tagEnd) {
      const seg = v.slice(v.lastIndexOf('<'));
      const m = seg.match(/^<(\/?)([^\s>]+)/);
      if (m) {
        const name = m[2].toLowerCase();
        if (m[1] || VOID.has(name) || BLOCK.has(name)) v += '\n';
      }
    }
    return v;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // p: { task, hint, starter, sample, checks, done }
  // onResult(ok, misses): 「確かめる」を押したとき
  function CodeEditor(p, { onResult } = {}) {
    const ta = h('textarea', {
      class: 'editor', rows: 7, spellcheck: 'false', autocapitalize: 'off',
      autocomplete: 'off', autocorrect: 'off', 'aria-label': 'コードを打つ場所',
    });
    // 部品ボタンを使うか（設定：記号ごと／タグごと／使わない）
    const partsMode = (window.Store && Store.settings.parts) || 'symbol';
    const parts = partsMode === 'off' ? null : splitForParts(p.sample, partsMode);
    const startValue = parts ? parts.prefix : (p.starter || '');
    ta.value = startValue;
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

    let checked = false;
    // 答え合わせ：結果を、色のついた大きな箱で見せる（正解は緑、まだのときは赤）
    const check = () => {
      checked = true;
      const misses = findMisses(p, ta.value);
      const ok = misses.length === 0;
      result.className = `result-box ${ok ? 'ok' : 'ng'}`;
      if (ok) {
        result.replaceChildren(
          h('p', { class: 'result-head' }, '◎ 正解！できました'),
          h('p', null, p.done || '下の結果を見てみましょう。'),
        );
      } else {
        result.replaceChildren(
          h('p', { class: 'result-head' }, '△ まだです。ここを直しましょう'),
          h('ul', null, misses.map((m) => h('li', null, m.msg))),
          h('p', { class: 'small' }, '直したら、もう一度「答え合わせ」を押してください。'),
        );
      }
      result.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (onResult) onResult(ok, misses);
      return ok;
    };

    // 部品ボタン：順番をまぜて並べ、タップした順に打つ場所へ入れる
    const partsBox = h('div', { class: 'parts', 'aria-label': '部品のボタン' });
    let undo = [];
    let order = parts ? shuffle(parts.tokens.map((tok, i) => ({ ...tok, i }))) : [];
    let used = new Set();
    const drawParts = () => {
      if (!parts) return;
      partsBox.replaceChildren(...order.filter((x) => !used.has(x.i)).map((x) => h('button', {
        type: 'button',
        class: `part part-${x.kind}`,
        onclick: () => {
          undo.push({ i: x.i, value: ta.value });
          used.add(x.i);
          ta.value = joinPart(ta.value, x);
          drawParts();
          update();
        },
      }, x.t)));
      if (used.size === order.length) partsBox.append(h('span', { class: 'muted small' }, '部品をぜんぶ使いました。「答え合わせ」を押してください。'));
    };
    const undoBtn = h('button', {
      type: 'button',
      class: 'btn btn-small',
      onclick: () => {
        const last = undo.pop();
        if (!last) return;
        used.delete(last.i);
        ta.value = last.value;
        drawParts();
        update();
      },
    }, '↶ 1つもどす');
    drawParts();

    const reset = () => {
      undo = [];
      used = new Set();
      if (parts) order = shuffle(order);
      drawParts();
      ta.value = startValue;
      checked = false;
      result.className = 'feedback';
      result.replaceChildren();
      sample.hidden = true;
      update();
    };

    const el = h('div', { class: 'code-editor' },
      h('p', { class: 'task' }, p.task),
      h('details', { class: 'hint' }, h('summary', null, 'ヒントを見る'), h('p', null, p.hint)),
      parts ? h('div', { class: 'parts-wrap' },
        h('p', { class: 'muted small' }, parts.prefix
          ? '前のほうは入れてあります。続きを、部品をタップして順番に組み立てましょう。'
          : '部品をタップして、順番に組み立てましょう。キーボードで打ってもかまいません。'),
        partsBox,
        h('div', { class: 'row' }, undoBtn),
      ) : null,
      h('div', { class: 'keys', 'aria-label': '記号を入れるボタン' }, keys),
      ta,
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-primary btn-check', onclick: check }, '✓ 答え合わせ'),
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
      check,
      get checked() { return checked; },
      get value() { return ta.value; },
      // 「わからないを聞く」で使う
      ctx: () => [
        `■ 課題：${p.task}`,
        `■ 打ったコード：\n\`\`\`html\n${ta.value || '（まだ何も打っていません）'}\n\`\`\``,
      ],
    };
  }

  window.CodeEditor = CodeEditor;
  CodeEditor.parts = { tokenize, splitForParts, joinPart }; // 確かめるとき用
  window.findMisses = findMisses;
})();
