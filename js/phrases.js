// 読み上げる言葉をつくる係。アプリと、音声ファイルを作るスクリプト（tools/list_texts.mjs）の両方で使います。
// ここを変えると、読み上げる文が変わるので、音声ファイルも作り直しになります。

(function (root) {
  // ---- コードの記号を、読みやすい言葉に置きかえる ----
  const TAG_YOMI = {
    html: 'エイチティーエムエル', head: 'ヘッド', body: 'ボディ', title: 'タイトル',
    meta: 'メタ', h1: 'エイチワン', h2: 'エイチツー', h3: 'エイチスリー', p: 'ピー',
    a: 'エー', img: 'イメージ', ul: 'ユーエル', ol: 'オーエル', li: 'エルアイ',
    button: 'ボタン', br: 'ビーアール', div: 'ディブ', strong: 'ストロング',
  };
  const ATTR_YOMI = { href: 'エイチレフ', src: 'ソース', alt: 'オルト', lang: 'ラング', charset: 'キャラセット', type: 'タイプ' };

  function toSpeech(text) {
    return String(text)
      // 「head（ヘッド）」のように書いてあれば、カタカナのほうだけ読む
      .replace(/[\x21-\x7e]+(?: [\x21-\x7e]+)*（([゠-ヿ・ー\s]+)）/g, '$1')
      .replace(/<!doctype html>/gi, ' ドクタイプ宣言 ')
      .replace(/<\/(\w+)>/g, (_, t) => ` ${TAG_YOMI[t.toLowerCase()] || t}の閉じタグ `)
      .replace(/<(\w+)([^>]*)>/g, (_, t, rest) => {
        const attrs = (rest.match(/\b(\w+)=/g) || [])
          .map((a) => ATTR_YOMI[a.slice(0, -1).toLowerCase()] || a.slice(0, -1));
        const name = TAG_YOMI[t.toLowerCase()] || t;
        return attrs.length ? ` ${name}タグ（${attrs.join('、')}つき） ` : ` ${name}タグ `;
      })
      .replace(/```[\s\S]*?```/g, '');
  }

  // 声の高さ（1 がふつう）を、半音の数に直す（音声ファイルを作るときに使う）
  function semitones(pitch) {
    if (!pitch || pitch === 1) return 0;
    return Math.round(12 * Math.log2(pitch) * 10) / 10;
  }

  // 1つの文の音声ファイルを探すための名前（言語・声の高さ・文）
  function audioKey(lang, text, pitch) {
    return `${lang === 'en' ? 'en' : 'ja'}|${semitones(pitch)}|${text}`;
  }

  root.Phrases = { toSpeech, semitones, audioKey };
})(typeof window !== 'undefined' ? window : globalThis);
