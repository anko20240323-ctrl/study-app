// 英単語のコース（40回・320語）
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
    // 5つ目にカタカナの読みを書いてもよい（書かなければ lessons/kana.js から）
    words: list.map(([en, ja, ex, exJa, kana]) => ({ en, ja, ex, exJa, kana })),
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
    ['delicious', 'おいしい', 'The pasta was delicious.', 'パスタはおいしかったです。'],
    ['weekend', '週末', 'We are busy on the weekend.', '週末は忙しいです。'],
    ['every day', '毎日', 'I walk my dog every day.', 'わたしは毎日、犬の散歩をします。'],
    ['morning', '朝', 'I study English every morning.', 'わたしは毎朝、英語を勉強します。'],
  ]);

  lesson(4, '日常', '基本の動き①', 'よく使う動きの単語を覚える', [
    ['go', '行く', 'I go to work at eight.', 'わたしは8時に仕事に行きます。'],
    ['come', '来る', 'Can you come tomorrow?', '明日、来られますか？'],
    ['get', '手に入れる・もらう', 'Can I get a receipt?', 'レシートをもらえますか？'],
    ['make', '作る', 'I make videos on weekends.', 'わたしは週末に動画を作ります。'],
    ['use', '使う', 'Can I use this pen?', 'このペンを使ってもいいですか？'],
    ['know', '知っている', 'I know this song.', 'この歌を知っています。'],
    ['want', 'ほしい', 'I want a cup of coffee.', 'コーヒーが1杯ほしいです。'],
    ['need', '必要とする', 'I need your help.', 'あなたの助けが必要です。'],
  ]);

  lesson(5, '日常', '基本の動き②', '見る・聞く・話すなどの単語を覚える', [
    ['see', '見える・会う', 'Can you see that sign?', 'あの看板が見えますか？'],
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
    ['good', 'よい', 'This is a good bag.', 'これはいいかばんです。'],
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
    ['source', '出どころ・元', 'Check the source of the image.', '画像の元（どこにあるか）を確認してください。'],
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
    ['success', '成功', 'The update was a success.', '更新は成功でした。'],
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
    ['true', '正しい', 'This sentence is true.', 'この文は正しいです。'],
    ['false', 'まちがい（正しくない）', 'That sentence is false.', 'その文はまちがいです。'],
    ['version', '版・バージョン', 'This is version eight.', 'これは第8版です。'],
  ]);

  // ---- お店 ----
  lesson(17, 'お店', '値段と会計', '値段やお会計で使う単語を覚える', [
    ['price', '値段', 'What is the price of this lamp?', 'このランプの値段はいくらですか？'],
    ['discount', '割引', 'Is there a discount?', '割引はありますか？'],
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
    ['opening hours', '営業時間', 'Our opening hours are from ten to seven.', '営業時間は10時から7時です。'],
    ['closed', '閉まっている・休み', 'We are closed on Wednesdays.', '水曜日は定休日です。'],
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
  // ================================================================
  // ここから第21〜40回（2026-11-02 追加：日常8・お店と仕事4・車と移動2・コード4・競馬2）
  // 5つ目がカタカナの読み
  // ================================================================

  // ---- 日常（第21〜28回）----
  lesson(21, '日常', '毎日の動き①', '起きる・寝る・料理する など、毎日の動きの単語を覚える', [
    ['wake up', '起きる・目がさめる', 'I wake up at six.', 'わたしは6時に起きます。', 'ウェイク アップ'],
    ['sleep', '寝る', 'I sleep well at night.', '夜はよく眠れます。', 'スリープ'],
    ['cook', '料理する', 'I cook dinner on Sundays.', '日曜日は晩ごはんを作ります。', 'クック'],
    ['wash', '洗う', 'Please wash your hands.', '手を洗ってください。', 'ウォッシュ'],
    ['walk', '歩く・散歩する', 'I walk Anko in the morning.', '朝、あんこの散歩をします。', 'ウォーク'],
    ['run', '走る', 'My dog likes to run.', 'うちの犬は走るのが好きです。', 'ラン'],
    ['sit', 'すわる', 'Please sit here.', 'ここにおすわりください。', 'シット'],
    ['stand', '立つ', 'Please stand in line.', '列に並んでください。', 'スタンド'],
  ]);

  lesson(22, '日常', '毎日の動き②', '読む・書く・話す・送る など、伝えるときの単語を覚える', [
    ['read', '読む', 'I read the news on my phone.', 'スマホでニュースを読みます。', 'リード'],
    ['write', '書く', 'Please write your name here.', 'ここにお名前を書いてください。', 'ライト'],
    ['listen', '聞く（耳をかたむける）', 'I listen to English in the car.', '車の中で英語を聞きます。', 'リッスン'],
    ['speak', '話す', 'Do you speak Japanese?', '日本語を話せますか？', 'スピーク'],
    ['call', '電話する・呼ぶ', 'I will call you tonight.', '今夜、電話しますね。', 'コール'],
    ['send', '送る', 'Please send me the photo.', 'その写真を送ってください。', 'センド'],
    ['bring', '持ってくる', 'Please bring your receipt.', 'レシートを持ってきてください。', 'ブリング'],
    ['carry', '運ぶ・持ち歩く', 'Can you carry this box?', 'この箱を運べますか？', 'キャリー'],
  ]);

  lesson(23, '日常', '考える・感じる', '思う・忘れる・わかる など、頭や心の動きの単語を覚える', [
    ['think', '思う・考える', 'I think so too.', 'わたしもそう思います。', 'シンク'],
    ['feel', '感じる', 'I feel good today.', '今日は気分がいいです。', 'フィール'],
    ['remember', '覚えている・思い出す', 'I remember his name.', '彼の名前を覚えています。', 'リメンバー'],
    ['forget', '忘れる', "Don't forget your bag.", 'かばんを忘れないでね。', 'フォゲット'],
    ['understand', 'わかる・理解する', 'I understand now.', '今、わかりました。', 'アンダースタンド'],
    ['believe', '信じる', 'I believe in you.', 'あなたを信じています。', 'ビリーブ'],
    ['hope', '望む・願う', 'I hope you like it.', '気に入ってもらえるとうれしいです。', 'ホープ'],
    ['worry', '心配する', "Don't worry about it.", '心配しないでね。', 'ウォーリー'],
  ]);

  lesson(24, '日常', 'ようすを表す言葉②', '暑い・速い・重い など、ようすを表す単語を覚える', [
    ['hot', '暑い・熱い', "It's hot today.", '今日は暑いです。', 'ホット'],
    ['cold', '寒い・冷たい', 'This water is cold.', 'この水は冷たいです。', 'コールド'],
    ['fast', '速い', 'This car is very fast.', 'この車はとても速いです。', 'ファスト'],
    ['slow', 'ゆっくりした・遅い（速さ）', 'Please speak slowly.', 'ゆっくり話してください。', 'スロー'],
    ['heavy', '重い', 'This sofa is heavy.', 'このソファは重いです。', 'ヘビー'],
    ['light', '軽い・明かり', 'This chair is light.', 'このいすは軽いです。', 'ライト'],
    ['long', '長い', 'It was a long day.', '長い一日でした。', 'ロング'],
    ['short', '短い', 'This cable is too short.', 'このケーブルは短すぎます。', 'ショート'],
  ]);

  lesson(25, '日常', '気持ちの言葉②', '悲しい・おどろいた・眠い など、気持ちの単語を覚える', [
    ['glad', 'よかった・うれしい', "I'm glad to hear that.", 'それを聞いてよかったです。', 'グラッド'],
    ['sad', '悲しい', 'The movie was sad.', 'その映画は悲しかったです。', 'サッド'],
    ['angry', '怒った', "Please don't be angry.", '怒らないでください。', 'アングリー'],
    ['excited', 'わくわくした', "I'm excited about the race.", 'レースが楽しみです。', 'エキサイテッド'],
    ['worried', '心配した', "I'm worried about the weather.", '天気が心配です。', 'ウォーリード'],
    ['surprised', 'おどろいた', 'I was surprised by the price.', '値段におどろきました。', 'サプライズド'],
    ['bored', '退屈した', "I'm never bored with Anko.", 'あんこといると退屈しません。', 'ボアード'],
    ['sleepy', '眠い', "I'm sleepy this morning.", '今朝は眠いです。', 'スリーピー'],
  ]);

  lesson(26, '日常', '回数と時間の言葉', 'いつも・ときどき・もうすぐ など、回数や時間の単語を覚える', [
    ['always', 'いつも', 'I always drink coffee in the morning.', '朝はいつもコーヒーを飲みます。', 'オールウェイズ'],
    ['usually', 'ふだんは', 'I usually get home at seven.', 'ふだんは7時に家に帰ります。', 'ユージュアリー'],
    ['sometimes', 'ときどき', 'I sometimes watch horse races.', 'ときどき競馬を見ます。', 'サムタイムズ'],
    ['never', '一度も〜ない', 'I never forget my phone.', 'スマホは絶対に忘れません。', 'ネバー'],
    ['often', 'よく（何度も）', 'We often have sales.', 'うちはよくセールをします。', 'オフン'],
    ['once', '一度・1回', 'I go to the bank once a week.', '週に1回、銀行に行きます。', 'ワンス'],
    ['twice', '二度・2回', 'I walk my dog twice a day.', '1日に2回、犬の散歩をします。', 'トワイス'],
    ['soon', 'もうすぐ', 'The sale will start soon.', 'セールはもうすぐ始まります。', 'スーン'],
  ]);

  lesson(27, '日常', '天気と季節', '雨・晴れ・雪・夏 など、天気と季節の単語を覚える', [
    ['weather', '天気', 'How is the weather today?', '今日の天気はどうですか？', 'ウェザー'],
    ['rain', '雨・雨がふる', "It's going to rain.", '雨がふりそうです。', 'レイン'],
    ['sunny', '晴れた', "It's sunny today.", '今日は晴れています。', 'サニー'],
    ['cloudy', 'くもった', "It's cloudy this morning.", '今朝はくもっています。', 'クラウディ'],
    ['wind', '風', 'The wind is strong today.', '今日は風が強いです。', 'ウィンド'],
    ['snow', '雪・雪がふる', 'It rarely snows here.', 'ここではめったに雪がふりません。', 'スノー'],
    ['summer', '夏', 'Summer in Fukuoka is hot.', '福岡の夏は暑いです。', 'サマー'],
    ['winter', '冬', 'Heaters sell well in winter.', '冬はヒーターがよく売れます。', 'ウィンター'],
  ]);

  lesson(28, '日常', '食事の言葉', '朝ごはん・パン・お茶 など、食事の単語を覚える', [
    ['breakfast', '朝ごはん', 'I eat breakfast at seven.', '7時に朝ごはんを食べます。', 'ブレックファスト'],
    ['lunch', '昼ごはん', "Let's have lunch together.", 'いっしょにお昼ごはんを食べましょう。', 'ランチ'],
    ['dinner', '晩ごはん', 'What do you want for dinner?', '晩ごはんは何がいい？', 'ディナー'],
    ['rice', 'ごはん・米', 'I eat rice every day.', '毎日ごはんを食べます。', 'ライス'],
    ['bread', 'パン', 'I had bread this morning.', '今朝はパンを食べました。', 'ブレッド'],
    ['water', '水', 'Can I have some water?', 'お水をもらえますか？', 'ウォーター'],
    ['tea', 'お茶・紅茶', 'Would you like some tea?', 'お茶はいかがですか？', 'ティー'],
    ['hungry', 'おなかがすいた', "I'm hungry.", 'おなかがすきました。', 'ハングリー'],
  ]);

  // ---- お店・仕事（第29〜32回）----
  lesson(29, 'お店', '買い取りの言葉', '買い取りや査定で使う単語を覚える', [
    ['purchase', '買い取る・購入', 'We purchase used games.', '中古のゲームを買い取っています。', 'パーチェス'],
    ['appraise', '査定する（値段をつける）', 'We will appraise it now.', 'これから査定します。', 'アプレイズ'],
    ['estimate', '見積もり', 'Here is the estimate.', 'こちらが見積もりです。', 'エスティメイト'],
    ['offer', '申し出る・提示する', 'We can offer 2,000 yen.', '2000円でお買い取りできます。', 'オファー'],
    ['accept', '受け入れる・受け取る', 'Do you accept this price?', 'この値段でよろしいですか？', 'アクセプト'],
    ['decline', '断る', 'You can decline the offer.', 'お断りいただいてもかまいません。', 'ディクライン'],
    ['ID', '身分証', 'Please show me your ID.', '身分証を見せてください。', 'アイディー'],
    ['signature', '署名・サイン', 'I need your signature here.', 'ここにサインをお願いします。', 'シグネチャー'],
  ]);

  lesson(30, 'お店', '品出しと在庫', '届いた商品を並べるときの単語を覚える', [
    ['arrive', '届く・着く', 'The new items arrived today.', '今日、新しい商品が届きました。', 'アライブ'],
    ['deliver', '配達する・届ける', 'We can deliver the sofa.', 'ソファは配達できます。', 'デリバー'],
    ['display', '並べる・陳列する', 'Please display these on the shelf.', 'これらを棚に並べてください。', 'ディスプレイ'],
    ['price tag', '値札', 'Please put a price tag on it.', '値札をつけてください。', 'プライス タグ'],
    ['label', 'ラベル・札', 'Check the label on the box.', '箱のラベルを確認してください。', 'レイベル'],
    ['storage', '倉庫・保管', 'Put the extra items in storage.', '残りの商品は倉庫に入れてください。', 'ストーリッジ'],
    ['count', '数える', "Let's count the items.", '商品を数えましょう。', 'カウント'],
    ['missing', '足りない・見当たらない', 'One part is missing.', '部品が1つ足りません。', 'ミッシング'],
  ]);

  lesson(31, 'お店', 'お客さんとのやりとり', 'お客さんが選ぶとき・迷うときの単語を覚える', [
    ['try', 'ためす', 'You can try it here.', 'ここで試せます。', 'トライ'],
    ['look', '見る・〜に見える', 'It looks new.', '新品のように見えます。', 'ルック'],
    ['choose', '選ぶ', 'Please choose one.', '1つお選びください。', 'チューズ'],
    ['decide', '決める', 'Take your time to decide.', 'ゆっくりお決めください。', 'ディサイド'],
    ['compare', '比べる', 'You can compare the two.', '2つを比べてみてください。', 'コンペア'],
    ['expensive', '高い（値段）', 'This one is a bit expensive.', 'こちらは少し高いです。', 'エクスペンシブ'],
    ['cheaper', 'もっと安い', 'Do you have a cheaper one?', 'もっと安いのはありますか？', 'チーパー'],
    ['deal', 'お買い得・取引', "That's a good deal.", 'それはお買い得です。', 'ディール'],
  ]);

  lesson(32, 'お店', '職場の言葉', '会議・シフト・残業 など、職場の単語を覚える', [
    ['meeting', '会議・打ち合わせ', 'We have a meeting at nine.', '9時に会議があります。', 'ミーティング'],
    ['schedule', '予定・スケジュール', "Let's check the schedule.", '予定を確認しましょう。', 'スケジュール'],
    ['shift', 'シフト・勤務時間', 'My shift starts at ten.', 'わたしのシフトは10時からです。', 'シフト'],
    ['manager', '店長・責任者', 'I am the store manager.', 'わたしが店長です。', 'マネージャー'],
    ['coworker', '同僚', 'My coworkers are kind.', '同僚はみんな親切です。', 'コワーカー'],
    ['day off', '休みの日', 'Tomorrow is my day off.', '明日はわたしの休みです。', 'デイ オフ'],
    ['overtime', '残業', 'I worked overtime yesterday.', '昨日は残業しました。', 'オーバータイム'],
    ['finish', '終える・終わる', 'I finish work at six.', '6時に仕事が終わります。', 'フィニッシュ'],
  ]);

  // ---- 車・移動（第33〜34回）----
  lesson(33, '車', '運転の言葉', '信号・曲がる・駐車する など、運転の単語を覚える', [
    ['traffic light', '信号', 'Turn right at the traffic light.', '信号を右に曲がってください。', 'トラフィック ライト'],
    ['stop', '止まる・止める', 'Please stop here.', 'ここで止めてください。', 'ストップ'],
    ['turn', '曲がる', 'Turn left at the next corner.', '次の角を左に曲がってください。', 'ターン'],
    ['straight', 'まっすぐ', 'Go straight for 500 meters.', '500メートルまっすぐ進んでください。', 'ストレイト'],
    ['park', '駐車する・公園', 'Can I park here?', 'ここに車をとめてもいいですか？', 'パーク'],
    ['parking lot', '駐車場', 'The parking lot is behind the shop.', '駐車場はお店のうしろです。', 'パーキング ロット'],
    ['gas station', 'ガソリンスタンド', 'I need to go to a gas station.', 'ガソリンスタンドに行かないと。', 'ガス ステーション'],
    ['slow down', 'スピードを落とす', 'Please slow down here.', 'ここではスピードを落としてください。', 'スロー ダウン'],
  ]);

  lesson(34, '車', '道と移動の言葉', '道路・渋滞・地図 など、移動の単語を覚える', [
    ['road', '道路', 'This road is very busy.', 'この道路はとても混んでいます。', 'ロード'],
    ['traffic', '交通・車の流れ', 'The traffic is bad today.', '今日は渋滞しています。', 'トラフィック'],
    ['map', '地図', 'Let me check the map.', '地図を確認させてください。', 'マップ'],
    ['on time', '時間どおりに', 'I arrived on time.', '時間どおりに着きました。', 'オン タイム'],
    ['crowded', '混んでいる', 'The store is crowded on Sundays.', '日曜日はお店が混んでいます。', 'クラウディッド'],
    ['accident', '事故', 'There was an accident on the highway.', '高速道路で事故がありました。', 'アクシデント'],
    ['corner', '角', 'The shop is on the corner.', 'お店は角にあります。', 'コーナー'],
    ['highway', '高速道路・幹線道路', 'I take the highway to work.', '高速道路で仕事に行きます。', 'ハイウェイ'],
  ]);

  // ---- コード（第35〜38回）----
  lesson(35, 'コード', 'ページの部品の名前', 'ホームページのコードでよく見る、部品の名前を覚える', [
    ['header', 'ヘッダー（ページの上の部分）', 'The logo is in the header.', 'ロゴはヘッダーにあります。', 'ヘッダー'],
    ['footer', 'フッター（ページの下の部分）', 'The address is in the footer.', '住所はフッターにあります。', 'フッター'],
    ['nav', 'ナビ（案内のリンクの部分）', 'The menu links are in the nav.', 'メニューのリンクはナビにあります。', 'ナブ'],
    ['section', 'セクション（区切り・章）', 'Each section has a heading.', 'それぞれのセクションに見出しがあります。', 'セクション'],
    ['main', 'メイン（主な部分）', 'The main content goes here.', '主な中身はここに入ります。', 'メイン'],
    ['article', '記事', 'This article is about horse racing.', 'この記事は競馬についてです。', 'アーティクル'],
    ['sidebar', 'サイドバー（横の欄）', 'The sidebar shows new posts.', 'サイドバーに新しい投稿が出ます。', 'サイドバー'],
    ['logo', 'ロゴ', 'Click the logo to go home.', 'ロゴを押すとトップにもどります。', 'ロゴ'],
  ]);

  lesson(36, 'コード', '見た目を決める言葉（CSS）', '色や余白など、見た目を決めるコードの単語を覚える', [
    ['style', '見た目・スタイル', 'Change the style of the button.', 'ボタンの見た目を変えましょう。', 'スタイル'],
    ['class', 'クラス（見た目のグループ名）', 'Give this box a class name.', 'この箱にクラス名をつけましょう。', 'クラス'],
    ['color', '色', 'Change the text color to red.', '文字の色を赤にしましょう。', 'カラー'],
    ['font', 'フォント（文字の形）', 'This font is easy to read.', 'このフォントは読みやすいです。', 'フォント'],
    ['background', '背景', 'The background is white.', '背景は白です。', 'バックグラウンド'],
    ['border', '枠線', 'Add a border to the picture.', '写真に枠線をつけましょう。', 'ボーダー'],
    ['margin', 'マージン（外側の余白）', 'Add some margin around the box.', '箱のまわりに余白をとりましょう。', 'マージン'],
    ['padding', 'パディング（内側の余白）', 'The button needs more padding.', 'ボタンの内側の余白を増やしましょう。', 'パディング'],
  ]);

  lesson(37, 'コード', '動きをつける言葉（JavaScript）', 'ボタンを押したときの動きなど、プログラムの単語を覚える', [
    ['script', 'スクリプト（プログラム）', 'The script runs when the page opens.', 'ページを開くとスクリプトが動きます。', 'スクリプト'],
    ['event', 'イベント（できごと）', 'A click is an event.', 'クリックはイベントの1つです。', 'イベント'],
    ['variable', '変数（値を入れる箱）', 'Save the score in a variable.', '点数を変数に入れておきます。', 'ヴァリアブル'],
    ['if', 'もし〜なら', 'If the answer is right, play a sound.', 'もし答えが正しければ、音を鳴らします。', 'イフ'],
    ['loop', 'ループ（くり返し）', 'This loop runs ten times.', 'このループは10回くり返します。', 'ループ'],
    ['array', '配列（値の並び）', 'The words are in an array.', '単語は配列に入っています。', 'アレイ'],
    ['console', 'コンソール（確認用の画面）', 'Check the error in the console.', 'コンソールでエラーを確認しましょう。', 'コンソール'],
    ['alert', 'お知らせ・警告の表示', 'The page shows an alert.', 'ページにお知らせが出ます。', 'アラート'],
  ]);

  lesson(38, 'コード', 'サイトの仕組みの言葉', 'サーバーやアカウントなど、サイトの仕組みの単語を覚える', [
    ['server', 'サーバー（ページを置いておくコンピューター）', 'The site is on a server.', 'サイトはサーバーに置いてあります。', 'サーバー'],
    ['browser', 'ブラウザ（ページを見るアプリ）', 'Open the page in your browser.', 'ブラウザでページを開いてください。', 'ブラウザー'],
    ['domain', 'ドメイン（サイトの住所の名前）', 'We bought a new domain.', '新しいドメインを買いました。', 'ドメイン'],
    ['URL', 'URL（ページの住所）', 'Copy the URL and send it to me.', 'URLをコピーして送ってください。', 'ユーアールエル'],
    ['account', 'アカウント', 'Make a new account.', '新しいアカウントを作りましょう。', 'アカウント'],
    ['password', 'パスワード', 'Never share your password.', 'パスワードはだれにも教えないでね。', 'パスワード'],
    ['login', 'ログイン（入ること）', 'The login button is at the top.', 'ログインのボタンは上にあります。', 'ログイン'],
    ['publish', '公開する', 'I will publish the page today.', '今日、ページを公開します。', 'パブリッシュ'],
  ]);

  // ---- 競馬（第39〜40回）----
  lesson(39, '競馬', '馬と人の言葉', '騎手・調教師・血統 など、競馬の馬と人の単語を覚える', [
    ['horse', '馬', 'This horse is very fast.', 'この馬はとても速いです。', 'ホース'],
    ['jockey', '騎手・ジョッキー', 'The jockey rode well.', 'ジョッキーはうまく乗りました。', 'ジョッキー'],
    ['trainer', '調教師', 'The trainer is happy with the horse.', '調教師はその馬に満足しています。', 'トレーナー'],
    ['owner', '馬主・持ち主', 'The owner watched the race.', '馬主はレースを見ていました。', 'オーナー'],
    ['stallion', '種牡馬・おす馬', 'He became a famous stallion.', '彼は有名な種牡馬になりました。', 'スタリオン'],
    ['mare', 'めす馬（大人）', 'The mare won the big race.', 'そのめす馬は大きなレースを勝ちました。', 'メア'],
    ['foal', '子馬', 'The foal was born in spring.', 'その子馬は春に生まれました。', 'フォール'],
    ['pedigree', '血統', 'This horse has a great pedigree.', 'この馬はすばらしい血統です。', 'ペディグリー'],
  ]);

  lesson(40, '競馬', 'レースの言葉', 'ハロン・芝・1番人気 など、レースの単語を覚える', [
    ['race', 'レース', 'The race starts at three.', 'レースは3時に始まります。', 'レース'],
    ['furlong', 'ハロン（約200メートル）', 'The race is ten furlongs.', 'そのレースは10ハロンです。', 'ファーロング'],
    ['turf', '芝（のコース）', 'He is strong on turf.', '彼は芝に強いです。', 'ターフ'],
    ['dirt', 'ダート（土のコース）', 'This is a dirt race.', 'これはダートのレースです。', 'ダート'],
    ['gate', 'ゲート（スタートの門）', 'The horses are in the gate.', '馬たちがゲートに入りました。', 'ゲイト'],
    ['favorite', '1番人気・お気に入り', 'The favorite won easily.', '1番人気が楽に勝ちました。', 'フェイバリット'],
    ['win', '勝つ', 'Which horse will win?', 'どの馬が勝つでしょう？', 'ウィン'],
    ['finish line', 'ゴール（決勝線）', 'He crossed the finish line first.', '彼が1着でゴールしました。', 'フィニッシュ ライン'],
  ]);
})();
