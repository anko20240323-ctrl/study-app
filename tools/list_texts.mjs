// アプリが読み上げる文を、全部ひろい出して audio/texts.json に書く。
// 使い方：node tools/list_texts.mjs
// 鍵もネットもいりません。教材（lessons/*.js）を変えたら、もう一度動かしてください。
// そのあと tools/make_audio.py で、まだない文だけ音声ファイルを作ります。

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ブラウザのふりをして、教材と言葉づくりのファイルを読みこむ
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const run = (f) => vm.runInContext(read(f), ctx, { filename: f });
run('lessons/catalog.js');
for (const f of ctx.LESSON_FILES) run(f);
run('js/phrases.js');
const { toSpeech, audioKey, semitones } = ctx.Phrases;
const LESSONS = ctx.LESSONS;

const items = new Map();
function add(lessonId, lang, text, pitch = 1) {
  if (!text) return;
  const key = audioKey(lang, text, pitch);
  if (!items.has(key)) items.set(key, { key, lang: lang === 'en' ? 'en' : 'ja', semi: semitones(pitch), text, lessons: new Set() });
  items.get(key).lessons.add(lessonId);
}
const ja = (id, t) => add(id, 'ja', t);
const en = (id, t, pitch) => add(id, 'en', t, pitch);

// ---- どの回でも使う決まった文 ----
// js/session.js・js/app.js の Speech.say('…') に書いてある文は、自動でひろう
for (const f of ['js/session.js', 'js/app.js']) {
  const re = /Speech\.say\(\s*'((?:[^'\\]|\\.)*)'(\s*,\s*\{[^}]*lang:\s*'en')?/g;
  for (const m of read(f).matchAll(re)) {
    const text = m[1].replace(/\\(.)/g, '$1');
    if (m[2]) en('common', text);
    else ja('common', text);
  }
}
// 組み立てて読む文
const HEADS = ['おしいです。正しい答えは、', '答えは、'];
for (let n = 1; n <= 4; n++) {
  ja('common', `${n}番`);
  for (const head of HEADS) {
    ja('common', `${head}${n}番です。`);
    ja('common', `${head}${n}番。`);
  }
}
// （条件によって変わる文。Speech.say の中に直接書いていないもの）
for (const t of ['正解です。', 'もう一度、順番を変えて出します。', 'の意味は、どれでしょう？', 'おしいです。答えは、', 'おしい。', 'うまく聞き取れませんでした。']) ja('common', t);
en('common', "Hello! Let's learn together.");
const quizCounts = new Set(LESSONS.map((l) => l.quiz.length));
for (const n of quizCounts) ja('common', `問題は${n}問です。`);
for (const l of LESSONS) {
  const what = l.course === 'talk' ? 'フレーズ' : '英単語';
  ja('common', `今日の${what}は、${l.words.length}個です。`);
}

// ---- 回ごとの文 ----
const sayParts = (id, parts) => {
  for (const p of parts) {
    if (p.lang === 'en') en(id, p.text);
    else ja(id, toSpeech(p.text));
  }
};

for (const l of LESSONS) {
  const id = l.id;
  // 聞く解説・まとめ
  for (const s of l.explain || []) {
    ja(id, s.say || toSpeech(s.text));
    if (s.en) en(id, s.en);
  }
  // 会話
  for (const t of l.intro || []) ja(id, t);
  for (const d of l.dialogue || []) {
    en(id, d.en, d.who === 'B' ? 1.15 : 0.95);
    ja(id, d.ja);
  }
  // 短い問題
  for (const q of l.quiz || []) {
    if (q.sayParts) sayParts(id, q.sayParts);
    else ja(id, toSpeech(q.say || q.q));
    for (const c of q.choices) {
      if (q.choicesLang === 'en') en(id, c);
      else ja(id, toSpeech(c));
    }
    if (q.whyParts) sayParts(id, q.whyParts);
    else ja(id, toSpeech(q.why || ''));
  }
  // 打ってみる
  if (l.practice) {
    ja(id, l.practice.say || toSpeech(l.practice.task));
    for (const c of l.practice.checks || []) ja(id, toSpeech(c.msg));
  }
  // 語順パズル
  for (const o of l.order || []) {
    ja(id, o.ja);
    en(id, o.en);
  }
  // 英単語・フレーズ（思い出す練習・言ってみる練習・復習の問題も）
  for (const w of l.words || []) {
    en(id, w.en);
    ja(id, w.yomi ? `${w.yomi}。${w.ja}` : w.ja);
    ja(id, w.ja);
    en(id, w.ex);
    ja(id, w.exJa);
    if (w.en.includes('...')) en(id, w.ex);
    ja(id, `は、${w.ja}、という意味です。`);
  }
}

const list = [...items.values()]
  .map((x) => ({ ...x, lessons: [...x.lessons].sort() }))
  .sort((a, b) => a.key.localeCompare(b.key));
const chars = list.reduce((n, x) => n + [...x.text].length, 0);

const out = {
  note: 'tools/list_texts.mjs が作る一覧です。手で書きかえないでください。',
  count: list.length,
  chars,
  items: list,
};
fs.writeFileSync(path.join(ROOT, 'audio/texts.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`読み上げる文：${list.length}個、合計 ${chars.toLocaleString()} 文字`);
console.log(`  日本語 ${list.filter((x) => x.lang === 'ja').length}個 / 英語 ${list.filter((x) => x.lang === 'en').length}個`);
console.log('→ audio/texts.json に書きました');
