# -*- coding: utf-8 -*-
"""
学習アプリの読み上げを、Google Cloud Text-to-Speech で音声ファイル（mp3）にする。

使い方（たつやさんのパソコンで、リポジトリのフォルダから）
  1) 準備（はじめの1回だけ）   pip install google-auth requests
  2) 作る文の一覧を新しくする   node tools/list_texts.mjs   ← 教材を変えたときだけ。Node がなければ省略可
  3) まず数えるだけ（お金はかからない）  python tools/make_audio.py --dry-run
  4) 本当に作る                 python tools/make_audio.py

- 作るのは、まだ音声ファイルがない文だけ。同じ文は二度と作らない（文字数＝料金のもと、を増やさない）
- 作った文字数を表示し、tools/tts-usage.json に月ごとに記録する
- 鍵（サービスアカウントの JSON）は、場所を読むだけ。中身を表示・保存・コピーしない
  鍵の場所は --key か、環境変数 GOOGLE_APPLICATION_CREDENTIALS で変えられる
"""

import argparse
import base64
import datetime
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "audio" / "texts.json"
MANIFEST = ROOT / "audio" / "manifest.json"
USAGE = ROOT / "tools" / "tts-usage.json"
DEFAULT_KEY = "C:/Users/user/.gemini/antigravity/scratch/gcp-key.json"

VOICES = {
    "ja": {"languageCode": "ja-JP", "name": "ja-JP-Neural2-B"},  # 日本語・女性
    "en": {"languageCode": "en-US", "name": "en-US-Neural2-F"},  # 英語・女性
}
FREE_PER_MONTH = 1_000_000  # Neural2 の無料分（1か月の文字数）
API = "https://texttospeech.googleapis.com/v1/text:synthesize"

# Windows のコンソールでも日本語が出るように
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def file_name(item):
    h = hashlib.sha1(item["key"].encode("utf-8")).hexdigest()[:16]
    return f"{item['lang']}/{h}.mp3"


def load_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def save_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def month():
    return datetime.date.today().strftime("%Y-%m")


def credentials(key_path):
    try:
        from google.oauth2 import service_account
        import google.auth.transport.requests
    except ImportError:
        sys.exit("google-auth が入っていません。先に  pip install google-auth requests  を実行してください。")
    if not Path(key_path).is_file():
        sys.exit(f"鍵のファイルが見つかりません：{key_path}\n--key で場所を指定してください。")
    creds = service_account.Credentials.from_service_account_file(
        key_path, scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    request = google.auth.transport.requests.Request()
    creds.refresh(request)
    return creds, request


def synthesize(creds, request, item):
    if not creds.valid:
        creds.refresh(request)
    body = {
        "input": {"text": item["text"]},
        "voice": VOICES[item["lang"]],
        "audioConfig": {
            "audioEncoding": "MP3",
            "sampleRateHertz": 24000,
            "speakingRate": 1.0,
            "pitch": float(item.get("semi") or 0),
        },
    }
    data = json.dumps(body).encode("utf-8")
    for attempt in range(4):
        req = urllib.request.Request(
            API,
            data=data,
            headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json; charset=utf-8"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return base64.b64decode(json.loads(res.read())["audioContent"])
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:300]
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** attempt * 2)
                continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")
        except urllib.error.URLError:
            if attempt < 3:
                time.sleep(2 ** attempt * 2)
                continue
            raise


def write_manifest(items):
    """いまディスクにある mp3 だけを、manifest.json に書く（アプリはこれを見て再生する）"""
    files, lessons = {}, {}
    for it in items:
        f = file_name(it)
        p = ROOT / "audio" / f
        if not p.is_file():
            continue
        files[it["key"]] = {"f": f, "b": p.stat().st_size}
        for lid in it["lessons"]:
            lessons.setdefault(lid, []).append(f)
    save_json(MANIFEST, {"note": "tools/make_audio.py が作る一覧です。手で書きかえないでください。", "files": files, "lessons": lessons})
    return files


def main():
    ap = argparse.ArgumentParser(description="学習アプリの読み上げを mp3 にする")
    ap.add_argument("--key", default=os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", DEFAULT_KEY), help="鍵の JSON の場所")
    ap.add_argument("--dry-run", action="store_true", help="数えるだけ（API は使わない）")
    ap.add_argument("--yes", action="store_true", help="確認せずに作る")
    ap.add_argument("--limit", type=int, default=200_000, help="1回で作ってよい文字数の上限（初期値 20万）")
    ap.add_argument("--clean", action="store_true", help="もう使っていない mp3 を消す")
    args = ap.parse_args()

    texts = load_json(TEXTS, None)
    if not texts:
        sys.exit("audio/texts.json がありません。先に  node tools/list_texts.mjs  を実行してください。")
    items = texts["items"]
    todo = [it for it in items if not (ROOT / "audio" / file_name(it)).is_file()]
    chars = sum(len(it["text"]) for it in todo)

    usage = load_json(USAGE, {})
    used = usage.get(month(), 0)

    print(f"読み上げる文：全部で {len(items)} 個（{texts['chars']:,} 文字）")
    print(f"まだ音声がない文：{len(todo)} 個、{chars:,} 文字　← 今回作る分（料金はこの文字数で決まる）")
    print(f"このアプリで今月作った文字数：{used:,} 文字 / 無料分 {FREE_PER_MONTH:,} 文字")
    print("※ LRC など、同じ Google Cloud の請求先で作った文字数も、無料分から引かれます。")

    used_files = {file_name(it) for it in items}
    unused = [p for p in (ROOT / "audio").glob("*/*.mp3") if f"{p.parent.name}/{p.name}" not in used_files]
    if unused:
        print(f"もう使っていない mp3：{len(unused)} 個" + ("（--clean で消します）" if not args.clean else ""))
        if args.clean:
            for p in unused:
                p.unlink()
            print("  → 消しました")

    if not todo:
        write_manifest(items)
        print("作る文はありません。audio/manifest.json を新しくしました。")
        return
    if args.dry_run:
        print("（--dry-run なので、ここで止めます。API は使っていません）")
        return
    if chars > args.limit:
        sys.exit(f"今回の文字数が上限（{args.limit:,}）をこえています。本当に作るときは --limit を上げてください。")
    if used + chars > FREE_PER_MONTH * 0.9:
        print(f"⚠ 今月の合計が {used + chars:,} 文字になり、無料分の9割をこえます。")
    if not args.yes:
        if input("作りますか？ [y/N] ").strip().lower() != "y":
            print("やめました。")
            return

    creds, request = credentials(args.key)
    made = made_chars = 0
    try:
        for n, it in enumerate(todo, 1):
            mp3 = synthesize(creds, request, it)
            out = ROOT / "audio" / file_name(it)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(mp3)
            made += 1
            made_chars += len(it["text"])
            if made % 20 == 0 or n == len(todo):
                usage[month()] = used + made_chars
                save_json(USAGE, usage)
                print(f"  {n}/{len(todo)} 個　{made_chars:,} 文字")
            time.sleep(0.05)
    finally:
        usage[month()] = used + made_chars
        save_json(USAGE, usage)
        files = write_manifest(items)
        size = sum(v["b"] for v in files.values())
        print(f"作った音声：{made} 個、{made_chars:,} 文字")
        print(f"今月の合計：{usage[month()]:,} 文字 / 無料分 {FREE_PER_MONTH:,} 文字")
        print(f"使える音声：{len(files)} 個（{size / 1024 / 1024:.1f} MB）→ audio/manifest.json を新しくしました")


if __name__ == "__main__":
    main()
