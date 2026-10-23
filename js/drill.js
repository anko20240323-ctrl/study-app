// 書く練習（✍）の画面。学んだ回のコードを、何度でも書いて練習します。
// 問題は、各回の「打ってみる」（practice）と、lessons/html-drills.js の問題です。

(function () {
  const { h, toast, copyText } = UI;

  const SET_SIZE = 5; // まぜて練習で出す問題の数

  function htmlLessons() {
    return window.LESSONS.filter((l) => l.course === 'html');
  }

  // その回の問題すべて（打ってみる＋書く練習）
  function tasksOf(l) {
    return [l.practice, ...(window.DRILLS[l.id] || [])].map((p) => ({ p, lesson: l }));
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- メニュー ----
  function menu(root) {
    const learned = htmlLessons().filter((l) => Store.doneCount(l.id) > 0);
    root.replaceChildren(
      h('h1', { class: 'page-h' }, '✍ 書く練習'),
      h('p', { class: 'lead' }, '頭でわかっても、書けないと身につきません。学んだ回のコードを、何度でも書いて練習しましょう。'),
      h('a', { class: 'btn btn-primary btn-big', href: '#/drill/mix' },
        h('span', { class: 'small' }, learned.length ? `終えた${learned.length}回の中から` : 'まだ終えた回がないので、全部の回から'),
        h('br'),
        `🔀 まぜて練習（${SET_SIZE}問）`,
      ),
      h('h2', { class: 'list-h' }, '回をえらんで練習'),
      h('ol', { class: 'lesson-list' },
        htmlLessons().map((l) => {
          const n = Store.drillCount(l.id);
          return h('li', null,
            h('a', { href: `#/drill/${l.id}`, class: n ? 'done' : '' },
              h('span', { class: 'lesson-no' }, `第${l.no}回`),
              h('span', { class: 'lesson-title' }, `${l.title}（${tasksOf(l).length}問）`),
              h('span', { class: 'lesson-count' }, n ? `✓ ${n}回` : ''),
            ),
          );
        }),
      ),
      h('p', { class: 'muted small' }, '「✓ ○回」は、その回の問題で「できました」になった回数です。'),
      h('a', { class: 'btn btn-ghost', href: '#/' }, '← ホームへ'),
    );
  }

  // ---- 練習する ----
  function run(root, key) {
    let tasks;
    let title;
    if (key === 'mix') {
      const learned = htmlLessons().filter((l) => Store.doneCount(l.id) > 0);
      const from = learned.length ? learned : htmlLessons();
      tasks = shuffle(from.flatMap(tasksOf)).slice(0, SET_SIZE);
      title = 'まぜて練習';
    } else {
      const l = htmlLessons().find((x) => x.id === key);
      if (!l) {
        location.hash = '#/drill';
        return;
      }
      tasks = tasksOf(l);
      title = `第${l.no}回 ${l.title}`;
    }

    let i = 0;
    let solvedCount = 0;

    const show = () => {
      const t = tasks[i];
      let solved = false;
      const editor = CodeEditor(t.p, {
        onResult: (ok) => {
          badge.className = `badge ${ok ? 'ok' : 'ng'}`;
          badge.textContent = ok ? '◎ 正解' : '△ まだ';
          nextBtn.textContent = last ? 'おわる ✓' : '次の問題 →';
          if (!ok) {
            Sound.wrong();
            return;
          }
          Sound.right();
          if (!solved) {
            solved = true;
            solvedCount++;
            Store.addDrill(t.lesson.id);
            Store.markStudied();
          }
        },
      });

      // まだ答え合わせをしていなければ、先に答え合わせをする（正解か分からないまま進まないように）
      const nextBtn = h('button', {
        class: 'btn btn-primary btn-big',
        onclick: () => {
          if (!editor.checked) {
            editor.check();
            return;
          }
          if (last) finish();
          else {
            i++;
            show();
          }
        },
      }, '答え合わせして次へ');

      const ask = async () => {
        const text = [
          'ここがわからないので、ほぼ初めての人向けにやさしく説明してください：',
          '',
          `■ レッスン：HTMLの基礎 第${t.lesson.no}回 ${t.lesson.title}`,
          '■ 場面：書く練習',
          ...editor.ctx(),
          '',
          '（学習アプリ「まなびノート」から送っています。コードはほぼ初めてです。）',
        ].join('\n');
        if (await copyText(text)) toast('コピーしました。Claude や Gemini に貼りつけて聞いてみてください');
      };

      const last = i === tasks.length - 1;
      const badge = h('span', { class: 'badge' }, '未回答');
      root.replaceChildren(
        h('div', { class: 'session-head' },
          h('div', { class: 'session-title' }, '✍ 書く練習　', h('span', { class: 'lesson-no' }, title)),
        ),
        h('p', { class: 'muted' }, badge, ' ', `${i + 1} / ${tasks.length}`,
          key === 'mix' ? `　（第${t.lesson.no}回 ${t.lesson.title}）` : ''),
        editor.el,
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-ghost', onclick: () => editor.reset() }, '↺ 書き直す'),
          h('button', { class: 'btn btn-ask', onclick: ask }, '？ わからないを聞く'),
        ),
        nextBtn,
      );
      window.scrollTo(0, 0);
    };

    const finish = () => {
      root.replaceChildren(
        h('div', { class: 'done' },
          h('div', { class: 'done-mark', 'aria-hidden': 'true' }, '✍'),
          h('h2', null, '書く練習、おつかれさまでした'),
          h('p', { class: 'stat' }, `${tasks.length}問のうち ${solvedCount}問 できました`),
          h('p', { class: 'muted' }, solvedCount === tasks.length
            ? '全部できました！何度も書くほど、手が覚えていきます。'
            : 'できなかった問題も、もう1回書けば大丈夫。くり返すほど身につきます。'),
          h('div', { class: 'col' },
            h('button', { class: 'btn btn-primary', onclick: () => run(root, key) }, '↻ もう1セット'),
            h('a', { class: 'btn', href: '#/drill' }, '書く練習のメニューへ'),
            h('a', { class: 'btn btn-ghost', href: '#/' }, 'ホームへ'),
          ),
        ),
      );
      window.scrollTo(0, 0);
    };

    show();
  }

  window.Drill = { menu, run, count: (l) => tasksOf(l).length };
})();
