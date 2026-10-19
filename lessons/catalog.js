// 教材の一覧です。
// 新しいレッスンを足すときは、
//   1. lessons/ にファイルを作る（html-01.js をまねする）
//   2. 下の LESSON_FILES に、そのファイル名を1行足す
//   3. sw.js の PRECACHE にも同じファイル名を足す（電波がない所でも開けるように）
// の3つだけで大丈夫です。画面の仕組み（js/）はさわらなくてよいです。

window.LESSON_FILES = [
  'lessons/html-01.js',
  'lessons/html-02.js',
  'lessons/html-03.js',
  'lessons/html-04.js',
  'lessons/html-05.js',
  'lessons/html-06.js',
  'lessons/html-07.js',
];

// レッスンのファイルは、この関数を呼んで自分を登録します。
window.LESSONS = [];
window.registerLesson = function (lesson) {
  window.LESSONS.push(lesson);
};
