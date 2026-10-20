// 書く練習の問題（HTMLの基礎）。
// 各回の「打ってみる」の問題に加えて、ここの問題が「✍ 書く練習」に出ます。
// 書き方は「打ってみる」（practice）と同じです：
//   task 課題 / hint ヒント / starter 最初から入っている文字 / sample お手本 / checks 合格の条件 / done できたときの一言
// checks の re は「この形が入っていればOK」という決まり（正規表現）。has は「この文字が入っていればOK」。

// 中に文字が入っているかを見る決まりを作る（例：<h1>と</h1>のあいだが空でない）
const filled = (tag) => `<${tag}[^>]*>\\s*[^<\\s][\\s\\S]*?</${tag}>`;

registerDrills('html-01', [
  {
    task: 'body タグで「こんにちは」をはさんでみましょう。',
    hint: '<body> と </body> のあいだに「こんにちは」を書きます。',
    sample: '<body>こんにちは</body>',
    checks: [
      { has: '<body>', msg: '始まりのタグ <body> がまだありません。' },
      { has: '</body>', msg: '終わりのタグ </body> がまだありません。' },
      { re: '<body>[\\s\\S]*こんにちは[\\s\\S]*</body>', msg: '「こんにちは」を <body> と </body> ではさみましょう。' },
    ],
    done: 'body に書いたものが、画面に出ます。',
  },
  {
    task: 'head の中に、title「お店のページ」を書いてみましょう。',
    hint: '<head> の中に <title>お店のページ</title> を入れて、最後に </head> で閉じます。',
    sample: '<head>\n  <title>お店のページ</title>\n</head>',
    checks: [
      { has: '<head>', msg: '<head> がまだありません。' },
      { has: '</head>', msg: '最後に </head> で閉じましょう。' },
      { re: '<head>[\\s\\S]*<title>\\s*お店のページ\\s*</title>[\\s\\S]*</head>', msg: '<title>お店のページ</title> を head の中に入れましょう。' },
    ],
    done: 'タブの名前に「お店のページ」と出ましたね。',
  },
  {
    task: 'html タグに lang="ja" をつけて、「テスト」という文字を包んでみましょう。',
    hint: '<html lang="ja"> で始めて、「テスト」を書き、</html> で閉じます。',
    sample: '<html lang="ja">\n  テスト\n</html>',
    checks: [
      { re: '<html\\s+lang\\s*=\\s*"ja"\\s*>', msg: '<html lang="ja"> の形で始めましょう。" は「記号」ボタンにあります。' },
      { has: '</html>', msg: '最後に </html> で閉じましょう。' },
      { has: 'テスト', msg: '「テスト」という文字を入れましょう。' },
    ],
    done: 'lang="ja" で「このページは日本語です」と伝えられます。',
  },
  {
    task: 'ページの骨組みを、全部書いてみましょう（タイトルは自由、中身は「こんにちは」）。',
    hint: '<!DOCTYPE html> → <html lang="ja"> → <head><title>…</title></head> → <body>こんにちは</body> → </html> の順です。',
    sample: '<!DOCTYPE html>\n<html lang="ja">\n  <head>\n    <title>はじめてのページ</title>\n  </head>\n  <body>\n    こんにちは\n  </body>\n</html>',
    checks: [
      { re: '<!doctype html>', msg: 'いちばん上に <!DOCTYPE html> を書きましょう。' },
      { re: '<html\\s+lang\\s*=\\s*"ja"\\s*>', msg: '<html lang="ja"> がまだありません。' },
      { re: filled('title'), msg: '<title> と </title> のあいだに、ページの名前を書きましょう。' },
      { re: '<head>[\\s\\S]*</head>', msg: '<head> と </head> で、title を包みましょう。' },
      { re: '<body>[\\s\\S]*こんにちは[\\s\\S]*</body>', msg: '<body> の中に「こんにちは」を書きましょう。' },
      { has: '</html>', msg: '最後に </html> で閉じましょう。' },
    ],
    done: '骨組みを全部、自分で書けました！これがすべてのWebページの土台です。',
  },
]);

registerDrills('html-02', [
  {
    task: 'h1 で「今日のセール」という見出しを作りましょう。',
    hint: '<h1>今日のセール</h1> と打ちます。',
    sample: '<h1>今日のセール</h1>',
    checks: [
      { re: '<h1>\\s*今日のセール\\s*</h1>', msg: '「今日のセール」を <h1> と </h1> ではさみましょう。' },
    ],
  },
  {
    task: 'p を2つ使って、「10時から」「18時まで」と2つの段落を書きましょう。',
    hint: '<p>10時から</p> と <p>18時まで</p> を、2行に分けて書きます。',
    sample: '<p>10時から</p>\n<p>18時まで</p>',
    checks: [
      { re: '<p>\\s*10時から\\s*</p>', msg: '<p>10時から</p> がまだありません。' },
      { re: '<p>\\s*18時まで\\s*</p>', msg: '<p>18時まで</p> がまだありません。' },
    ],
    done: '段落と段落のあいだに、すき間があきましたね。',
  },
  {
    task: 'h1 で「店長日記」、その下に h2 で「月曜日」と書きましょう。',
    hint: '<h1>店長日記</h1> の次の行に <h2>月曜日</h2> を書きます。',
    sample: '<h1>店長日記</h1>\n<h2>月曜日</h2>',
    checks: [
      { re: '<h1>\\s*店長日記\\s*</h1>', msg: '<h1>店長日記</h1> がまだありません。' },
      { re: '<h2>\\s*月曜日\\s*</h2>', msg: '<h2>月曜日</h2> がまだありません。' },
      { re: '</h1>[\\s\\S]*<h2>', msg: 'h2 は h1 の下（あと）に書きましょう。' },
    ],
    done: 'h2 は h1 より少し小さい見出しになりました。',
  },
  {
    task: 'p の中で br を使って、「福岡市」と「西区」を2行にしましょう。',
    hint: '<p>福岡市<br>西区</p> と打ちます。br には終わりのタグがいりません。',
    sample: '<p>福岡市<br>西区</p>',
    checks: [
      { re: '<p>[\\s\\S]*福岡市[\\s\\S]*<br\\s*/?>[\\s\\S]*西区[\\s\\S]*</p>', msg: '<p> の中に「福岡市<br>西区」の形で書きましょう。' },
    ],
    done: '段落の中で改行できました。',
  },
]);

registerDrills('html-03', [
  {
    task: '「サイトへ」という文字で、https://example.com に飛ぶリンクを作りましょう。',
    hint: '<a href="https://example.com">サイトへ</a> と打ちます。',
    sample: '<a href="https://example.com">サイトへ</a>',
    checks: [
      { re: '<a\\s+href\\s*=\\s*"https://example\\.com/?"\\s*>', msg: '<a href="https://example.com"> の形で始めましょう。' },
      { re: '>\\s*サイトへ\\s*</a>', msg: '「サイトへ」を、始まりのタグと </a> ではさみましょう。' },
    ],
  },
  {
    task: '同じサイトの about.html に飛ぶ、「お店について」というリンクを作りましょう。',
    hint: '同じサイトの中なら、ファイルの名前だけで大丈夫です。<a href="about.html">お店について</a>',
    sample: '<a href="about.html">お店について</a>',
    checks: [
      { re: '<a\\s+href\\s*=\\s*"about\\.html"\\s*>', msg: '<a href="about.html"> の形で始めましょう。' },
      { re: '>\\s*お店について\\s*</a>', msg: '「お店について」を、始まりのタグと </a> ではさみましょう。' },
    ],
  },
  {
    task: '文章の途中にリンクを入れましょう。「くわしくは営業時間を見てください。」の「営業時間」を、hours.html へのリンクにします。',
    hint: '<p>くわしくは<a href="hours.html">営業時間</a>を見てください。</p>',
    sample: '<p>くわしくは<a href="hours.html">営業時間</a>を見てください。</p>',
    checks: [
      { re: '<p>[\\s\\S]*<a\\s+href\\s*=\\s*"hours\\.html"\\s*>\\s*営業時間\\s*</a>[\\s\\S]*</p>', msg: 'p の中に <a href="hours.html">営業時間</a> を入れましょう。' },
      { has: 'くわしくは', msg: '「くわしくは」から始まる文章にしましょう。' },
    ],
    done: 'タグの中にタグを入れる「入れ子」ができました。',
  },
  {
    task: 'リンクを2つ作りましょう。「見本のサイト」は https://example.com へ、「お店について」は about.html へ。',
    hint: 'a タグを2つ書きます。見やすいように、それぞれ p で包んでもよいです。',
    sample: '<p><a href="https://example.com">見本のサイト</a></p>\n<p><a href="about.html">お店について</a></p>',
    checks: [
      { re: '<a\\s+href\\s*=\\s*"https://example\\.com/?"\\s*>\\s*見本のサイト\\s*</a>', msg: '「見本のサイト」のリンクがまだありません。' },
      { re: '<a\\s+href\\s*=\\s*"about\\.html"\\s*>\\s*お店について\\s*</a>', msg: '「お店について」のリンクがまだありません。' },
    ],
  },
]);

registerDrills('html-04', [
  {
    task: 'img/cat.svg の画像を、alt「ねこ」でのせましょう。',
    hint: '<img src="img/cat.svg" alt="ねこ"> と打ちます。',
    sample: '<img src="img/cat.svg" alt="ねこ">',
    checks: [
      { re: '<img\\s[^>]*src\\s*=\\s*"img/cat\\.svg"', msg: 'src="img/cat.svg" で、画像の場所を書きましょう。' },
      { re: '<img\\s[^>]*alt\\s*=\\s*"ねこ"', msg: 'alt="ねこ" で、画像の説明を書きましょう。' },
    ],
  },
  {
    task: '同じねこの画像を、width="100" で小さくのせましょう（alt も忘れずに）。',
    hint: '<img src="img/cat.svg" alt="ねこ" width="100">',
    sample: '<img src="img/cat.svg" alt="ねこ" width="100">',
    checks: [
      { re: '<img\\s[^>]*src\\s*=\\s*"img/cat\\.svg"', msg: 'src="img/cat.svg" がまだありません。' },
      { re: '<img\\s[^>]*alt\\s*=\\s*"[^"]+"', msg: 'alt="…" で、画像の説明を書きましょう。' },
      { re: '<img\\s[^>]*width\\s*=\\s*"100"', msg: 'width="100" で、幅を100にしましょう。' },
    ],
    done: '幅だけ書けば、高さは形をくずさずに合わせてくれます。',
  },
  {
    task: 'h1 で「ねこの写真」と見出しを書き、その下にねこの画像をのせましょう。',
    hint: '<h1>ねこの写真</h1> の次の行に <img src="img/cat.svg" alt="ねこ"> を書きます。',
    sample: '<h1>ねこの写真</h1>\n<img src="img/cat.svg" alt="ねこ">',
    checks: [
      { re: '<h1>\\s*ねこの写真\\s*</h1>', msg: '<h1>ねこの写真</h1> がまだありません。' },
      { re: '<img\\s[^>]*src\\s*=\\s*"img/cat\\.svg"', msg: 'ねこの画像（src="img/cat.svg"）がまだありません。' },
      { re: '<img\\s[^>]*alt\\s*=\\s*"[^"]+"', msg: 'alt="…" を忘れずに書きましょう。' },
    ],
  },
  {
    task: 'p で「お店の看板ねこです。」と書き、その下に alt「看板ねこ」で画像をのせましょう。',
    hint: '<p>お店の看板ねこです。</p> と <img src="img/cat.svg" alt="看板ねこ"> の2行です。',
    sample: '<p>お店の看板ねこです。</p>\n<img src="img/cat.svg" alt="看板ねこ">',
    checks: [
      { re: '<p>\\s*お店の看板ねこです。?\\s*</p>', msg: '<p>お店の看板ねこです。</p> がまだありません。' },
      { re: '<img\\s[^>]*alt\\s*=\\s*"看板ねこ"', msg: 'alt="看板ねこ" で画像の説明を書きましょう。' },
      { re: '<img\\s[^>]*src\\s*=\\s*"img/cat\\.svg"', msg: 'src="img/cat.svg" がまだありません。' },
    ],
  },
]);

registerDrills('html-05', [
  {
    task: 'ul と li で、「りんご」「みかん」の箇条書きを作りましょう。',
    hint: '<ul> の中に <li>りんご</li> と <li>みかん</li> を書いて、</ul> で閉じます。',
    starter: '<ul>\n  \n</ul>',
    sample: '<ul>\n  <li>りんご</li>\n  <li>みかん</li>\n</ul>',
    checks: [
      { re: '<ul>[\\s\\S]*</ul>', msg: '<ul> と </ul> で包みましょう。' },
      { re: '<li>\\s*りんご\\s*</li>', msg: '<li>りんご</li> がまだありません。' },
      { re: '<li>\\s*みかん\\s*</li>', msg: '<li>みかん</li> がまだありません。' },
    ],
  },
  {
    task: 'ol と li で、手順「電源を切る」「コードを抜く」「ほこりをふく」を番号つきで書きましょう。',
    hint: '順番が大事なので ol を使います。li を3つ書きます。',
    sample: '<ol>\n  <li>電源を切る</li>\n  <li>コードを抜く</li>\n  <li>ほこりをふく</li>\n</ol>',
    checks: [
      { re: '<ol>[\\s\\S]*</ol>', msg: '<ol> と </ol> で包みましょう。' },
      { re: '<li>\\s*電源を切る\\s*</li>', msg: '<li>電源を切る</li> がまだありません。' },
      { re: '<li>\\s*コードを抜く\\s*</li>', msg: '<li>コードを抜く</li> がまだありません。' },
      { re: '<li>\\s*ほこりをふく\\s*</li>', msg: '<li>ほこりをふく</li> がまだありません。' },
    ],
    done: '番号は、ブラウザが自動でつけてくれましたね。',
  },
  {
    task: 'h2 で「人気の商品」と書き、その下に ul で「テレビ」「冷蔵庫」の箇条書きを作りましょう。',
    hint: '<h2>人気の商品</h2> の下に、<ul> と <li> を書きます。',
    sample: '<h2>人気の商品</h2>\n<ul>\n  <li>テレビ</li>\n  <li>冷蔵庫</li>\n</ul>',
    checks: [
      { re: '<h2>\\s*人気の商品\\s*</h2>', msg: '<h2>人気の商品</h2> がまだありません。' },
      { re: '<ul>[\\s\\S]*<li>\\s*テレビ\\s*</li>[\\s\\S]*<li>\\s*冷蔵庫\\s*</li>[\\s\\S]*</ul>', msg: 'ul の中に、<li>テレビ</li> と <li>冷蔵庫</li> を書きましょう。' },
    ],
  },
  {
    task: '買い取りの手順は順番が大事です。下の箇条書きを、番号つきのリストに直しましょう。',
    hint: '<ul> を <ol> に、</ul> を </ol> に変えます。li はそのままで大丈夫です。',
    starter: '<ul>\n  <li>受付</li>\n  <li>査定</li>\n  <li>お支払い</li>\n</ul>',
    sample: '<ol>\n  <li>受付</li>\n  <li>査定</li>\n  <li>お支払い</li>\n</ol>',
    checks: [
      { re: '^(?![\\s\\S]*<\\/?ul)', msg: '<ul> と </ul> を、<ol> と </ol> に変えましょう。' },
      { re: '<ol>[\\s\\S]*</ol>', msg: '<ol> と </ol> で包みましょう。' },
      { re: '<li>\\s*受付\\s*</li>[\\s\\S]*<li>\\s*査定\\s*</li>[\\s\\S]*<li>\\s*お支払い\\s*</li>', msg: 'li の3つ（受付・査定・お支払い）は、そのまま残しましょう。' },
    ],
    done: 'ul を ol に変えるだけで、番号つきになりました。',
  },
]);

registerDrills('html-06', [
  {
    task: '「送信する」と書かれたボタンを作りましょう。',
    hint: '<button>送信する</button> と打ちます。',
    sample: '<button>送信する</button>',
    checks: [
      { re: '<button[^>]*>\\s*送信する\\s*</button>', msg: '「送信する」を <button> と </button> ではさみましょう。' },
    ],
  },
  {
    task: 'type="button" をつけて、「カートに入れる」ボタンを作りましょう。',
    hint: '<button type="button">カートに入れる</button>',
    sample: '<button type="button">カートに入れる</button>',
    checks: [
      { re: '<button\\s+type\\s*=\\s*"button"\\s*>', msg: '<button type="button"> の形で始めましょう。' },
      { re: '>\\s*カートに入れる\\s*</button>', msg: '「カートに入れる」を、始まりのタグと </button> ではさみましょう。' },
    ],
  },
  {
    task: 'p で「ご注文はこちら」と書き、その下に「注文する」ボタンを作りましょう。',
    hint: '<p>ご注文はこちら</p> の次の行に <button>注文する</button> を書きます。',
    sample: '<p>ご注文はこちら</p>\n<button type="button">注文する</button>',
    checks: [
      { re: '<p>\\s*ご注文はこちら\\s*</p>', msg: '<p>ご注文はこちら</p> がまだありません。' },
      { re: '<button[^>]*>\\s*注文する\\s*</button>', msg: '「注文する」ボタンがまだありません。' },
    ],
  },
  {
    task: '「はい」と「いいえ」の、2つのボタンを作りましょう。',
    hint: 'button タグを2つ書きます。',
    sample: '<button type="button">はい</button>\n<button type="button">いいえ</button>',
    checks: [
      { re: '<button[^>]*>\\s*はい\\s*</button>', msg: '「はい」のボタンがまだありません。' },
      { re: '<button[^>]*>\\s*いいえ\\s*</button>', msg: '「いいえ」のボタンがまだありません。' },
    ],
    done: '押しても何も起きないのは正しい動きです。動きは JavaScript の回で足します。',
  },
]);

registerDrills('html-07', [
  {
    task: 'h1 で自分の名前、p で好きな食べ物を書きましょう。',
    hint: '<h1>名前</h1> と <p>好きな食べ物は、〇〇です。</p> の2行です。',
    sample: '<h1>たつやです</h1>\n<p>好きな食べ物は、ラーメンです。</p>',
    checks: [
      { re: filled('h1'), msg: '<h1> と </h1> のあいだに、名前を入れましょう。' },
      { re: filled('p'), msg: '<p> と </p> のあいだに、好きな食べ物を書きましょう。' },
    ],
  },
  {
    task: 'h2 で「好きなこと」と書き、その下に ul で好きなことを3つ書きましょう。',
    hint: '<h2>好きなこと</h2> の下に、<ul> と <li> を3つ書きます。',
    sample: '<h2>好きなこと</h2>\n<ul>\n  <li>動画づくり</li>\n  <li>散歩</li>\n  <li>競馬</li>\n</ul>',
    checks: [
      { re: '<h2>\\s*好きなこと\\s*</h2>', msg: '<h2>好きなこと</h2> がまだありません。' },
      { re: '<ul>[\\s\\S]*</ul>', msg: '<ul> と </ul> で包みましょう。' },
      { re: `(${filled('li')}[\\s\\S]*){3}`, msg: '<li> の中に、好きなことを3つ入れましょう。' },
    ],
  },
  {
    task: 'h1 で名前、その下にねこの画像、さらにその下に p でひとことを書きましょう。',
    hint: '<h1> → <img src="img/cat.svg" alt="…"> → <p> の順に書きます。',
    sample: '<h1>たつやです</h1>\n<img src="img/cat.svg" alt="ねこ">\n<p>よろしくお願いします。</p>',
    checks: [
      { re: filled('h1'), msg: '<h1> と </h1> のあいだに、名前を入れましょう。' },
      { re: '<img\\s[^>]*src\\s*=\\s*"img/cat\\.svg"', msg: 'ねこの画像（src="img/cat.svg"）がまだありません。' },
      { re: '<img\\s[^>]*alt\\s*=\\s*"[^"]+"', msg: 'alt="…" を忘れずに書きましょう。' },
      { re: filled('p'), msg: '<p> と </p> のあいだに、ひとことを書きましょう。' },
    ],
  },
  {
    task: '自己紹介の最後に、「わたしのページ」という、https://example.com へのリンクを p の中に入れましょう。',
    hint: '<p><a href="https://example.com">わたしのページ</a></p>',
    starter: '<h1>たつやです</h1>\n<p>リサイクルのお店で働いています。</p>\n',
    sample: '<h1>たつやです</h1>\n<p>リサイクルのお店で働いています。</p>\n<p><a href="https://example.com">わたしのページ</a></p>',
    checks: [
      { re: '<p>\\s*<a\\s+href\\s*=\\s*"https://example\\.com/?"\\s*>\\s*わたしのページ\\s*</a>\\s*</p>', msg: '<p><a href="https://example.com">わたしのページ</a></p> の形で書きましょう。' },
    ],
    done: '見出し・文章・リストにリンクまで、ひとりで書けるようになりました！',
  },
]);
