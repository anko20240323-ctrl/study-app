// 英語の日常会話 第1回 あいさつ
//
// 会話のレッスンの書き方（ほかの回も同じ形です）
//   course  : 'talk' と書くと、会話のレッスンになる（打つ課題はなし）
//   roles   : 話す人の名前。A と B の2人
//   intro   : 会話の前に、日本語で読む説明
//   dialogue: 会話。who は 'A' か 'B'。en 英語 / ja 日本語の意味
//   quiz    : 選ぶ問題。sayParts で英語の部分を英語の声で読む。
//             choicesLang: 'en' と書くと、選択肢を英語の声で読む。
//             whyParts で、解説の英語の部分を英語の声で読む
//   words   : 覚えたいフレーズ。en / ja / ex（使い方の例） / exJa

registerLesson({
  id: 'talk-01',
  course: 'talk',
  no: 1,
  title: 'あいさつ',
  goal: '朝、職場で、同僚のサムに会う',
  roles: { A: 'サム（同僚）', B: 'あなた' },
  intro: [
    'こんにちは。今日から、英語の日常会話を始めます。',
    '1回目は、あいさつです。',
    '朝、職場で、同僚のサムに会った場面です。',
    '英語、日本語の意味、もう一度英語、の順に読みます。まずは、聞くだけで大丈夫です。',
  ],
  dialogue: [
    { who: 'A', en: 'Good morning, Tatsuya!', ja: 'おはよう、たつや！' },
    { who: 'B', en: 'Good morning, Sam. How are you?', ja: 'おはよう、サム。元気？' },
    { who: 'A', en: "I'm good, thanks. And you?", ja: '元気だよ、ありがとう。きみは？' },
    { who: 'B', en: "Pretty good. It's cold today, isn't it?", ja: 'まあまあ元気。今日は寒いね。' },
    { who: 'A', en: 'Yes, it is. Did you have a good weekend?', ja: 'そうだね。いい週末だった？' },
    { who: 'B', en: 'Yes. I went to see a movie.', ja: 'うん。映画を見に行ったよ。' },
    { who: 'A', en: 'Nice! Have a good day.', ja: 'いいね！よい一日を。' },
    { who: 'B', en: 'You too. See you later.', ja: 'きみもね。またあとで。' },
  ],
  quiz: [
    {
      q: '「How are you?」の意味は？',
      sayParts: [{ text: 'How are you?', lang: 'en' }, { text: 'の意味は、どれでしょう？', lang: 'ja' }],
      choices: ['元気ですか？', 'あなたはだれですか？', '何時ですか？'],
      answer: 0,
      why: 'How are you? は「元気ですか？」。毎日のあいさつでよく使います。',
      whyParts: [{ text: 'How are you?', lang: 'en' }, { text: 'は、元気ですか、という意味です。毎日のあいさつで、よく使います。', lang: 'ja' }],
    },
    {
      q: '「How are you?」と聞かれました。返事として自然なのは？',
      sayParts: [{ text: 'How are you?', lang: 'en' }, { text: 'と聞かれました。返事として自然なのは、どれでしょう？', lang: 'ja' }],
      choices: ['See you later.', "I'm good, thanks.", 'Nice to meet you.'],
      choicesLang: 'en',
      answer: 1,
      why: "I'm good, thanks.（元気です、ありがとう）と答えます。",
      whyParts: [{ text: "I'm good, thanks.", lang: 'en' }, { text: '元気です、ありがとう、と答えます。', lang: 'ja' }],
    },
    {
      q: '「See you later.」は、どんなときに言う？',
      sayParts: [{ text: 'See you later.', lang: 'en' }, { text: 'は、どんなときに言うでしょう？', lang: 'ja' }],
      choices: ['はじめて会ったとき', 'お礼を言うとき', '別れるとき'],
      answer: 2,
      why: 'See you later. は「またあとで」。別れるときのあいさつです。',
      whyParts: [{ text: 'See you later.', lang: 'en' }, { text: 'は、またあとで。別れるときのあいさつです。', lang: 'ja' }],
    },
    {
      q: '「Have a good day.」と言われました。返事は？',
      sayParts: [{ text: 'Have a good day.', lang: 'en' }, { text: 'と言われました。返事は、どれでしょう？', lang: 'ja' }],
      choices: ['You too.', 'Me too.', 'Good night.'],
      choicesLang: 'en',
      answer: 0,
      why: 'You too.（あなたもね）と返します。Me too. は「わたしも」なので、ここでは合いません。',
      whyParts: [
        { text: 'You too.', lang: 'en' }, { text: 'あなたもね、と返します。', lang: 'ja' },
        { text: 'Me too.', lang: 'en' }, { text: 'は、わたしも、なので、ここでは合いません。', lang: 'ja' },
      ],
    },
  ],
  words: [
    { en: 'Good morning.', ja: 'おはようございます', ex: 'Good morning, everyone.', exJa: 'みなさん、おはようございます。' },
    { en: 'How are you?', ja: '元気ですか？', ex: 'Hi, Sam. How are you?', exJa: 'やあ、サム。元気？' },
    { en: "I'm good, thanks.", ja: '元気です、ありがとう', ex: "I'm good, thanks. And you?", exJa: '元気です、ありがとう。あなたは？' },
    { en: 'Nice to meet you.', ja: 'はじめまして（会えてうれしいです）', ex: "Hi, I'm Tatsuya. Nice to meet you.", exJa: 'こんにちは、たつやです。はじめまして。' },
    { en: 'Long time no see.', ja: 'ひさしぶり', ex: 'Long time no see! How have you been?', exJa: 'ひさしぶり！元気にしてた？' },
    { en: 'Have a good day.', ja: 'よい一日を', ex: 'Thanks for coming. Have a good day!', exJa: '来てくれてありがとう。よい一日を！' },
    { en: 'See you later.', ja: 'またあとで', ex: 'I have to go now. See you later!', exJa: 'もう行かなきゃ。またね！' },
  ],
});
