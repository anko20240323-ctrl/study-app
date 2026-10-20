// 教材の一覧です。
// 新しいレッスンを足すときは、
//   1. lessons/ にファイルを作る（html-01.js をまねする）
//   2. 下の LESSON_FILES に、そのファイル名を1行足す
//   3. sw.js の PRECACHE にも同じファイル名を足す（電波がない所でも開けるように）
// の3つだけで大丈夫です。画面の仕組み（js/）はさわらなくてよいです。

// コース（ホーム画面での見出し）。レッスンの course と同じ id を書きます。
window.COURSES = [
  { id: 'html', title: 'HTMLの基礎' },
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
];

// レッスンのファイルは、この関数を呼んで自分を登録します。
window.LESSONS = [];
window.registerLesson = function (lesson) {
  // course を書いていないレッスンは、HTMLの基礎のレッスンとして扱う
  if (!lesson.course) lesson.course = 'html';
  window.LESSONS.push(lesson);
};
