// 進み具合の保存係。データはこのスマホの中（localStorage）だけに置きます。
// 外のサービスには何も送りません。

(function () {
  const KEY = 'manabi-v1';

  const DEFAULTS = {
    settings: {
      jaVoice: '',      // 空なら自動で女性の声を選ぶ
      enVoice: '',
      rate: 1.0,
      handsFree: false, // 聞くだけモード
      drive: false,     // 運転モード（聞くだけ＋マイクなし＋大きな文字）
      voice: false,     // 声で練習する（マイクを使う）
      parts: 'symbol',  // 書く練習の部品ボタン：'symbol' 記号ごと／'tag' タグごと／'off' 使わない
    },
    studyDays: [],      // 学んだ日 'YYYY-MM-DD'
    done: {},           // レッスンID → 終えた回数
    mistakes: [],       // { kind:'quiz'|'word', lessonId, key, at }
    drills: {},         // レッスンID → 書く練習で「できました」になった回数
    lastVisit: '',
    progress: null,     // 途中でやめた回 { lessonId, step, at }（ホームの「続きから」）
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredCloneSafe(DEFAULTS);
      const data = JSON.parse(raw);
      return {
        ...structuredCloneSafe(DEFAULTS),
        ...data,
        settings: { ...DEFAULTS.settings, ...(data.settings || {}) },
      };
    } catch (e) {
      return structuredCloneSafe(DEFAULTS);
    }
  }

  function structuredCloneSafe(o) {
    return JSON.parse(JSON.stringify(o));
  }

  let state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // 保存できなくても、アプリはそのまま使えるようにする
    }
  }

  function today() {
    const d = new Date();
    return dateKey(d);
  }

  function dateKey(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  // 今日まで（または昨日まで）何日つづいているか
  function streak() {
    const set = new Set(state.studyDays);
    const d = new Date();
    if (!set.has(dateKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(dateKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  // 前に学んだ日から、2日以上あいているか
  function isComingBack() {
    if (state.studyDays.length === 0) return false;
    const last = state.studyDays[state.studyDays.length - 1];
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return last < dateKey(y);
  }

  // 復習に出す日：まちがえた日の翌日 → 正解するたびに 3日後 → 1週間後 → 卒業（復習から消える）
  const REVIEW_DAYS = [1, 3, 7];
  function dayAfter(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return dateKey(d);
  }

  function mistakeId(m) {
    return `${m.kind}:${m.lessonId}:${m.key}`;
  }

  window.Store = {
    get settings() { return state.settings; },
    setSetting(name, value) {
      state.settings[name] = value;
      save();
    },
    studiedToday() { return state.studyDays.includes(today()); },
    totalDays() { return state.studyDays.length; },
    streak,
    isComingBack,
    markStudied() {
      const t = today();
      if (!state.studyDays.includes(t)) {
        state.studyDays.push(t);
        state.studyDays.sort();
      }
      save();
    },
    doneCount(id) { return state.done[id] || 0; },
    markDone(id) {
      state.done[id] = (state.done[id] || 0) + 1;
      save();
    },
    drillCount(id) { return (state.drills || {})[id] || 0; },
    addDrill(id) {
      state.drills = state.drills || {};
      state.drills[id] = (state.drills[id] || 0) + 1;
      save();
    },
    get mistakes() { return state.mistakes; },
    // 今日、復習に出すもの（出す日が来たもの。古い順）。前の版で記録したもの（出す日がない）は、すぐ出す
    dueMistakes() {
      const t = today();
      return state.mistakes.filter((m) => !m.due || m.due <= t)
        .sort((a, b) => (a.due || '').localeCompare(b.due || '') || a.at - b.at);
    },
    // まちがえた・「あやしい」にした：翌日の復習に出す（すでにあれば、はじめからやり直し）
    addMistake(kind, lessonId, key) {
      const m = { kind, lessonId, key: String(key), at: Date.now(), stage: 0, due: dayAfter(REVIEW_DAYS[0]) };
      const id = mistakeId(m);
      state.mistakes = state.mistakes.filter((x) => mistakeId(x) !== id);
      state.mistakes.push(m);
      save();
    },
    // 復習で答えたとき：正解なら次は 3日後 → 1週間後 → 卒業。まちがいなら翌日にもう一度
    reviewed(kind, lessonId, key, correct) {
      const id = mistakeId({ kind, lessonId, key: String(key) });
      const m = state.mistakes.find((x) => mistakeId(x) === id);
      if (!m) return;
      if (!correct) {
        m.stage = 0;
        m.due = dayAfter(REVIEW_DAYS[0]);
      } else {
        m.stage = (m.stage || 0) + 1;
        if (m.stage >= REVIEW_DAYS.length) state.mistakes = state.mistakes.filter((x) => x !== m);
        else m.due = dayAfter(REVIEW_DAYS[m.stage]);
      }
      save();
    },
    // 途中でやめた回（続きから）
    get progress() { return state.progress; },
    setProgress(p) {
      state.progress = p ? { ...p, at: Date.now() } : null;
      save();
    },
    removeMistake(kind, lessonId, key) {
      const id = mistakeId({ kind, lessonId, key: String(key) });
      state.mistakes = state.mistakes.filter((x) => mistakeId(x) !== id);
      save();
    },
    resetAll() {
      state = structuredCloneSafe(DEFAULTS);
      save();
    },
  };
})();
