// 英単語のコース（20回・160語）
//   日常：第1〜10回（第1〜3回は、会話・語順の回に出てくる単語）
//   コード：第11〜16回（HTMLの回・エラー画面でよく見る単語）
//   お店：第17〜20回（リサイクルショップの売り場の言葉）
//
// 書き方：1語は [英語, 意味, 英語の例文, 例文の意味]。1回8語。
// 「短い問題」は、lessons/catalog.js の makeVocabQuiz が単語から自動で作ります。
// 単語を足したり直したりしたら、声のファイルも作り直しが必要です（クレアさんにお願いする）。

(function () {
  const lesson = (no, group, title, goal, list) => registerLesson({
    id: `vocab-${String(no).padStart(2, '0')}`,
    course: 'vocab',
    no,
    group,
    title: `${group}：${title}`,
    goal,
    words: list.map(([en, ja, ex, exJa]) => ({ en, ja, ex, exJa })),
  });

  // ---- 日常 ----
  lesson(1, '日常', '会話と語順に出る「動き」', '会話や語順の回に出てくる、動きを表す単語を先に覚える', [
    ['like', '好き（好む）', 'I like coffee.', 'わたしはコーヒーが好きです。'],
    ['eat', '食べる', 'I eat rice every day.', 'わたしは毎日ごはんを食べます。'],
    ['buy', '買う', 'I want to buy a jacket.', 'ジャケットを買いたいです。'],
    ['sell', '売る', 'We sell used furniture.', 'わたしたちは中古の家具を売っています。'],
    ['watch', '見る（じっと見る）', 'I watch TV at night.', 'わたしは夜にテレビを見ます。'],
    ['drive', '運転する', 'I drive to work.', 'わたしは車で仕事に行きます。'],
    ['work', '働く', 'I work at a shop.', 'わたしはお店で働いています。'],
    ['study', '勉強する', 'I study English in the car.', 'わたしは車の中で英語を勉強します。'],
  ]);

  lesson(2, '日常', '買い物と食事の会話に出る単語', '会話の回（買い物・食事）に出てくる単語を先に覚える', [
    ['help', '手伝う', 'Can I help you?', '何かお手伝いしましょうか？'],
    ['look for', '探す', "I'm looking for a bag.", 'かばんを探しています。'],
    ['try on', '試着する', 'Can I try it on?', '試着してもいいですか？'],
    ['pay', '払う', 'Can I pay by card?', 'カードで払えますか？'],
    ['recommend', 'すすめる', 'What do you recommend?', 'おすすめは何ですか？'],
    ['drink', '飲み物・飲む', 'Anything to drink?', '飲み物はいかがですか？'],
    ['menu', 'メニュー', 'Here is the menu.', 'こちらがメニューです。'],
    ['check', 'お会計・確認する', 'Can I have the check?', 'お会計をお願いします。'],
  ]);

  lesson(3, '日常', 'ようすと時間の単語', '会話や語順の回に出てくる、ようすや時間の単語を先に覚える', [
    ['cheap', '安い', 'This shirt is cheap.', 'このシャツは安いです。'],
    ['new', '新しい', 'This TV is new.', 'このテレビは新しいです。'],
    ['nice', 'すてきな・いい', 'This is a nice table.', 'これはすてきなテーブルです。'],
    ['popular', '人気の', 'This game is very popular.', 'このゲームはとても人気です。'],
    ['delicious', 'おいしい', 'The pasta was delicious.', 'パスタはとてもおいしかったです。'],
    ['weekend', '週末', 'We are busy on the weekend.', '週末は忙しいです。'],
    ['every day', '毎日', 'I walk my dog every day.', 'わたしは毎日、犬の散歩をします。'],
    ['morning', '朝', 'I study English every morning.', 'わたしは毎朝、英語を勉強します。'],
  ]);

  lesson(4, '日常', '基本の動き①', 'よく使う動きの単語を覚える', [
    ['go', '行く', 'I go to work by car.', 'わたしは車で仕事に行きます。'],
    ['come', '来る', 'Please come again.', 'またお越しください。'],
    ['get', '手に入れる・もらう', 'I got a new phone.', '新しいスマホを手に入れました。'],
    ['make', '作る', 'I make videos on weekends.', 'わたしは週末に動画を作ります。'],
    ['use', '使う', 'Can I use this pen?', 'このペンを使ってもいいですか？'],
    ['know', '知っている', 'I know this song.', 'この歌を知っています。'],
    ['want', 'ほしい', 'I want a cup of coffee.', 'コーヒーが1杯ほしいです。'],
    ['need', '必要とする', 'I need your help.', 'あなたの助けが必要です。'],
  ]);

  lesson(5, '日常', '基本の動き②', '見る・聞く・話すなどの単語を覚える', [
    ['see', '見える・会う', 'See you tomorrow.', 'また明日ね。'],
    ['hear', '聞こえる', 'Can you hear me?', 'わたしの声が聞こえますか？'],
    ['say', '言う', 'Please say it again.', 'もう一度言ってください。'],
    ['tell', '伝える・教える', 'Please tell me the price.', '値段を教えてください。'],
    ['ask', 'たずねる', 'Can I ask a question?', '質問してもいいですか？'],
    ['answer', '答える・答え', 'I know the answer.', 'わたしは答えを知っています。'],
    ['open', '開ける', 'Please open the door.', 'ドアを開けてください。'],
    ['close', '閉める', 'Please close the window.', '窓を閉めてください。'],
  ]);

  lesson(6, '日常', 'ようすを表す言葉', '大きい・古い・忙しいなど、ようすを表す単語を覚える', [
    ['big', '大きい', 'This sofa is too big.', 'このソファは大きすぎます。'],
    ['small', '小さい', 'Do you have a small bag?', '小さいかばんはありますか？'],
    ['old', '古い', 'This clock is very old.', 'この時計はとても古いです。'],
    ['good', 'よい', 'This is a good price.', 'これはいい値段です。'],
    ['bad', '悪い', 'The weather is bad today.', '今日は天気が悪いです。'],
    ['easy', 'かんたんな', 'This question is easy.', 'この問題はかんたんです。'],
    ['difficult', 'むずかしい', 'English is a little difficult.', '英語は少しむずかしいです。'],
    ['busy', '忙しい', 'I am busy today.', '今日は忙しいです。'],
  ]);

  lesson(7, '日常', '時間の言葉', '今日・明日・あとで など、時間の単語を覚える', [
    ['today', '今日', 'The shop is open today.', 'お店は今日、開いています。'],
    ['tomorrow', '明日', 'See you tomorrow.', 'また明日ね。'],
    ['yesterday', '昨日', 'I was tired yesterday.', '昨日は疲れていました。'],
    ['now', '今', 'I am busy now.', '今、忙しいです。'],
    ['later', 'あとで', "I'll call you later.", 'あとで電話しますね。'],
    ['early', '早い・早く', 'I get up early.', 'わたしは早く起きます。'],
    ['late', '遅い・遅れて', "Sorry, I'm late.", '遅れてごめんなさい。'],
    ['week', '週', 'I work five days a week.', 'わたしは週に5日働きます。'],
  ]);

  lesson(8, '日常', '場所と方向の言葉', 'ここ・近く・右 など、場所と方向の単語を覚える', [
    ['here', 'ここ', 'Please wait here.', 'ここでお待ちください。'],
    ['there', 'そこ・あそこ', 'The fitting room is over there.', '試着室はあちらです。'],
    ['near', '近くに', 'The shop is near the station.', 'お店は駅の近くです。'],
    ['far', '遠い', 'My house is not far.', 'わたしの家は遠くありません。'],
    ['left', '左', 'Turn left at the corner.', '角を左に曲がってください。'],
    ['right', '右', 'The bags are on the right.', 'かばんは右にあります。'],
    ['front', '前', 'Please come to the front.', '前のほうへどうぞ。'],
    ['inside', '中に・中で', 'Please wait inside.', '中でお待ちください。'],
  ]);

  lesson(9, '日常', '身の回りの言葉', '家族・友だち・車 など、身の回りの単語を覚える', [
    ['family', '家族', 'I live with my family.', 'わたしは家族と住んでいます。'],
    ['friend', '友だち', 'He is my friend.', '彼はわたしの友だちです。'],
    ['dog', '犬', 'My dog Anko is cute.', 'うちの犬のあんこは、かわいいです。'],
    ['home', '家', 'I go home at seven.', 'わたしは7時に家に帰ります。'],
    ['car', '車', 'I listen to English in the car.', 'わたしは車の中で英語を聞きます。'],
    ['phone', 'スマホ・電話', 'I study on my phone.', 'わたしはスマホで勉強します。'],
    ['money', 'お金', 'I want to save money.', 'お金をためたいです。'],
    ['time', '時間', 'What time is it?', '今、何時ですか？'],
  ]);

  lesson(10, '日常', '会話でよく使う一言', 'ありがとう・ごめんなさい など、会話でよく使う言葉を覚える', [
    ['thank you', 'ありがとう', 'Thank you very much.', 'どうもありがとうございます。'],
    ['sorry', 'ごめんなさい', "I'm sorry for the wait.", 'お待たせしてすみません。'],
    ['please', 'お願いします・どうぞ', 'Two coffees, please.', 'コーヒーを2つお願いします。'],
    ['sure', 'もちろん', 'Sure, no problem.', 'もちろん、大丈夫ですよ。'],
    ['maybe', 'たぶん', 'Maybe tomorrow.', 'たぶん明日です。'],
    ['really', '本当に', 'It was really fun.', '本当に楽しかったです。'],
    ['happy', 'うれしい', "I'm happy to see you.", 'お会いできてうれしいです。'],
    ['tired', '疲れた', "I'm a little tired today.", '今日は少し疲れています。'],
  ]);

  // ---- コード ----
  lesson(11, 'コード', 'ページの骨組みの単語', 'HTMLの骨組みに出てくる単語を覚える', [
    ['page', 'ページ', 'This page is in Japanese.', 'このページは日本語です。'],
    ['head', '頭・先頭', 'The title goes in the head.', 'タイトルは head に入ります。'],
    ['body', '体・本文', 'Write the text in the body.', '文字は body の中に書きます。'],
    ['title', '題名', 'The title is shown on the tab.', 'タイトルはタブに表示されます。'],
    ['tag', '目印・札', 'Close the tag with a slash.', 'スラッシュでタグを閉じます。'],
    ['start', '始まり・始める', 'This is the start tag.', 'これは始まりのタグです。'],
    ['end', '終わり', 'This is the end tag.', 'これは終わりのタグです。'],
    ['content', '中身', 'The content goes between the tags.', '中身はタグのあいだに入ります。'],
  ]);

  lesson(12, 'コード', '文章と一覧の単語', '見出し・段落・リストに出てくる単語を覚える', [
    ['text', '文字・文章', 'The text is too small.', '文字が小さすぎます。'],
    ['heading', '見出し', 'Add a heading to the page.', 'ページに見出しをつけましょう。'],
    ['paragraph', '段落', 'Write one paragraph.', '段落を1つ書きましょう。'],
    ['line', '行・線', 'Check the first line.', '最初の行を確認してください。'],
    ['list', '一覧', 'Make a list of items.', '商品の一覧を作りましょう。'],
    ['item', '項目・品物', 'This item is popular.', 'この品物は人気です。'],
    ['order', '順番・注文', 'Put them in order.', '順番に並べてください。'],
    ['number', '番号・数', 'The numbers are added automatically.', '番号は自動でつきます。'],
  ]);

  lesson(13, 'コード', 'リンク・画像・ボタンの単語', 'リンク・画像・ボタンの回に出てくる単語を覚える', [
    ['link', 'リンク・つなぐもの', 'Click the link.', 'リンクを押してください。'],
    ['image', '画像', 'Upload the product image.', '商品の画像をアップロードしてください。'],
    ['source', '出どころ・元', 'Write the source of the image.', '画像の場所を書きましょう。'],
    ['button', 'ボタン', 'Press the blue button.', '青いボタンを押してください。'],
    ['click', 'クリックする・押す', 'Click here to start.', 'ここを押すと始まります。'],
    ['width', '幅', 'Set the width to 100.', '幅を100にしましょう。'],
    ['height', '高さ', 'Check the height of the shelf.', '棚の高さを確認してください。'],
    ['size', '大きさ・サイズ', 'What size is this jacket?', 'このジャケットのサイズは何ですか？'],
  ]);

  lesson(14, 'コード', 'ファイルとフォルダの単語', 'パソコンでファイルを扱うときの単語を覚える', [
    ['file', 'ファイル', 'Open the file.', 'ファイルを開いてください。'],
    ['folder', 'フォルダ', 'Put the file in this folder.', 'ファイルをこのフォルダに入れてください。'],
    ['save', '保存する', "Don't forget to save.", '保存を忘れないでね。'],
    ['copy', 'コピー・写す', 'Copy this text.', 'この文字をコピーしてください。'],
    ['delete', '消す', 'Delete the old file.', '古いファイルを消してください。'],
    ['name', '名前', 'Change the file name.', 'ファイルの名前を変えてください。'],
    ['type', '種類・打つ', 'What type of file is this?', 'これは何の種類のファイルですか？'],
    ['download', 'ダウンロードする', 'Download the app.', 'アプリをダウンロードしてください。'],
  ]);

  lesson(15, 'コード', 'エラー画面でよく見る単語', 'エラーや通知の画面でよく見る単語を覚える', [
    ['error', 'エラー・まちがい', 'There is an error on this page.', 'このページにエラーがあります。'],
    ['warning', '注意・警告', 'Read the warning first.', '先に注意を読んでください。'],
    ['not found', '見つからない', 'The page was not found.', 'ページが見つかりませんでした。'],
    ['failed', '失敗した', 'The upload failed.', 'アップロードに失敗しました。'],
    ['success', '成功', 'The update was a success.', '更新は成功しました。'],
    ['fix', '直す', 'Can you fix this error?', 'このエラーを直せますか？'],
    ['update', '更新する・更新', 'Please update the app.', 'アプリを更新してください。'],
    ['loading', '読みこみ中', 'The page is loading.', 'ページを読みこみ中です。'],
  ]);

  lesson(16, 'コード', 'プログラムの言葉', 'プログラムでよく使う基本の単語を覚える', [
    ['value', '値', 'Change the value to 10.', '値を10に変えてください。'],
    ['function', '関数（決まった仕事をする命令のまとまり）', 'This function plays the sound.', 'この関数は音を鳴らします。'],
    ['data', 'データ', 'The data is saved on the phone.', 'データはスマホに保存されます。'],
    ['input', '入力', 'Type your name in the input box.', '入力欄に名前を打ってください。'],
    ['output', '出力', 'Check the output.', '出てきた結果を確認してください。'],
    ['true', '正しい', 'The answer is true.', '答えは正しいです。'],
    ['false', 'まちがい（正しくない）', 'This is false.', 'これはまちがいです。'],
    ['version', '版・バージョン', 'This is version seven.', 'これは第7版です。'],
  ]);

  // ---- お店 ----
  lesson(17, 'お店', '値段と会計', '値段やお会計で使う単語を覚える', [
    ['price', '値段', 'What is the price of this lamp?', 'このランプの値段はいくらですか？'],
    ['discount', '割引', 'This item has a discount.', 'この品物は割引中です。'],
    ['total', '合計', 'The total is 3,000 yen.', '合計は3000円です。'],
    ['change', 'おつり・変える', 'Here is your change.', 'おつりです。'],
    ['receipt', 'レシート', 'Do you need a receipt?', 'レシートはいりますか？'],
    ['cash', '現金', 'Cash or card?', '現金ですか、カードですか？'],
    ['card', 'カード', 'We accept cards.', 'カードが使えます。'],
    ['tax', '税・消費税', 'The price includes tax.', 'この値段は税込みです。'],
  ]);

  lesson(18, 'お店', '商品の状態', '中古品の状態を伝えるときの単語を覚える', [
    ['used', '中古の', 'This is a used camera.', 'これは中古のカメラです。'],
    ['condition', '状態', 'The condition is very good.', '状態はとてもいいです。'],
    ['scratch', '傷', 'There is a small scratch here.', 'ここに小さな傷があります。'],
    ['broken', 'こわれた', 'This lamp is broken.', 'このランプはこわれています。'],
    ['clean', 'きれいな', 'The inside is very clean.', '中はとてもきれいです。'],
    ['working', '動く・使える', 'We checked that it is working.', '動くことを確認しました。'],
    ['brand', 'ブランド・メーカー', 'What brand is this bag?', 'このかばんはどのブランドですか？'],
    ['box', '箱', 'It comes with the original box.', '元の箱がついています。'],
  ]);

  lesson(19, 'お店', '売り場の言葉', '売り場やお店の仕事で使う単語を覚える', [
    ['shelf', '棚', 'The games are on that shelf.', 'ゲームはあの棚にあります。'],
    ['stock', '在庫', 'We have it in stock.', '在庫があります。'],
    ['sale', 'セール', 'The sale starts tomorrow.', 'セールは明日からです。'],
    ['staff', 'スタッフ・店員', 'Please ask our staff.', 'スタッフにおたずねください。'],
    ['customer', 'お客さん', 'The customer is waiting.', 'お客さんが待っています。'],
    ['counter', 'カウンター・レジ', 'Please pay at the counter.', 'レジでお支払いください。'],
    ['opening hours', '営業時間', 'Our opening hours are ten to seven.', '営業時間は10時から7時です。'],
    ['closed', '閉店した・閉まっている', 'We are closed on Wednesdays.', '水曜日は定休日です。'],
  ]);

  lesson(20, 'お店', 'お客さんへの一言', 'お客さんに声をかけるときの単語を覚える', [
    ['welcome', 'いらっしゃいませ・ようこそ', 'Welcome to our shop.', 'いらっしゃいませ。'],
    ['wait', '待つ', 'Please wait a moment.', '少々お待ちください。'],
    ['minute', '分', 'It takes five minutes.', '5分かかります。'],
    ['bag', '袋・かばん', 'Do you need a bag?', '袋はいりますか？'],
    ['return', '返品する・返す', 'You can return it within a week.', '1週間以内なら返品できます。'],
    ['exchange', '交換する', 'Can I exchange this?', 'これを交換できますか？'],
    ['warranty', '保証', 'It has a three-month warranty.', '3か月の保証がついています。'],
    ['again', 'また・もう一度', 'Please come again.', 'またお越しください。'],
  ]);
})();
