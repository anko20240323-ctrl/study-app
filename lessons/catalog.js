// 教材の一覧です。
// 新しいレッスンを足すときは、
//   1. lessons/ にファイルを作る（html-01.js をまねする）
//   2. 下の LESSON_FILES に、そのファイル名を1行足す
//   3. sw.js の PRECACHE にも同じファイル名を足す（電波がない所でも開けるように）
// の3つだけで大丈夫です。画面の仕組み（js/）はさわらなくてよいです。

// コース（ホーム画面での見出し）。レッスンの course と同じ id を書きます。
window.COURSES = [
  { id: 'html', title: 'HTMLの基礎' },
  { id: 'vocab', title: '英単語' },
  { id: 'talk', title: '英語の日常会話' },
  { id: 'grammar', title: '英語の語順' },
];

window.LESSON_FILES = [
  'lessons/html-01.js',
  'lessons/html-02.js',
  'lessons/html-03.js',
  'lessons/html-04.js',
  'lessons/html-05.js',
  'lessons/html-06.js',
  'lessons/html-07.js',
  'lessons/talk-01.js',
  'lessons/talk-02.js',
  'lessons/talk-03.js',
  'lessons/grammar-01.js',
  'lessons/grammar-02.js',
  'lessons/grammar-03.js',
  'lessons/html-drills.js',
  'lessons/vocab.js',
];

// 書く練習の問題。registerDrills('html-01', [ ... ]) で、その回の問題を足します。
window.DRILLS = {};
window.registerDrills = function (lessonId, list) {
  window.DRILLS[lessonId] = (window.DRILLS[lessonId] || []).concat(list);
};

// レッスンのファイルは、この関数を呼んで自分を登録します。
window.LESSONS = [];
window.registerLesson = function (lesson) {
  // course を書いていないレッスンは、HTMLの基礎のレッスンとして扱う
  if (!lesson.course) lesson.course = 'html';
  // 英単語の回は、問題を単語から自動で作る
  if (lesson.course === 'vocab' && !lesson.quiz) lesson.quiz = makeVocabQuiz(lesson);
  window.LESSONS.push(lesson);
};

// 英単語の回の「短い問題」を、その回の単語から作る。
// 1語につき1問（奇数番目は 英語→意味、偶数番目は 意味→英語）。
// 毎回同じ問題になるように、まちがいの選択肢は決まった順で選ぶ（復習で同じ問題を出すため）。
function makeVocabQuiz(lesson) {
  const words = lesson.words;
  const pick = (i, n) => {
    const others = words.filter((_, k) => k !== i);
    const out = [];
    for (let k = 0; out.length < n && k < others.length; k++) out.push(others[(i * 3 + k * 5) % others.length]);
    return [...new Set(out)];
  };
  return words.map((w, i) => {
    const wrong = pick(i, 2);
    const pos = (i * 7 + 1) % 3; // 正解の場所も、問題ごとに変える
    const list = [...wrong];
    list.splice(Math.min(pos, list.length), 0, w);
    const why = `${w.en} は「${w.ja}」という意味です。例文：${w.ex}`;
    const whyParts = [
      { text: w.en, lang: 'en' }, { text: `は、${w.ja}、という意味です。`, lang: 'ja' },
      { text: w.ex, lang: 'en' },
    ];
    if (i % 2 === 0) {
      return {
        q: `「${w.en}」の意味は？`,
        sayParts: [{ text: w.en, lang: 'en' }, { text: 'の意味は、どれでしょう？', lang: 'ja' }],
        choices: list.map((x) => x.ja),
        answer: list.indexOf(w),
        why,
        whyParts,
      };
    }
    return {
      q: `「${w.ja}」は英語で？`,
      sayParts: [{ text: `${w.ja}、は英語で、どれでしょう？`, lang: 'ja' }],
      choices: list.map((x) => x.en),
      choicesLang: 'en',
      answer: list.indexOf(w),
      why,
      whyParts,
    };
  });
}
