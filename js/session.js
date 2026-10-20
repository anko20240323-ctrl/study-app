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
    talk: '会話を聞く',
    recap: 'まとめ',
    order: '語順パズル',
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

  function courseTitle(l) {
    const c = (window.COURSES || []).find((x) => x.id === l.course);
    return c ? c.title : '';
  }

  function lessonLabel(l) {
    return `${courseTitle(l)} 第${l.no}回 ${l.title}`;
  }

  function isTalk(l) {
    return l.course === 'talk';
  }

  // 英語を学ぶコース（会話・語順）かどうか
  function isEnglish(l) {
    return l.course === 'talk' || l.course === 'grammar';
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 復習に出す数（前に間違えたものから、古い順に）
  const REVIEW_MAX = 5;

  // 前に間違えたものから、古い順に REVIEW_MAX 個まで
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
      if (out.length >= REVIEW_MAX) break;
    }
    return out;
  }

  function wordQuestion(w, course) {
    // まちがいの選択肢は、同じコースの単語から選ぶ
    const others = shuffle(
      window.LESSONS.filter((l) => l.course === course)
        .flatMap((l) => l.words).filter((x) => x.ja !== w.ja).map((x) => x.ja),
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
      this.voice = !!Store.settings.voice && Listen.supported;
      this.reviewItems = buildReviewItems();
      const STEPS = {
        talk: ['talk', 'quiz', 'words', 'done'],
        grammar: ['explain', 'quiz', 'order', 'words', 'recap', 'done'],
        html: ['explain', 'quiz', 'practice', 'words', 'recap', 'done'],
      };
      this.steps = STEPS[this.lesson.course] || STEPS.html;
      if (this.reviewItems.length) this.steps.unshift('review');
      this.index = 0;
      this.current = null;
      this.finished = false;
      this.paused = false;
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
      } else if (Speech.alive(gen)) {
        this.setIdle();
      }
    }

    // ---- 止める・続きから ----
    // 声を流し始めるときは、かならずこれを使う（止めるボタンの表示もそろえる）
    begin() {
      this.paused = false;
      this.updatePauseBtn();
      return Speech.begin();
    }

    // 読み終わって、何も流れていない状態
    setIdle() {
      this.paused = true;
      this.updatePauseBtn('▶', 'もう一度');
    }

    togglePause() {
      if (this.paused) {
        if (this.current && this.current.resume) this.current.resume();
      } else {
        Speech.stop();
        this.paused = true;
        this.updatePauseBtn();
      }
    }

    updatePauseBtn(icon, label) {
      if (!this.pauseBtn) return;
      const i = icon || (this.paused ? '▶' : '⏸');
      const t = label || (this.paused ? '続きから' : '止める');
      this.pauseBtn.replaceChildren(h('span', { class: 'pause-icon', 'aria-hidden': 'true' }, i), h('span', null, t));
      this.pauseBtn.setAttribute('aria-label', t);
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
      const askBtn = h('button', { class: 'btn btn-ask', onclick: () => this.ask() }, '？ わからない を聞く');
      const pauseBtn = h('button', { class: 'btn btn-pause', onclick: () => this.togglePause() });
      const bar = h('div', { class: 'bottom-bar' }, pauseBtn, askBtn, nextBtn);
      this.nextBtn = nextBtn;
      this.pauseBtn = pauseBtn;
      this.paused = false;
      this.updatePauseBtn();

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
        talk: () => this.stepTalk(body),
        recap: () => this.stepRecap(body),
        order: () => this.stepOrder(body),
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
        `■ レッスン：${lessonLabel(this.lesson)}`,
        `■ 場面：${STEP_NAMES[this.stepName]}`,
        ...ctx,
        '',
        isEnglish(this.lesson)
          ? '（学習アプリ「まなびノート」から送っています。英語は単語からやり直し中です。）'
          : '（学習アプリ「まなびノート」から送っています。コードはほぼ初めてです。）',
      ];
      const text = lines.join('\n');
      const ok = await copyText(text);
      if (ok) toast('コピーしました。Claude や Gemini に貼りつけて聞いてみてください');
    }

    // ---- 共通：選ぶ問題 ----
    question(container, item, { onResult, label, onAuto }) {
      const handsFree = this.handsFree;
      let answered = false;
      let picked = -1;
      let lastResult;

      const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
      const buttons = item.choices.map((c, i) => h('button', {
        class: 'choice',
        onclick: () => pick(i),
      }, h('span', { class: 'choice-no' }, String(i + 1)), h('span', { class: 'choice-text' }, c)));

      container.append(
        label ? h('p', { class: 'muted' }, label) : null,
        h('p', { class: 'q-text', onclick: () => replay(), title: 'タップすると、もう一度読みます' }, item.q),
        h('div', { class: 'choices' }, buttons),
        fb,
      );

      // 選択肢が英語のときは、英語の声で読む
      const enChoices = item.choicesLang === 'en';
      const sayChoice = async (i, g) => {
        if (!enChoices) return Speech.say(`${i + 1}番、${toSpeech(item.choices[i])}`, { gen: g });
        if (!(await Speech.say(`${i + 1}番`, { gen: g }))) return false;
        return Speech.say(item.choices[i], { lang: 'en', gen: g });
      };

      const sayWhy = async (g, correct) => {
        const ans = item.choices[item.answer];
        const head = correct === true ? '正解です。'
          : correct === false ? 'おしいです。正しい答えは、' : '答えは、';
        if (correct === true) {
          if (!(await Speech.say(head, { gen: g }))) return false;
        } else if (enChoices) {
          if (!(await Speech.say(`${head}${item.answer + 1}番です。`, { gen: g }))) return false;
          if (!(await Speech.say(ans, { lang: 'en', gen: g }))) return false;
        } else if (!(await Speech.say(`${head}${item.answer + 1}番、${toSpeech(ans)}、です。`, { gen: g }))) return false;
        if (item.whyParts) {
          // 答えを英語で読んだすぐあとに、同じ英語をくり返さない
          const parts = enChoices && correct !== true && item.whyParts[0] && item.whyParts[0].text === ans
            ? item.whyParts.slice(1) : item.whyParts;
          for (const p of parts) {
            if (!(await Speech.say(p.lang === 'en' ? p.text : toSpeech(p.text), { lang: p.lang, gen: g }))) return false;
          }
          return true;
        }
        return Speech.say(toSpeech(item.why || ''), { gen: g });
      };

      const reveal = (correct) => {
        answered = true;
        lastResult = correct;
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

      // 答えを選んだとき。タップなら新しく読み始め、声で答えたときは同じ流れのまま続ける
      const answer = async (i, g) => {
        picked = i;
        const correct = i === item.answer;
        reveal(correct);
        onResult(correct, true);
        if (correct) await Sound.right(); else await Sound.wrong();
        return sayWhy(g, correct);
      };
      const pick = async (i) => {
        if (answered) return;
        if (await answer(i, this.begin())) this.setIdle();
      };

      // 問題を読み上げる（聞くだけモードなら、少し待って答えも読む）
      const read = async (gen) => {
        if (item.sayParts) {
          for (const p of item.sayParts) {
            if (!(await Speech.say(p.lang === 'en' ? p.text : toSpeech(p.text), { lang: p.lang, gen }))) return false;
          }
        } else if (!(await Speech.say(toSpeech(item.say || item.q), { gen }))) return false;
        for (let i = 0; i < item.choices.length; i++) {
          if (answered) return true;
          if (!(await sayChoice(i, gen))) return false;
          await Speech.wait(250, gen);
        }
        // 声で答える（設定がオンのとき）
        if (this.voice && !answered) {
          if (!(await Speech.say('番号で答えてください。', { gen }))) return false;
          await Sound.cue();
          const heard = await Listen.hear({ lang: 'ja', ms: 5000, gen });
          if (!Speech.alive(gen)) return false;
          if (answered) return true;
          const n = Listen.number(heard, item.choices.length);
          if (n >= 0) return answer(n, gen);
          if (!(await Speech.say('うまく聞き取れませんでした。', { gen }))) return false;
          if (handsFree) {
            reveal(null);
            onResult(null, false);
            return sayWhy(gen, null);
          }
          return true;
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

      // 問題を読んで、聞くだけモードなら次へ。止めたあとの「続きから」や、問題文のタップでも使う
      const run = async () => {
        const gen = this.begin();
        const ok = answered ? await sayWhy(gen, lastResult) : await read(gen);
        if (!ok || !Speech.alive(gen)) return;
        if (handsFree && answered) {
          await Speech.wait(1200, gen);
          if (Speech.alive(gen) && onAuto) onAuto();
        } else if (!handsFree || !answered) {
          this.setIdle();
        }
      };
      const replay = () => run();


      return {
        read,
        run,
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
        const item = it.kind === 'quiz' ? it.q : wordQuestion(it.w, it.lesson.course);
        q = this.question(area, item, {
          onAuto: () => this.onNextClick(),
          label: `${i + 1} / ${items.length}　（${lessonLabel(it.lesson)}${it.kind === 'word' ? 'の単語' : 'の問題'}）`,
          onResult: (correct, byTap) => {
            if (!byTap) return; // 聞くだけモードの自動回答は記録しない
            if (correct) Store.removeMistake(it.kind, it.lesson.id, it.key);
            else Store.addMistake(it.kind, it.lesson.id, it.key);
          },
        });
        this.setNextLabel(i < items.length - 1 ? '次の問題 →' : '次へ →');
        if (i === 0) {
          const gen = this.begin();
          if (!(await Speech.say('まずは、前回の復習です。', { gen }))) return;
        }
        q.run();
      };
      show();

      return {
        ctx: () => (q ? q.ctx() : []),
        resume: () => q && q.run(),
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
      let ended = false;

      const items = segs.map((s, i) => h('li', {
        class: 'seg',
        onclick: () => play(i),
      },
      h('p', null, s.text),
      s.en ? h('p', { class: 'seg-en', lang: 'en' }, s.en) : null,
      s.code ? h('pre', { class: 'code' }, h('code', null, s.code)) : null,
      ));
      const list = h('ol', { class: 'segs' }, items);

      const prevBtn = h('button', { class: 'btn btn-small', onclick: () => play(Math.max(0, cur - 1)), 'aria-label': '前の文' }, '⏮ 前の文');
      const againBtn = h('button', { class: 'btn btn-small', onclick: () => play(cur), 'aria-label': 'この文をもう一度' }, '↻ もう一度');
      const nextBtn = h('button', { class: 'btn btn-small', onclick: () => play(Math.min(segs.length - 1, cur + 1)), 'aria-label': '次の文' }, '次の文 ⏭');
      const counter = h('span', { class: 'counter' });

      body.append(
        h('h2', { class: 'step-h' }, '聞く解説'),
        h('p', { class: 'lead' }, `今日のテーマ：${this.lesson.goal}`),
        h('div', { class: 'player' }, prevBtn, againBtn, nextBtn),
        h('p', { class: 'muted small' }, '文をタップすると、そこから聞き直せます。　', counter),
        list,
      );

      const mark = (i) => {
        cur = i;
        items.forEach((el, k) => el.classList.toggle('active', k === i));
        counter.textContent = `（${i + 1} / ${segs.length}）`;
        items[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
      };

      const play = async (from) => {
        const gen = this.begin();
        ended = false;
        for (let i = from; i < segs.length; i++) {
          mark(i);
          const s = segs[i];
          if (!(await Speech.say(s.say || toSpeech(s.text), { gen }))) return;
          if (s.en) {
            if (!(await Speech.wait(300, gen))) return;
            if (!(await Speech.say(s.en, { lang: 'en', gen }))) return;
          }
          if (!(await Speech.wait(s.pause || 450, gen))) return;
        }
        ended = true;
        if (Speech.alive(gen)) {
          if (!(await Speech.say('解説はここまでです。次は、短い問題です。', { gen }))) return;
          this.autoNext(gen);
        }
      };

      mark(0);
      play(0);

      return {
        ctx: () => [`■ いま聞いていた説明：「${segs[cur].text}」`]
          .concat(segs[cur].code ? [`■ 説明のコード：\n${segs[cur].code}`] : []),
        resume: () => play(ended ? 0 : cur),
      };
    }

    // ---- 3. 短い問題 ----
    // 1周目のあと、順番を変えてもう1周（くり返して覚える）。記録するのは1周目の答えだけ
    stepQuiz(body) {
      const qs = this.lesson.quiz;
      const n = qs.length;
      const order = [...qs.keys(), ...shuffle([...qs.keys()])];
      let i = 0;
      let q = null;
      let right = 0;
      const area = h('div');
      body.append(h('h2', { class: 'step-h' }, '短い問題'), area);

      const show = async () => {
        area.replaceChildren();
        const idx = order[i];
        const round = i < n ? 1 : 2;
        q = this.question(area, qs[idx], {
          onAuto: () => this.onNextClick(),
          label: round === 1 ? `1周目　${i + 1} / ${n}` : `2周目（順番を変えて）　${i - n + 1} / ${n}`,
          onResult: (correct, byTap) => {
            if (!byTap || round !== 1) return;
            if (correct) right++;
            else Store.addMistake('quiz', this.lesson.id, idx);
          },
        });
        this.setNextLabel(i < order.length - 1 ? '次の問題 →' : '次へ →');
        if (i === 0 || i === n) {
          const gen = this.begin();
          const intro = i === 0 ? `問題は${n}問です。` : 'もう一度、順番を変えて出します。';
          if (!(await Speech.say(intro, { gen }))) return;
        }
        q.run();
      };
      show();

      return {
        ctx: () => (q ? q.ctx() : []),
        resume: () => q && q.run(),
        onNext: () => {
          if (i < order.length - 1) {
            i++;
            show();
            return false;
          }
          if (!this.handsFree) {
            toast(right > 0
              ? `1周目は ${n}問中 ${right}問 正解でした。間違えた問題は、次の回の復習に出ます`
              : '間違えた問題は、次の回の復習でもう一度出ます。だいじょうぶです');
          }
          return true;
        },
      };
    }

    // ---- 会話を聞く（日常会話のレッスン） ----
    // 1セリフずつ「英語 → 日本語の意味 → もう一度英語」。最後に英語だけで通して聞く
    stepTalk(body) {
      const l = this.lesson;
      const lines = l.dialogue;
      let cur = 0;
      let ended = false;

      const items = lines.map((ln, i) => h('li', {
        class: `line line-${ln.who}`,
        onclick: () => play(i),
      },
      h('span', { class: 'who' }, l.roles[ln.who] || ln.who),
      h('p', { class: 'line-en', lang: 'en' }, ln.en),
      h('p', { class: 'line-ja' }, ln.ja),
      ));

      const prevBtn = h('button', { class: 'btn btn-small', onclick: () => play(Math.max(0, cur - 1)), 'aria-label': '前のセリフ' }, '⏮ 前');
      const againBtn = h('button', { class: 'btn btn-small', onclick: () => play(cur), 'aria-label': 'このセリフをもう一度' }, '↻ もう一度');
      const nextBtn = h('button', { class: 'btn btn-small', onclick: () => play(Math.min(lines.length - 1, cur + 1)), 'aria-label': '次のセリフ' }, '次 ⏭');
      const counter = h('span', { class: 'counter' });

      body.append(
        h('h2', { class: 'step-h' }, '会話を聞く'),
        h('p', { class: 'lead' }, `場面：${l.goal}`),
        h('div', { class: 'player' }, prevBtn, againBtn, nextBtn),
        h('p', { class: 'muted small' }, '英語 → 日本語の意味 → もう一度英語 の順に読みます。セリフをタップすると、そこから聞き直せます。　', counter),
        h('ol', { class: 'lines' }, items),
      );

      const mark = (i) => {
        cur = i;
        items.forEach((el, k) => el.classList.toggle('active', k === i));
        counter.textContent = `（${i + 1} / ${lines.length}）`;
        items[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
      };

      // 2人の声を聞き分けやすいように、声の高さを少し変える
      const pitchOf = (who) => (who === 'B' ? 1.15 : 0.95);

      const readLine = async (ln, gen) => {
        const en = { lang: 'en', gen, pitch: pitchOf(ln.who) };
        if (!(await Speech.say(ln.en, en))) return false;
        if (!(await Speech.wait(400, gen))) return false;
        if (!(await Speech.say(ln.ja, { gen }))) return false;
        if (!(await Speech.wait(400, gen))) return false;
        if (!(await Speech.say(ln.en, en))) return false;
        return Speech.wait(800, gen);
      };

      const play = async (from) => {
        const gen = this.begin();
        ended = false;
        if (from === 0) {
          for (const t of l.intro || []) {
            if (!(await Speech.say(t, { gen }))) return;
            if (!(await Speech.wait(300, gen))) return;
          }
        }
        for (let i = from; i < lines.length; i++) {
          mark(i);
          if (!(await readLine(lines[i], gen))) return;
        }
        if (!(await Speech.say('最後に、英語だけで、通して聞いてみましょう。', { gen }))) return;
        for (let i = 0; i < lines.length; i++) {
          mark(i);
          if (!(await Speech.say(lines[i].en, { lang: 'en', gen, pitch: pitchOf(lines[i].who) }))) return;
          if (!(await Speech.wait(500, gen))) return;
        }
        ended = true;
        if (!(await Speech.say('会話はここまでです。次は、短い問題です。', { gen }))) return;
        this.autoNext(gen);
      };

      mark(0);
      play(0);

      return {
        ctx: () => {
          const ln = lines[cur];
          return [`■ いま聞いていたセリフ：${l.roles[ln.who] || ln.who}「${ln.en}」（${ln.ja}）`];
        },
        resume: () => play(ended ? 0 : cur),
      };
    }

    // ---- 4. 打ってみる ----
    stepPractice(body) {
      const p = this.lesson.practice;
      const editor = CodeEditor(p, {
        onResult: async (ok, misses) => {
          const gen = this.begin();
          if (ok) await Sound.right();
          const said = await Speech.say(ok ? 'できました。すばらしいです。' : `あと少しです。${toSpeech(misses[0].msg)}`, { gen });
          if (said) this.setIdle();
        },
      });
      body.append(
        h('h2', { class: 'step-h' }, '打ってみる'),
        editor.el,
        h('p', { class: 'muted small' }, 'もっと書いて覚えたいときは、ホームの「✍ 書く練習」で、この回の問題を何度でも練習できます。'),
      );

      const readTask = async () => {
        const gen = this.begin();
        if (!(await Speech.say(p.say || toSpeech(p.task), { gen }))) return;
        if (this.handsFree) {
          if (!(await Speech.say('打つ課題は、画面を見られるときに、やってみてください。次に進みます。', { gen }))) return;
        }
        this.autoNext(gen);
      };
      readTask();

      return {
        resume: readTask,
        ctx: editor.ctx,
      };
    }

    // ---- 5. 英語 ----
    stepWords(body) {
      const words = this.lesson.words;
      const marks = {}; // en → 'ok' | 'unsure'
      let cur = 0;
      let ended = false;

      const results = [];
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
          (results[i] = h('div', { class: 'say-result', hidden: true })),
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

      body.append(
        h('h2', { class: 'step-h' }, '英語'),
        h('p', { class: 'lead' }, isTalk(this.lesson)
          ? 'フレーズ → 意味 → 使い方の例 の順に読みます。カードをタップすると、そのフレーズをもう一度聞けます。'
          : '単語 → 意味 → 例文 の順に読みます。カードをタップすると、その単語をもう一度聞けます。'),
        h('ol', { class: 'words' }, cards),
        h('p', { class: 'muted small' }, '「あやしい」にしたものは、次の回の復習に出てきます。'),
      );

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
        const gen = this.begin();
        mark(i);
        if (await readWord(words[i], gen)) this.setIdle();
      };

      // 2周目：英語を聞いて、意味を思い出す練習（少し間をあけてから答えを読む）
      const recallWord = async (w, gen) => {
        if (!(await Speech.say(w.en, { lang: 'en', gen }))) return false;
        if (!(await Speech.wait(3000, gen))) return false;
        if (!(await Speech.say(w.ja, { gen }))) return false;
        if (!(await Speech.say(w.en, { lang: 'en', gen }))) return false;
        return Speech.wait(900, gen);
      };

      // 3周目（声で練習する がオンのとき）：言ってみて、伝わったかを確かめる
      const target = (w) => (w.en.includes('...') ? w.ex : w.en);
      const showResult = (i, res) => {
        const box = results[i];
        box.hidden = false;
        box.replaceChildren(
          h('span', { class: 'small muted' }, res.score >= 0.8 ? '◎ 伝わりました：' : '△ こう聞こえました：'),
          ' ',
          h('span', { lang: 'en' }, res.heard || '（聞き取れませんでした）'),
          h('br'),
          h('span', { class: 'small muted' }, 'お手本：'),
          ' ',
          ...res.words.map((wd, k) => h('span', { class: res.ok[k] ? 'w-ok' : 'w-ng', lang: 'en' }, `${wd} `)),
        );
      };
      const speakWord = async (w, i, gen) => {
        const t = target(w);
        for (let tryNo = 1; tryNo <= 2; tryNo++) {
          if (!(await Speech.say(t, { lang: 'en', gen }))) return false;
          await Sound.cue();
          const heard = await Listen.hear({ lang: 'en', ms: 6000, gen });
          if (!Speech.alive(gen)) return false;
          const res = Listen.best(t, heard);
          showResult(i, res);
          if (res.score >= 0.8) {
            await Sound.right();
            return Speech.say('ばっちり伝わりました。', { gen });
          }
          if (!heard.length) {
            if (!(await Speech.say('うまく聞き取れませんでした。', { gen }))) return false;
          } else {
            if (!(await Speech.say('こう聞こえました。', { gen }))) return false;
            if (!(await Speech.say(res.heard, { lang: 'en', gen }))) return false;
          }
          if (tryNo === 1 && !(await Speech.say('もう一度、お手本のあとに言ってみましょう。', { gen }))) return false;
        }
        return Speech.say('だいじょうぶ。次にいきましょう。', { gen });
      };

      let pass = 1;
      const playAll = async (from, startPass = 1) => {
        const gen = this.begin();
        ended = false;
        pass = startPass;
        if (pass === 1) {
          if (from === 0) {
            const what = isTalk(this.lesson) ? 'フレーズ' : '英単語';
            if (!(await Speech.say(`今日の${what}は、${words.length}個です。`, { gen }))) return;
          }
          for (let i = from; i < words.length; i++) {
            mark(i);
            if (!(await readWord(words[i], gen))) return;
          }
          pass = 2;
          from = 0;
        }
        if (pass === 2 && from === 0) {
          if (!(await Speech.say('次は、思い出す練習です。英語を聞いて、意味を思い出してみましょう。', { gen }))) return;
        }
        if (pass === 2) {
          for (let i = from; i < words.length; i++) {
            mark(i);
            if (!(await recallWord(words[i], gen))) return;
          }
          pass = 3;
          from = 0;
        }
        if (this.voice) {
          if (from === 0) {
            if (!(await Speech.say('最後に、言ってみる練習です。お手本のあと、合図の音が鳴ったら、続けて言ってみましょう。', { gen }))) return;
          }
          for (let i = from; i < words.length; i++) {
            mark(i);
            if (!(await speakWord(words[i], i, gen))) return;
            if (!(await Speech.wait(500, gen))) return;
          }
        }
        ended = true;
        if (Speech.alive(gen)) {
          if (!(await Speech.say('英語はここまでです。', { gen }))) return;
          this.autoNext(gen);
        }
      };

      playAll(0);

      return {
        resume: () => (ended ? playAll(0, 1) : playAll(cur, pass)),
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

    // ---- 語順パズル（英語の語順のレッスン） ----
    // 日本語を聞いて、英語の順番で言ってみる。画面では、単語をタップして並べる
    stepOrder(body) {
      const list = this.lesson.order;
      let i = 0;
      let cur = null;
      const area = h('div');
      body.append(
        h('h2', { class: 'step-h' }, '語順パズル'),
        h('p', { class: 'lead' }, '日本語を聞いて、英語の順番で言ってみましょう。画面を見られるときは、単語をタップして並べられます。'),
        area,
      );

      const show = () => {
        const it = list[i];
        const tokens = it.en.replace(/[.?!]$/, '').split(' ');
        const end = (it.en.match(/[.?!]$/) || [''])[0];
        let placed = [];
        let solved = false;
        area.replaceChildren();

        const line = h('div', { class: 'order-line', 'aria-label': '並べた英語' });
        const pool = h('div', { class: 'order-pool' });
        const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
        const shuffled = shuffle(tokens.map((t, k) => ({ t, k })));
        if (shuffled.every((x, k) => x.k === k) && tokens.length > 1) shuffled.reverse();

        const draw = () => {
          line.replaceChildren(...placed.map((x, n) => h('button', {
            class: 'chip-word on', onclick: () => { if (!solved) { placed.splice(n, 1); draw(); } },
          }, x.t)), placed.length === tokens.length ? end : '');
          pool.replaceChildren(...shuffled.filter((x) => !placed.includes(x)).map((x) => h('button', {
            class: 'chip-word', onclick: () => { if (!solved) { placed.push(x); draw(); if (placed.length === tokens.length) check(); } },
          }, x.t)));
        };

        const check = async () => {
          const ok = placed.map((x) => x.t).join(' ') === tokens.join(' ');
          solved = true;
          fb.replaceChildren(
            h('p', { class: ok ? 'fb-title right-text' : 'fb-title wrong-text' }, ok ? '◎ 正解です' : '△ おしい！'),
            h('p', { lang: 'en' }, `答え：${it.en}`),
          );
          const g = this.begin();
          if (ok) await Sound.right(); else await Sound.wrong();
          if (!(await Speech.say(ok ? '正解です。' : 'おしいです。答えは、', { gen: g }))) return;
          if (await Speech.say(it.en, { lang: 'en', gen: g })) this.setIdle();
        };

        area.append(
          h('p', { class: 'muted' }, `${i + 1} / ${list.length}`),
          h('p', { class: 'q-text', onclick: () => run() }, it.ja),
          h('p', { class: 'muted small' }, `ヒント：${this.lesson.hint}`),
          line,
          pool,
          h('div', { class: 'row' },
            h('button', { class: 'btn btn-small', onclick: () => { solved = false; placed = []; fb.replaceChildren(); draw(); } }, '↺ やり直す'),
          ),
          fb,
        );
        draw();

        // 声の流れ：日本語 → 言ってみる（声で練習がオンなら聞き取る）→ 答えの英語
        const run = async () => {
          const gen = this.begin();
          if (!(await Speech.say(it.ja, { gen }))) return;
          if (!(await Speech.say('英語の順番で、言ってみましょう。', { gen }))) return;
          if (this.voice) {
            await Sound.cue();
            const heard = await Listen.hear({ lang: 'en', ms: 7000, gen });
            if (!Speech.alive(gen)) return;
            const res = Listen.best(it.en, heard);
            fb.replaceChildren(h('div', { class: 'say-result' },
              h('span', { class: 'small muted' }, res.score >= 0.8 ? '◎ 伝わりました：' : '△ こう聞こえました：'), ' ',
              h('span', { lang: 'en' }, res.heard || '（聞き取れませんでした）')));
            if (res.score >= 0.8) {
              await Sound.right();
              if (!(await Speech.say('ばっちりです。', { gen }))) return;
            } else if (!(await Speech.say(heard.length ? 'おしい。' : 'うまく聞き取れませんでした。', { gen }))) return;
          } else if (!(await Speech.wait(5000, gen))) return;
          if (!(await Speech.say('答えは、', { gen }))) return;
          if (!(await Speech.say(it.en, { lang: 'en', gen }))) return;
          if (!(await Speech.wait(600, gen))) return;
          if (!(await Speech.say(it.en, { lang: 'en', gen }))) return;
          if (this.handsFree) {
            await Speech.wait(1000, gen);
            if (Speech.alive(gen)) this.onNextClick();
          } else this.setIdle();
        };
        cur = { run, it, placed: () => placed };
        this.setNextLabel(i < list.length - 1 ? '次の問題 →' : '次へ →');
        run();
      };
      show();

      return {
        resume: () => cur && cur.run(),
        ctx: () => [
          `■ 日本語：${cur.it.ja}`,
          `■ 自分で並べた英語：${cur.placed().map((x) => x.t).join(' ') || '（まだ並べていません）'}`,
          `■ 正しい英語：${cur.it.en}`,
        ],
        onNext: () => {
          if (i < list.length - 1) {
            i++;
            show();
            return false;
          }
          return true;
        },
      };
    }

    // ---- まとめ（HTML・語順のレッスン） ----
    // 聞く解説の最後の「まとめ」の部分を、もう一度聞く
    stepRecap(body) {
      const segs = this.lesson.explain;
      let start = -1;
      segs.forEach((sg, k) => { if (/まとめ|覚えておきたい/.test(sg.text)) start = k; });
      if (start < 0) start = Math.max(0, segs.length - 4);
      const list = segs.slice(start);
      let cur = 0;
      let ended = false;

      const items = list.map((sg, k) => h('li', { class: 'seg', onclick: () => play(k) },
        h('p', null, sg.text),
        sg.en ? h('p', { class: 'seg-en', lang: 'en' }, sg.en) : null,
        sg.code ? h('pre', { class: 'code' }, h('code', null, sg.code)) : null,
      ));
      body.append(
        h('h2', { class: 'step-h' }, 'まとめ'),
        h('p', { class: 'lead' }, '今日のだいじな所を、もう一度聞きます。'),
        h('ol', { class: 'segs' }, items),
      );

      const mark = (k) => {
        cur = k;
        items.forEach((el, x) => el.classList.toggle('active', x === k));
      };

      const play = async (from) => {
        const gen = this.begin();
        ended = false;
        if (from === 0) {
          if (!(await Speech.say('最後に、今日のまとめを、もう一度聞きましょう。', { gen }))) return;
        }
        for (let k = from; k < list.length; k++) {
          mark(k);
          if (!(await Speech.say(list[k].say || toSpeech(list[k].text), { gen }))) return;
          if (list[k].en && !(await Speech.say(list[k].en, { lang: 'en', gen }))) return;
          if (!(await Speech.wait(500, gen))) return;
        }
        ended = true;
        this.autoNext(gen);
      };

      mark(0);
      play(0);

      return {
        ctx: () => [`■ まとめの文：「${list[cur].text}」`],
        resume: () => play(ended ? 0 : cur),
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
      const nextLesson = window.LESSONS.find((l) => l.course === this.lesson.course && l.no === this.lesson.no + 1);

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
            this.lesson.course === 'html'
              ? h('a', { class: 'btn btn-second', href: `#/drill/${this.lesson.id}` }, '✍ この回の書く練習をする')
              : null,
          ),
        ),
      );
      Speech.say('今日の分は、おしまいです。おつかれさまでした。また明日、いっしょに学びましょう。');
      return {};
    }
  }

  window.Session = Session;
  window.SessionHelpers = { findLesson, lessonLabel, toSpeech, isTalk, isEnglish };
})();
