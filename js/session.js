// 1回分（15分）のレッスンを進める係。
// 順番：前回の復習 → 聞く解説 → 短い問題 → 打ってみる → 英語 → おしまい

(function () {
  const { h, toast, copyText, keepAwake } = UI;

  const STEP_NAMES = {
    review: '前回の復習',
    explain: '聞く解説',
    quiz: '短い問題',
    practice: '打ってみる',
    words: '英語',
    done: 'おしまい',
  };

  const ASK_HEAD = 'ここがわからないので、ほぼ初めての人向けにやさしく説明してください：';

  // ---- 読み上げ用に、コードの記号を読みやすい言葉に置きかえる ----
  const TAG_YOMI = {
    html: 'エイチティーエムエル', head: 'ヘッド', body: 'ボディ', title: 'タイトル',
    meta: 'メタ', h1: 'エイチワン', h2: 'エイチツー', h3: 'エイチスリー', p: 'ピー',
    a: 'エー', img: 'イメージ', ul: 'ユーエル', ol: 'オーエル', li: 'エルアイ',
    button: 'ボタン', br: 'ビーアール', div: 'ディブ', strong: 'ストロング',
  };
  const ATTR_YOMI = { href: 'エイチレフ', src: 'ソース', alt: 'オルト', lang: 'ラング', charset: 'キャラセット', type: 'タイプ' };

  function toSpeech(text) {
    return String(text)
      // 「head（ヘッド）」のように書いてあれば、カタカナのほうだけ読む
      .replace(/[\x21-\x7e]+(?: [\x21-\x7e]+)*（([゠-ヿ・ー\s]+)）/g, '$1')
      .replace(/<!doctype html>/gi, ' ドクタイプ宣言 ')
      .replace(/<\/(\w+)>/g, (_, t) => ` ${TAG_YOMI[t.toLowerCase()] || t}の閉じタグ `)
      .replace(/<(\w+)([^>]*)>/g, (_, t, rest) => {
        const attrs = (rest.match(/\b(\w+)=/g) || [])
          .map((a) => ATTR_YOMI[a.slice(0, -1).toLowerCase()] || a.slice(0, -1));
        const name = TAG_YOMI[t.toLowerCase()] || t;
        return attrs.length ? ` ${name}タグ（${attrs.join('、')}つき） ` : ` ${name}タグ `;
      })
      .replace(/```[\s\S]*?```/g, '');
  }

  function findLesson(id) {
    return window.LESSONS.find((l) => l.id === id);
  }

  function lessonLabel(l) {
    return `第${l.no}回 ${l.title}`;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 前に間違えたものから、古い順に3つまで
  function buildReviewItems() {
    const out = [];
    for (const m of Store.mistakes) {
      const l = findLesson(m.lessonId);
      if (!l) continue;
      if (m.kind === 'quiz') {
        const q = l.quiz[Number(m.key)];
        if (q) out.push({ kind: 'quiz', lesson: l, key: m.key, q });
      } else if (m.kind === 'word') {
        const w = l.words.find((x) => x.en === m.key);
        if (w) out.push({ kind: 'word', lesson: l, key: m.key, w });
      }
      if (out.length >= 3) break;
    }
    return out;
  }

  function wordQuestion(w) {
    const others = shuffle(
      window.LESSONS.flatMap((l) => l.words).filter((x) => x.ja !== w.ja).map((x) => x.ja),
    );
    const uniq = [...new Set(others)].slice(0, 3);
    const choices = shuffle([w.ja, ...uniq]);
    return {
      q: `「${w.en}」の意味は、どれでしょう？`,
      sayParts: [{ text: w.en, lang: 'en' }, { text: 'の意味は、どれでしょう？', lang: 'ja' }],
      choices,
      answer: choices.indexOf(w.ja),
      why: `${w.en} は「${w.ja}」という意味です。例文：${w.ex}`,
      whyParts: [
        { text: w.en, lang: 'en' }, { text: `は、${w.ja}、という意味です。`, lang: 'ja' },
        { text: w.ex, lang: 'en' },
      ],
    };
  }

  // ------------------------------------------------------------------
  class Session {
    constructor(lessonId, root) {
      this.lesson = findLesson(lessonId);
      this.root = root;
      this.handsFree = !!Store.settings.handsFree;
      this.reviewItems = buildReviewItems();
      this.steps = ['explain', 'quiz', 'practice', 'words', 'done'];
      if (this.reviewItems.length) this.steps.unshift('review');
      this.index = 0;
      this.current = null;
      this.finished = false;
    }

    start() {
      keepAwake(true);
      this.render();
    }

    stop() {
      Speech.stop();
      keepAwake(false);
    }

    get stepName() { return this.steps[this.index]; }

    next() {
      if (this.current && this.current.leave) this.current.leave();
      Speech.stop();
      if (this.index < this.steps.length - 1) {
        this.index++;
        this.render();
      }
    }

    // 聞くだけモードのとき、その場面の音声が終わったら次へ進む
    autoNext(gen) {
      if (this.handsFree && Speech.alive(gen)) {
        Speech.wait(800, gen).then((ok) => { if (ok) this.next(); });
      }
    }

    render() {
      Speech.stop();
      const name = this.stepName;
      const l = this.lesson;

      const dots = h('ol', { class: 'steps', 'aria-label': '今日の流れ' },
        this.steps.filter((s) => s !== 'done').map((s, i) => h('li', {
          class: i < this.index ? 'past' : i === this.index ? 'now' : '',
        }, STEP_NAMES[s])),
      );

      const body = h('section', { class: 'step-body' });
      const nextBtn = h('button', { class: 'btn btn-primary', onclick: () => this.onNextClick() }, '次へ →');
      const askBtn = h('button', { class: 'btn btn-ask', onclick: () => this.ask() }, '？ わからないを聞く');
      const bar = h('div', { class: 'bottom-bar' }, askBtn, nextBtn);
      this.nextBtn = nextBtn;

      const head = h('div', { class: 'session-head' },
        h('div', { class: 'session-title' },
          h('span', { class: 'lesson-no' }, `第${l.no}回`), ' ', l.title,
          this.handsFree ? h('span', { class: 'chip' }, '聞くだけモード') : null,
        ),
        name !== 'done' ? dots : null,
      );

      this.root.replaceChildren(h('div', { class: 'session' }, head, body, name !== 'done' ? bar : null));
      window.scrollTo(0, 0);

      const builder = {
        review: () => this.stepReview(body),
        explain: () => this.stepExplain(body),
        quiz: () => this.stepQuiz(body),
        practice: () => this.stepPractice(body),
        words: () => this.stepWords(body),
        done: () => this.stepDone(body),
      }[name];
      this.current = builder() || {};
      this.setNextLabel(this.current.nextLabel || (this.index === this.steps.length - 2 ? 'おわる ✓' : '次へ →'));
    }

    setNextLabel(text) {
      if (this.nextBtn) this.nextBtn.textContent = text;
    }

    onNextClick() {
      if (this.current && this.current.onNext && this.current.onNext() === false) return;
      this.next();
    }

    // ---- 「わからないを聞く」：いまの場面をまとめてコピー ----
    async ask() {
      const ctx = (this.current && this.current.ctx && this.current.ctx()) || [];
      const lines = [
        ASK_HEAD,
        '',
        `■ レッスン：${lessonLabel(this.lesson)}（HTMLの基礎）`,
        `■ 場面：${STEP_NAMES[this.stepName]}`,
        ...ctx,
        '',
        '（学習アプリ「まなびノート」から送っています。コードはほぼ初めてです。）',
      ];
      const text = lines.join('\n');
      const ok = await copyText(text);
      if (ok) toast('コピーしました。Claude や Gemini に貼りつけて聞いてみてください');
    }

    // ---- 共通：選ぶ問題 ----
    question(container, item, { onResult, gen, label }) {
      const handsFree = this.handsFree;
      let answered = false;
      let picked = -1;

      const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
      const buttons = item.choices.map((c, i) => h('button', {
        class: 'choice',
        onclick: () => pick(i),
      }, h('span', { class: 'choice-no' }, String(i + 1)), h('span', { class: 'choice-text' }, c)));

      container.append(
        label ? h('p', { class: 'muted' }, label) : null,
        h('p', { class: 'q-text' }, item.q),
        h('div', { class: 'choices' }, buttons),
        fb,
      );

      const sayWhy = async (g, correct) => {
        const ans = item.choices[item.answer];
        if (correct === true) {
          if (!(await Speech.say('正解です。', { gen: g }))) return false;
        } else if (correct === false) {
          if (!(await Speech.say(`おしいです。正しい答えは、${item.answer + 1}番、${toSpeech(ans)}、です。`, { gen: g }))) return false;
        } else {
          if (!(await Speech.say(`答えは、${item.answer + 1}番、${toSpeech(ans)}、です。`, { gen: g }))) return false;
        }
        if (item.whyParts) {
          for (const p of item.whyParts) {
            if (!(await Speech.say(p.lang === 'en' ? p.text : toSpeech(p.text), { lang: p.lang, gen: g }))) return false;
          }
          return true;
        }
        return Speech.say(toSpeech(item.why || ''), { gen: g });
      };

      const reveal = (correct) => {
        answered = true;
        buttons.forEach((b, i) => {
          b.disabled = true;
          if (i === item.answer) b.classList.add('right');
          else if (i === picked) b.classList.add('wrong');
        });
        fb.replaceChildren(
          h('p', { class: correct === false ? 'fb-title wrong-text' : 'fb-title right-text' },
            correct === true ? '◎ 正解です' : correct === false ? '△ おしい！' : `答えは ${item.answer + 1}番`),
          h('p', null, item.why || ''),
        );
      };

      const pick = async (i) => {
        if (answered) return;
        picked = i;
        const correct = i === item.answer;
        reveal(correct);
        onResult(correct, true);
        const g = Speech.begin();
        await sayWhy(g, correct);
      };

      // 問題を読み上げる（聞くだけモードなら、少し待って答えも読む）
      const read = async () => {
        if (item.sayParts) {
          for (const p of item.sayParts) {
            if (!(await Speech.say(p.lang === 'en' ? p.text : toSpeech(p.text), { lang: p.lang, gen }))) return false;
          }
        } else if (!(await Speech.say(toSpeech(item.say || item.q), { gen }))) return false;
        for (let i = 0; i < item.choices.length; i++) {
          if (answered) return true;
          if (!(await Speech.say(`${i + 1}番、${toSpeech(item.choices[i])}`, { gen }))) return false;
          await Speech.wait(250, gen);
        }
        if (handsFree && !answered) {
          await Speech.say('考えてみましょう。', { gen });
          if (!(await Speech.wait(5000, gen))) return false;
          if (answered) return true;
          reveal(null);
          onResult(null, false);
          return sayWhy(gen, null);
        }
        return true;
      };

      return {
        read,
        get answered() { return answered; },
        ctx() {
          const out = [
            `■ 問題：${item.q}`,
            `■ 選択肢：${item.choices.map((c, i) => `${i + 1}. ${c}`).join(' ／ ')}`,
          ];
          if (picked >= 0) out.push(`■ 選んだ答え：${picked + 1}. ${item.choices[picked]}`);
          else out.push('■ 選んだ答え：まだ選んでいません');
          if (answered) {
            out.push(`■ 正しい答え：${item.answer + 1}. ${item.choices[item.answer]}`);
            if (item.why) out.push(`■ アプリの解説：${item.why}`);
          }
          return out;
        },
      };
    }

    // ---- 1. 前回の復習 ----
    stepReview(body) {
      const items = this.reviewItems;
      let i = 0;
      let q = null;
      const area = h('div');
      body.append(
        h('h2', { class: 'step-h' }, '前回の復習'),
        h('p', { class: 'lead' }, `前に間違えたものを、${items.length}つだけ。もう一度やってみましょう。`),
        area,
      );

      const show = async () => {
        const it = items[i];
        area.replaceChildren();
        const item = it.kind === 'quiz' ? it.q : wordQuestion(it.w);
        const gen = Speech.begin();
        q = this.question(area, item, {
          gen,
          label: `${i + 1} / ${items.length}　（${lessonLabel(it.lesson)}${it.kind === 'word' ? 'の単語' : 'の問題'}）`,
          onResult: (correct, byTap) => {
            if (!byTap) return; // 聞くだけモードの自動回答は記録しない
            if (correct) Store.removeMistake(it.kind, it.lesson.id, it.key);
            else Store.addMistake(it.kind, it.lesson.id, it.key);
          },
        });
        this.setNextLabel(i < items.length - 1 ? '次の問題 →' : '次へ →');
        if (i === 0) await Speech.say('まずは、前回の復習です。', { gen });
        const ok = await q.read();
        if (ok && this.handsFree && Speech.alive(gen)) {
          await Speech.wait(1200, gen);
          if (Speech.alive(gen)) this.onNextClick();
        }
      };
      show();

      return {
        ctx: () => (q ? q.ctx() : []),
        onNext: () => {
          if (i < items.length - 1) {
            i++;
            show();
            return false;
          }
          return true;
        },
      };
    }

    // ---- 2. 聞く解説 ----
    stepExplain(body) {
      const segs = this.lesson.explain;
      let cur = 0;
      let playing = false;

      const items = segs.map((s, i) => h('li', {
        class: 'seg',
        onclick: () => play(i),
      },
      h('p', null, s.text),
      s.code ? h('pre', { class: 'code' }, h('code', null, s.code)) : null,
      ));
      const list = h('ol', { class: 'segs' }, items);

      const playBtn = h('button', { class: 'btn btn-play', onclick: () => (playing ? pause() : play(cur)) }, '▶ 聞く');
      const prevBtn = h('button', { class: 'btn btn-small', onclick: () => play(Math.max(0, cur - 1)), 'aria-label': '前の文' }, '⏮ 前');
      const nextBtn = h('button', { class: 'btn btn-small', onclick: () => play(Math.min(segs.length - 1, cur + 1)), 'aria-label': '次の文' }, '次 ⏭');
      const counter = h('span', { class: 'counter' });

      body.append(
        h('h2', { class: 'step-h' }, '聞く解説'),
        h('p', { class: 'lead' }, `今日のテーマ：${this.lesson.goal}`),
        h('div', { class: 'player' }, prevBtn, playBtn, nextBtn, counter),
        h('p', { class: 'muted small' }, '文をタップすると、そこから聞けます。'),
        list,
      );

      const mark = (i) => {
        cur = i;
        items.forEach((el, k) => el.classList.toggle('active', k === i));
        counter.textContent = `${i + 1} / ${segs.length}`;
        if (playing) items[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
      };

      const setPlaying = (p) => {
        playing = p;
        playBtn.textContent = p ? '⏸ 止める' : '▶ 聞く';
      };

      const play = async (from) => {
        const gen = Speech.begin();
        setPlaying(true);
        for (let i = from; i < segs.length; i++) {
          mark(i);
          const s = segs[i];
          if (!(await Speech.say(s.say || toSpeech(s.text), { gen }))) return;
          if (!(await Speech.wait(s.pause || 450, gen))) return;
        }
        setPlaying(false);
        if (Speech.alive(gen)) {
          await Speech.say('解説はここまでです。次は、短い問題です。', { gen });
          this.autoNext(gen);
        }
      };

      const pause = () => {
        Speech.stop();
        setPlaying(false);
      };

      mark(0);
      play(0);

      return {
        ctx: () => [`■ いま聞いていた説明：「${segs[cur].text}」`]
          .concat(segs[cur].code ? [`■ 説明のコード：\n${segs[cur].code}`] : []),
        leave: () => setPlaying(false),
      };
    }

    // ---- 3. 短い問題 ----
    stepQuiz(body) {
      const qs = this.lesson.quiz;
      let i = 0;
      let q = null;
      let right = 0;
      const area = h('div');
      body.append(h('h2', { class: 'step-h' }, '短い問題'), area);

      const show = async () => {
        area.replaceChildren();
        const gen = Speech.begin();
        q = this.question(area, qs[i], {
          gen,
          label: `${i + 1} / ${qs.length}`,
          onResult: (correct, byTap) => {
            if (!byTap) return;
            if (correct) right++;
            else Store.addMistake('quiz', this.lesson.id, i);
          },
        });
        this.setNextLabel(i < qs.length - 1 ? '次の問題 →' : '次へ →');
        if (i === 0) await Speech.say(`問題は${qs.length}問です。`, { gen });
        const ok = await q.read();
        if (ok && this.handsFree && Speech.alive(gen)) {
          await Speech.wait(1200, gen);
          if (Speech.alive(gen)) this.onNextClick();
        }
      };
      show();

      return {
        ctx: () => (q ? q.ctx() : []),
        onNext: () => {
          if (i < qs.length - 1) {
            i++;
            show();
            return false;
          }
          if (!this.handsFree) {
            toast(right > 0
              ? `${qs.length}問中 ${right}問 正解でした。間違えた問題は、次の回の復習に出ます`
              : '間違えた問題は、次の回の復習でもう一度出ます。だいじょうぶです');
          }
          return true;
        },
      };
    }

    // ---- 4. 打ってみる ----
    stepPractice(body) {
      const p = this.lesson.practice;
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
        const code = ta.value.toLowerCase().replace(/\s+/g, ' ');
        const misses = (p.checks || []).filter((c) => {
          if (c.re) return !new RegExp(c.re, 'i').test(ta.value);
          return !code.includes(c.has.toLowerCase());
        });
        if (misses.length === 0) {
          result.replaceChildren(h('p', { class: 'fb-title right-text' }, '◎ できました！'), h('p', null, p.done || '上の結果を見てみましょう。'));
          Speech.say('できました。すばらしいです。');
        } else {
          result.replaceChildren(
            h('p', { class: 'fb-title wrong-text' }, 'あと少しです'),
            h('ul', null, misses.map((m) => h('li', null, m.msg))),
          );
          Speech.say(`あと少しです。${toSpeech(misses[0].msg)}`);
        }
      };

      body.append(
        h('h2', { class: 'step-h' }, '打ってみる'),
        h('p', { class: 'task' }, p.task),
        h('details', { class: 'hint' }, h('summary', null, 'ヒントを見る'), h('p', null, p.hint)),
        h('div', { class: 'keys', 'aria-label': '記号を入れるボタン' }, keys),
        ta,
        h('div', { class: 'row' },
          h('button', { class: 'btn', onclick: check }, '✓ 確かめる'),
          h('button', {
            class: 'btn btn-ghost',
            onclick: () => { sample.hidden = !sample.hidden; },
          }, 'お手本'),
        ),
        sample,
        result,
        h('p', { class: 'muted small' }, '▼ 打った結果（打つとすぐ変わります）'),
        tab,
        frame,
      );
      update();

      (async () => {
        const gen = Speech.begin();
        if (!(await Speech.say(p.say || toSpeech(p.task), { gen }))) return;
        if (this.handsFree) {
          await Speech.say('打つ課題は、画面を見られるときに、やってみてください。次に進みます。', { gen });
          this.autoNext(gen);
        }
      })();

      return {
        ctx: () => [
          `■ 課題：${p.task}`,
          `■ 打ったコード：\n\`\`\`html\n${ta.value || '（まだ何も打っていません）'}\n\`\`\``,
        ],
      };
    }

    // ---- 5. 英語 ----
    stepWords(body) {
      const words = this.lesson.words;
      const marks = {}; // en → 'ok' | 'unsure'
      let cur = 0;
      let playing = false;

      const cards = words.map((w, i) => {
        const okBtn = h('button', { class: 'mark', onclick: (e) => { e.stopPropagation(); setMark(i, 'ok'); } }, '覚えた');
        const ngBtn = h('button', { class: 'mark', onclick: (e) => { e.stopPropagation(); setMark(i, 'unsure'); } }, 'あやしい');
        const card = h('li', { class: 'word', onclick: () => playOne(i) },
          h('div', { class: 'word-top' },
            h('span', { class: 'en', lang: 'en' }, w.en),
            h('span', { class: 'ja' }, w.ja),
          ),
          h('p', { class: 'ex', lang: 'en' }, w.ex),
          h('p', { class: 'ex-ja' }, w.exJa),
          w.note ? h('p', { class: 'muted small' }, w.note) : null,
          h('div', { class: 'marks' }, okBtn, ngBtn),
        );
        card._ok = okBtn;
        card._ng = ngBtn;
        return card;
      });

      const setMark = (i, v) => {
        marks[words[i].en] = v;
        cards[i]._ok.classList.toggle('on', v === 'ok');
        cards[i]._ng.classList.toggle('on', v === 'unsure');
      };

      const playBtn = h('button', { class: 'btn btn-play', onclick: () => (playing ? pause() : playAll(cur)) }, '▶ 全部聞く');

      body.append(
        h('h2', { class: 'step-h' }, '英語'),
        h('p', { class: 'lead' }, '単語 → 意味 → 例文 の順に読みます。カードをタップすると、その単語だけ聞けます。'),
        h('div', { class: 'player' }, playBtn),
        h('ol', { class: 'words' }, cards),
        h('p', { class: 'muted small' }, '「あやしい」にした単語は、次の回の復習に出てきます。'),
      );

      const setPlaying = (p) => {
        playing = p;
        playBtn.textContent = p ? '⏸ 止める' : '▶ 全部聞く';
      };

      const mark = (i) => {
        cur = i;
        cards.forEach((c, k) => c.classList.toggle('active', k === i));
        cards[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
      };

      const readWord = async (w, gen) => {
        if (!(await Speech.say(w.en, { lang: 'en', gen }))) return false;
        if (!(await Speech.wait(300, gen))) return false;
        if (!(await Speech.say(w.yomi ? `${w.yomi}。${w.ja}` : w.ja, { gen }))) return false;
        if (!(await Speech.wait(300, gen))) return false;
        if (!(await Speech.say(w.en, { lang: 'en', gen, rateScale: 0.85 }))) return false;
        if (!(await Speech.wait(400, gen))) return false;
        if (!(await Speech.say(w.ex, { lang: 'en', gen }))) return false;
        if (!(await Speech.wait(300, gen))) return false;
        if (!(await Speech.say(w.exJa, { gen }))) return false;
        return Speech.wait(700, gen);
      };

      const playOne = async (i) => {
        const gen = Speech.begin();
        setPlaying(false);
        mark(i);
        await readWord(words[i], gen);
      };

      const playAll = async (from) => {
        const gen = Speech.begin();
        setPlaying(true);
        if (from === 0) {
          if (!(await Speech.say(`今日の英単語は、${words.length}個です。`, { gen }))) return;
        }
        for (let i = from; i < words.length; i++) {
          mark(i);
          if (!(await readWord(words[i], gen))) return;
        }
        setPlaying(false);
        if (Speech.alive(gen)) {
          await Speech.say('英語はここまでです。', { gen });
          this.autoNext(gen);
        }
      };

      const pause = () => {
        Speech.stop();
        setPlaying(false);
      };

      playAll(0);

      return {
        ctx: () => {
          const w = words[cur];
          return [`■ 英単語：${w.en}（意味：${w.ja}）`, `■ 例文：${w.ex}（${w.exJa}）`];
        },
        leave: () => {
          for (const w of words) {
            if (marks[w.en] === 'unsure') Store.addMistake('word', this.lesson.id, w.en);
            if (marks[w.en] === 'ok') Store.removeMistake('word', this.lesson.id, w.en);
          }
        },
      };
    }

    // ---- 6. おしまい ----
    stepDone(body) {
      if (!this.finished) {
        this.finished = true;
        Store.markDone(this.lesson.id);
        Store.markStudied();
      }
      keepAwake(false);
      const streak = Store.streak();
      const total = Store.totalDays();
      const nextLesson = window.LESSONS.find((l) => l.no === this.lesson.no + 1);

      body.append(
        h('div', { class: 'done' },
          h('div', { class: 'done-mark', 'aria-hidden': 'true' }, '🌱'),
          h('h2', null, '今日の分は、おしまいです'),
          h('p', { class: 'lead' }, 'おつかれさまでした。15分、よくがんばりました。'),
          h('p', { class: 'stat' }, `${streak}日つづいています`),
          h('p', { class: 'muted' }, `これまでに学んだ日：${total}日`),
          h('div', { class: 'col' },
            h('a', { class: 'btn btn-primary', href: '#/' }, 'ホームへ'),
            nextLesson ? h('a', { class: 'btn', href: `#/lesson/${nextLesson.id}` }, `次の回へ：${nextLesson.title}`) : null,
          ),
        ),
      );
      Speech.say('今日の分は、おしまいです。おつかれさまでした。また明日、いっしょに学びましょう。');
      return {};
    }
  }

  window.Session = Session;
  window.SessionHelpers = { findLesson, lessonLabel, toSpeech };
})();
