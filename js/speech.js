// 読み上げ係。ブラウザに入っている読み上げ機能（Web Speech API）を使います。
// お金はかからず、ネットにもつながりません。

(function () {
  const synth = window.speechSynthesis;
  const supported = !!synth && typeof SpeechSynthesisUtterance !== 'undefined';

  // 女性の声らしい名前（スマホやパソコンでよく入っているもの）
  const FEMALE_HINT = /kyoko|o-?ren|nanami|haruka|ayumi|sayaka|mizuki|female|女性|google 日本語|\b(samantha|ava|allison|susan|zira|aria|jenny|karen|serena|victoria|moira|tessa|flo|sandy|shelley)\b|google us english/i;
  const MALE_HINT = /otoya|hattori|ichiro|keita|daichi|\bmale\b|男性|\b(alex|fred|daniel|david|guy|mark|tom|aaron|rishi|reed|eddy|rocko|grandpa|ralph|albert)\b/i;

  let voices = [];
  let generation = 0; // stop() のたびに増える番号。古い読み上げを止める合図

  function loadVoices() {
    if (!supported) return [];
    voices = synth.getVoices() || [];
    return voices;
  }

  if (supported) {
    loadVoices();
    if ('onvoiceschanged' in synth) {
      synth.addEventListener('voiceschanged', () => {
        loadVoices();
        document.dispatchEvent(new Event('voices-ready'));
      });
    }
  }

  function voicesFor(lang) {
    const prefix = lang === 'en' ? 'en' : 'ja';
    return voices.filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix));
  }

  function score(v, lang) {
    let s = 0;
    if (FEMALE_HINT.test(v.name)) s += 10;
    if (MALE_HINT.test(v.name)) s -= 10;
    if (lang === 'en' && /en-us/i.test(v.lang.replace('_', '-'))) s += 3;
    if (v.localService) s += 1; // 電波がなくても使える声を少し優先
    if (/enhanced|premium|natural|拡張/i.test(v.name)) s += 2;
    return s;
  }

  function pickVoice(lang) {
    const wanted = lang === 'en' ? Store.settings.enVoice : Store.settings.jaVoice;
    const list = voicesFor(lang);
    if (wanted) {
      const v = list.find((x) => x.voiceURI === wanted || x.name === wanted);
      if (v) return v;
    }
    if (list.length === 0) return null;
    return [...list].sort((a, b) => score(b, lang) - score(a, lang))[0];
  }

  function isFemaleGuess(v) {
    return FEMALE_HINT.test(v.name) && !MALE_HINT.test(v.name);
  }

  function wait(ms, gen) {
    return new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (gen !== undefined && gen !== generation) return resolve(false);
        if (Date.now() - start >= ms) return resolve(true);
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  // ---- 前もって作った音声ファイル（audio/）----
  // audio/manifest.json に「どの文に、どのファイルがあるか」が書いてある。
  // ファイルがある文はそれを再生し（画面を消しても止まりにくい）、ない文は今までどおりブラウザが読む。
  let manifest = { files: {}, lessons: {} };
  const manifestReady = fetch('audio/manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => { if (m && m.files) manifest = m; })
    .catch(() => {});

  const player = typeof Audio !== 'undefined' ? new Audio() : null;
  if (player) player.preload = 'auto';

  function fileFor(lang, text, pitch) {
    const e = manifest.files[Phrases.audioKey(lang, text, pitch)];
    return e ? `audio/${e.f}` : null;
  }

  // 再生できたら true、止められたら false、再生できなかったら null（ブラウザの読み上げに切りかえる）
  function playFile(src, rate, gen) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (v) => {
        if (done) return;
        done = true;
        clearInterval(guard);
        player.onended = player.onerror = null;
        resolve(v);
      };
      const guard = setInterval(() => {
        if (gen !== generation) {
          player.pause();
          finish(false);
        }
      }, 150);
      player.onended = () => finish(gen === generation);
      player.onerror = () => finish(null);
      player.src = src;
      player.playbackRate = rate;
      player.preservesPitch = true;
      player.webkitPreservesPitch = true;
      const p = player.play();
      if (p && p.catch) p.catch(() => finish(null));
    });
  }

  // 画面を消しても止まらないように、レッスン中は無音の音を流し続ける（音声ファイルがあるときだけ）
  let silence = null;
  function silentWav() {
    const rate = 8000;
    const n = rate; // 1秒
    const buf = new ArrayBuffer(44 + n * 2);
    const v = new DataView(buf);
    const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }

  function keepAlive(on, title, onToggle) {
    if (!player) return;
    const has = Object.keys(manifest.files).length > 0;
    if (on && has) {
      if (!silence) {
        silence = new Audio(silentWav());
        silence.loop = true;
        silence.volume = 0.01;
      }
      silence.play().catch(() => {});
      // ロック画面に、レッスン名と止める・続きからのボタンを出す
      if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({ title: title || 'まなびノート', artist: 'まなびノート' });
        try {
          navigator.mediaSession.setActionHandler('pause', onToggle || null);
          navigator.mediaSession.setActionHandler('play', onToggle || null);
        } catch (e) { /* 対応していない */ }
      }
    } else if (silence) {
      silence.pause();
    }
  }

  // その回の音声ファイルを、前もって保存しておく（電波がない所でも聞けるように）
  async function prefetch(ids, onProgress) {
    await manifestReady;
    const files = new Set();
    for (const id of ids) for (const f of manifest.lessons[id] || []) files.add(`audio/${f}`);
    const list = [...files];
    let doneN = 0;
    const worker = async () => {
      while (list.length) {
        const url = list.shift();
        try { await fetch(url); } catch (e) { /* あとでまた */ }
        doneN++;
        if (onProgress) onProgress(doneN, files.size);
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    return files.size;
  }

  // 1つの文を読む。読み終わったら true、止められたら false
  async function say(text, opts = {}) {
    const lang = opts.lang === 'en' ? 'en' : 'ja';
    const gen = opts.gen !== undefined ? opts.gen : generation;
    if (!text) return true;
    const src = player && fileFor(lang, text, opts.pitch);
    if (src) {
      const base = Number(Store.settings.rate) || 1;
      const r = await playFile(src, Math.max(0.5, Math.min(2, base * (opts.rateScale || 1))), gen);
      if (r !== null) return r;
    }
    return speakTTS(text, lang, gen, opts);
  }

  function speakTTS(text, lang, gen, opts) {
    if (!supported) {
      // 読み上げが使えない環境では、読む時間だけ待つ
      return wait(Math.min(4000, text.length * 120), gen);
    }
    return new Promise((resolve) => {
      if (gen !== generation) return resolve(false);
      const base = Number(Store.settings.rate) || 1;
      const rate = Math.max(0.5, Math.min(2, base * (opts.rateScale || 1)));

      const make = () => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'en' ? 'en-US' : 'ja-JP';
        const v = pickVoice(lang);
        try {
          if (v) u.voice = v;
        } catch (e) { /* 声を選べなくても、ふつうの声で読む */ }
        u.rate = rate;
        u.pitch = opts.pitch || 1;
        return u;
      };

      let finished = false;
      let started = false;
      let retried = false;
      let current = null;
      let guard = null;
      const finish = (ok) => {
        if (finished) return;
        finished = true;
        clearInterval(guard);
        if (current) current.onend = current.onerror = current.onstart = null;
        resolve(ok && gen === generation);
      };

      const speakNow = () => {
        if (gen !== generation) return finish(false);
        current = make();
        current.onstart = () => { started = true; };
        current.onend = () => finish(true);
        current.onerror = (e) => finish(!(e && (e.error === 'interrupted' || e.error === 'canceled')));
        synth.speak(current);
        // iPhone などで一時停止のまま止まってしまうことへの対策
        if (synth.paused) synth.resume();
      };

      // スマホによっては「読み終わった」の合図が来ないことがあるので、見張り役をつける
      const t0 = Date.now();
      const limit = t0 + 6000 + (text.length * 350) / rate;
      guard = setInterval(() => {
        if (gen !== generation) return finish(false);
        // iPhone で、止めた直後に読み始めると、声が出ないまま止まることがある。そのときは1回だけ読み直す
        if (!started && !retried && Date.now() - t0 > 2500 && !synth.speaking) {
          retried = true;
          if (current) current.onend = current.onerror = current.onstart = null;
          synth.cancel();
          setTimeout(speakNow, 250);
          return;
        }
        if (Date.now() > limit && !synth.speaking) finish(true);
        if (Date.now() > limit + 15000) finish(true);
      }, 500);

      // 止めた直後は、少し待ってから読み始める（iPhone で声が出なくなるのを防ぐ）
      const sinceCancel = Date.now() - lastCancel;
      if (sinceCancel < 250) setTimeout(speakNow, 250 - sinceCancel);
      else speakNow();
    });
  }

  let lastCancel = 0;
  function stop() {
    generation++;
    if (player) player.pause();
    if (supported) {
      synth.cancel();
      lastCancel = Date.now();
    }
  }

  // ボタンを押した瞬間に呼んで、声を出せる状態にしておく（スマホの決まり）。
  // このあとマイクの許可を待っても、声が出なくならないようにするため
  function unlock() {
    try {
      if (player && !player.src) {
        player.src = silentWav();
        const p = player.play();
        if (p && p.then) p.then(() => player.pause()).catch(() => {});
      }
    } catch (e) { /* 使えない環境では何もしない */ }
    try {
      if (supported) synth.speak(new SpeechSynthesisUtterance(''));
    } catch (e) { /* 使えない環境では何もしない */ }
  }

  window.Speech = {
    supported,
    unlock,
    keepAlive,
    prefetch,
    manifestReady,
    get audioInfo() {
      const files = Object.values(manifest.files);
      return { count: files.length, bytes: files.reduce((a, e) => a + (e.b || 0), 0) };
    },
    loadVoices,
    voicesFor,
    pickVoice,
    isFemaleGuess,
    say,
    stop,
    wait,
    // 新しい読み上げの流れを始めるときに呼ぶ。返ってきた番号で「まだ続けてよいか」を確かめる
    begin() {
      stop();
      return generation;
    },
    alive(gen) { return gen === generation; },
    get speaking() { return supported && synth.speaking; },
  };
})();
