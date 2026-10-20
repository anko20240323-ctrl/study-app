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
      voice: false,     // 声で練習する（マイクを使う）
    },
    studyDays: [],      // 学んだ日 'YYYY-MM-DD'
    done: {},           // レッスンID → 終えた回数
    mistakes: [],       // { kind:'quiz'|'word', lessonId, key, at }
    drills: {},         // レッスンID → 書く練習で「できました」になった回数
    lastVisit: '',
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
    addMistake(kind, lessonId, key) {
      const m = { kind, lessonId, key: String(key), at: Date.now() };
      const id = mistakeId(m);
      state.mistakes = state.mistakes.filter((x) => mistakeId(x) !== id);
      state.mistakes.push(m);
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
