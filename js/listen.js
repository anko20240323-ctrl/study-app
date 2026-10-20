// 声を聞き取る係（Listen）と、効果音の係（Sound）。
// 聞き取りはブラウザの音声認識（Web Speech API の SpeechRecognition）を使います。
// iPhone では、声が Apple のサーバーに送られて文字になることがあります（たつやさん了承済み）。
// 設定の「声で練習する」がオンのときだけ使います。

(function () {
  // ---- 効果音（音のファイルはいらない。アプリの中で音を作る） ----
  let ctx = null;
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, vol = 0.18, type = 'sine') {
    const a = audio();
    if (!a) return;
    const t = a.currentTime + start;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  window.Sound = {
    // ボタンを押したときに呼んで、音を出せる状態にしておく（スマホの決まり）
    unlock() { audio(); },
    // 正解：ピコーン♪
    async right() {
      tone(988, 0, 0.12);
      tone(1319, 0.11, 0.45);
      await wait(550);
    },
    // まちがい：やさしい「ポン」
    async wrong() {
      tone(330, 0, 0.3, 0.12, 'triangle');
      await wait(350);
    },
    // 「どうぞ（話してください）」の合図：ポッ
    async cue() {
      tone(880, 0, 0.15, 0.12);
      await wait(250);
    },
  };

  // ---- 聞き取り ----
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // lang: 'en' か 'ja'。ms: 何ミリ秒まで聞くか。
  // 聞き取れた文の候補（いくつか）を返す。聞き取れなかったら []。
  function hear({ lang = 'en', ms = 5000, gen } = {}) {
    return new Promise((resolve) => {
      if (!SR) return resolve([]);
      let rec;
      try {
        rec = new SR();
      } catch (e) {
        return resolve([]);
      }
      rec.lang = lang === 'en' ? 'en-US' : 'ja-JP';
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.continuous = false;
      let done = false;
      let results = [];
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        clearInterval(guard);
        try { rec.abort(); } catch (e) { /* もう止まっている */ }
        resolve(results);
      };
      rec.onresult = (e) => {
        const r = e.results[e.results.length - 1];
        results = Array.from(r).map((x) => x.transcript);
        finish();
      };
      rec.onerror = () => finish();
      rec.onend = () => finish();
      const timer = setTimeout(finish, ms);
      // 止めるボタンが押されたら、すぐやめる
      const guard = setInterval(() => {
        if (gen !== undefined && !Speech.alive(gen)) finish();
      }, 200);
      try {
        rec.start();
      } catch (e) {
        finish();
      }
    });
  }

  // ---- 比べる ----
  const CONTRACTIONS = {
    "i'm": 'i am', "you're": 'you are', "it's": 'it is', "that's": 'that is', "what's": 'what is',
    "i'll": 'i will', "you'll": 'you will', "don't": 'do not', "doesn't": 'does not', "can't": 'cannot',
    "isn't": 'is not', "aren't": 'are not', "i've": 'i have', "let's": 'let us', "he's": 'he is', "she's": 'she is',
    "we're": 'we are', "they're": 'they are', "there's": 'there is', "won't": 'will not',
  };
  const NUMS = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };

  function words(text) {
    return String(text).toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .split(/\s+/).filter(Boolean)
      .flatMap((w) => (CONTRACTIONS[w] || NUMS[w] || w).split(' '))
      .map((w) => (w === 'can' ? 'can' : w));
  }

  // お手本の単語のうち、いくつ聞き取れたか（順番も見る）
  function compare(target, heard) {
    const t = words(target);
    const hw = words(heard);
    // 最長共通部分列で、順番どおりに合っている単語に印をつける
    const dp = Array.from({ length: t.length + 1 }, () => new Array(hw.length + 1).fill(0));
    for (let i = t.length - 1; i >= 0; i--) {
      for (let j = hw.length - 1; j >= 0; j--) {
        dp[i][j] = t[i] === hw[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const ok = new Array(t.length).fill(false);
    let i = 0;
    let j = 0;
    while (i < t.length && j < hw.length) {
      if (t[i] === hw[j]) { ok[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    const score = t.length ? ok.filter(Boolean).length / t.length : 0;
    return { score, words: t, ok };
  }

  // いちばん合っている候補を選ぶ
  function best(target, alternatives) {
    let top = { score: 0, words: words(target), ok: [], heard: '' };
    for (const a of alternatives) {
      const c = compare(target, a);
      if (c.score > top.score || !top.heard) top = { ...c, heard: a };
    }
    return top;
  }

  // 「いち・に・さん」「1番」「one」などから番号を取り出す（見つからなければ -1）
  function number(alternatives, max) {
    const table = [
      [/(^|[^0-9])1([^0-9]|$)|いち|一|ワン|\bone\b|壱/, 0],
      [/(^|[^0-9])2([^0-9]|$)|^に|に番|二|ツー|\btwo\b|\bto\b|\btoo\b|にばん/, 1],
      [/(^|[^0-9])3([^0-9]|$)|さん|三|スリー|\bthree\b/, 2],
      [/(^|[^0-9])4([^0-9]|$)|よん|し番|四|フォー|\bfour\b|\bfor\b/, 3],
    ];
    for (const a of alternatives) {
      const s = String(a).trim().toLowerCase();
      for (const [re, n] of table) {
        if (n < max && re.test(s)) return n;
      }
    }
    return -1;
  }

  window.Listen = {
    supported: !!SR,
    hear,
    compare,
    best,
    number,
    words,
  };
})();
