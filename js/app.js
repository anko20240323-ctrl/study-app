// アプリの入り口。画面の切りかえ（ホーム・レッスン・設定）をします。

(function () {
  const { h, toast } = UI;
  const app = document.getElementById('app');
  let session = null;

  // ---- 教材のファイルを順番に読みこむ ----
  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.append(s);
    });
  }

  async function loadLessons() {
    for (const f of window.LESSON_FILES) await loadScript(f);
    window.LESSONS.sort((a, b) => a.no - b.no);
  }

  function nextLesson() {
    return window.LESSONS.find((l) => Store.doneCount(l.id) === 0) || window.LESSONS[0];
  }

  function handsFreeToggle() {
    const cb = h('input', {
      type: 'checkbox',
      checked: Store.settings.handsFree,
      onchange: (e) => Store.setSetting('handsFree', e.target.checked),
    });
    return h('label', { class: 'toggle' },
      cb,
      h('span', { class: 'toggle-ui', 'aria-hidden': 'true' }),
      h('span', null,
        h('strong', null, '聞くだけモード'),
        h('br'),
        h('span', { class: 'muted small' }, '画面を見なくても、声だけで最後まで進みます'),
      ),
    );
  }

  // ---- ホーム ----
  function renderHome() {
    const streak = Store.streak();
    const total = Store.totalDays();
    const reviewN = Store.mistakes.length;
    let greet;
    if (total === 0) greet = 'はじめまして。1回15分、いっしょに始めましょう。';
    else if (Store.isComingBack()) greet = 'おかえりなさい。また会えてうれしいです。今日はここから、ゆっくり再開しましょう。';
    else if (Store.studiedToday()) greet = '今日の分はもう終わっています。もう1回やっても、休んでも大丈夫です。';
    else greet = '今日も、15分だけ。いっしょに進めましょう。';

    const nl = nextLesson();

    app.replaceChildren(
      h('section', { class: 'card hello' },
        h('p', { class: 'greet' }, greet),
        h('div', { class: 'stats' },
          streak > 0 ? h('div', { class: 'stat-box' }, h('b', null, streak), '日つづいています') : null,
          h('div', { class: 'stat-box' }, h('b', null, total), '日 学びました'),
          h('div', { class: 'stat-box' }, h('b', null, reviewN), '個 復習待ち'),
        ),
      ),
      nl ? h('a', { class: 'btn btn-primary btn-big', href: `#/lesson/${nl.id}` },
        h('span', { class: 'small' }, Store.doneCount(nl.id) ? 'もう一度' : '次のレッスン'),
        h('br'),
        `▶ 第${nl.no}回 ${nl.title}`,
      ) : h('p', null, '教材が読みこめませんでした。'),
      h('section', { class: 'card' }, handsFreeToggle()),
      h('h2', { class: 'list-h' }, 'HTMLの基礎（全7回）'),
      h('ol', { class: 'lesson-list' },
        window.LESSONS.map((l) => {
          const n = Store.doneCount(l.id);
          return h('li', null,
            h('a', { href: `#/lesson/${l.id}`, class: n ? 'done' : '' },
              h('span', { class: 'lesson-no' }, `第${l.no}回`),
              h('span', { class: 'lesson-title' }, l.title),
              h('span', { class: 'lesson-count' }, n ? `✓ ${n}回` : ''),
            ),
          );
        }),
      ),
      h('p', { class: 'muted small center' }, 'CSS・JavaScript のレッスンは、これから増えます。'),
    );
  }

  // ---- レッスンの入口 ----
  function renderLessonIntro(id) {
    const l = SessionHelpers.findLesson(id);
    if (!l) {
      location.hash = '#/';
      return;
    }
    const reviewN = Math.min(3, Store.mistakes.length);
    app.replaceChildren(
      h('section', { class: 'card' },
        h('p', { class: 'lesson-no' }, `第${l.no}回`),
        h('h1', { class: 'intro-title' }, l.title),
        h('p', { class: 'lead' }, l.goal),
        h('ol', { class: 'plan' },
          reviewN ? h('li', null, `前回の復習（${reviewN}個）`) : null,
          h('li', null, `聞く解説（${l.explain.length}文）`),
          h('li', null, `短い問題（${l.quiz.length}問）`),
          h('li', null, '打ってみる（1つ）'),
          h('li', null, `英語（${l.words.length}語）`),
        ),
        h('p', { class: 'muted small' }, 'およそ15分です。画面はつけたままで聞いてください（画面を消すと、声が止まることがあります）。'),
      ),
      h('section', { class: 'card' }, handsFreeToggle()),
      h('button', {
        class: 'btn btn-primary btn-big',
        onclick: () => {
          session = new Session(l.id, app);
          session.start();
        },
      }, '▶ はじめる'),
      h('a', { class: 'btn btn-ghost', href: '#/' }, '← もどる'),
    );
  }

  // ---- 設定 ----
  function voiceSelect(lang) {
    const list = Speech.voicesFor(lang);
    const key = lang === 'en' ? 'enVoice' : 'jaVoice';
    const chosen = Speech.pickVoice(lang);
    const sel = h('select', {
      class: 'select',
      onchange: (e) => Store.setSetting(key, e.target.value),
    },
    h('option', { value: '' }, lang === 'en' ? 'おまかせ（英語の声を自動で選ぶ）' : 'おまかせ（女性の声を自動で選ぶ）'),
    list.map((v) => h('option', {
      value: v.voiceURI,
      selected: Store.settings[key] === v.voiceURI,
    }, `${v.name}${Speech.isFemaleGuess(v) ? '（女性の声）' : ''}`)),
    );
    return { sel, list, chosen };
  }

  function renderSettings() {
    Speech.loadVoices();
    const ja = voiceSelect('ja');
    const en = voiceSelect('en');

    const rateOut = h('output', { class: 'rate-out' }, `${Number(Store.settings.rate).toFixed(2)}倍`);
    const rate = h('input', {
      type: 'range', min: '0.8', max: '1.3', step: '0.05', value: String(Store.settings.rate),
      class: 'range', 'aria-label': '読む速さ',
      oninput: (e) => {
        Store.setSetting('rate', Number(e.target.value));
        rateOut.textContent = `${Number(e.target.value).toFixed(2)}倍`;
      },
    });

    const testJa = () => {
      const g = Speech.begin();
      Speech.say('こんにちは。クレアです。今日も、いっしょに学びましょう。', { gen: g });
    };
    const testEn = () => {
      const g = Speech.begin();
      Speech.say('Hello! Let\'s learn together.', { lang: 'en', gen: g });
    };

    const noVoice = !Speech.supported
      ? h('p', { class: 'warn' }, 'このブラウザは読み上げに対応していないようです。スマホの Chrome か Safari で開いてください。')
      : ja.list.length === 0
        ? h('p', { class: 'warn' }, '日本語の声が見つかりません。少し待ってから、この画面を開き直してください。それでも出ないときは、スマホの設定で「読み上げ（テキスト読み上げ）」の日本語の声を入れてください。')
        : null;

    app.replaceChildren(
      h('h1', { class: 'page-h' }, '設定'),
      h('section', { class: 'card' },
        h('h2', null, '日本語の声（解説）'),
        noVoice,
        ja.sel,
        h('button', { class: 'btn', onclick: testJa }, '▶ ためしに聞く'),
        h('p', { class: 'muted small' }, '「（女性の声）」は名前から判断した目安です。聞いてみて、好きな声を選んでください。'),
      ),
      h('section', { class: 'card' },
        h('h2', null, '英語の声（単語・例文）'),
        en.sel,
        h('button', { class: 'btn', onclick: testEn }, '▶ ためしに聞く'),
      ),
      h('section', { class: 'card' },
        h('h2', null, '読む速さ'),
        h('div', { class: 'rate-row' }, h('span', { class: 'small' }, 'ゆっくり'), rate, h('span', { class: 'small' }, 'はやい')),
        rateOut,
      ),
      h('section', { class: 'card' }, handsFreeToggle()),
      h('section', { class: 'card' },
        h('h2', null, '知っておいてほしいこと'),
        h('ul', { class: 'notes' },
          h('li', null, 'スマホの画面を消すと、読み上げが止まることが多いです。いまの版は「画面をつけたまま聞く」使い方を前提にしています（レッスン中は画面が自動で消えにくくしています）。'),
          h('li', null, '進み具合は、このスマホの中だけに保存しています。外には送っていません。'),
          h('li', null, 'ブラウザの「履歴やサイトのデータを消す」をすると、記録も消えます。'),
        ),
      ),
      h('section', { class: 'card' },
        h('h2', null, '記録を消す'),
        h('p', { class: 'muted small' }, '学んだ日・間違えた問題・設定を、全部最初にもどします。'),
        h('button', {
          class: 'btn btn-danger',
          onclick: () => {
            if (confirm('記録を全部消します。よろしいですか？')) {
              Store.resetAll();
              toast('記録を消しました');
              renderSettings();
            }
          },
        }, '記録を全部消す'),
      ),
    );
  }

  // 声の一覧はあとから届くことがあるので、届いたら設定画面を描き直す
  document.addEventListener('voices-ready', () => {
    if (location.hash.startsWith('#/settings')) renderSettings();
  });

  // ---- 画面の切りかえ ----
  function route() {
    if (session) {
      session.stop();
      session = null;
    }
    Speech.stop();
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/lesson\/([\w-]+)/);
    if (m) renderLessonIntro(m[1]);
    else if (hash.startsWith('#/settings')) renderSettings();
    else renderHome();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);

  loadLessons().then(route);

  // 電波がなくても開けるようにする係（service worker）を登録
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
