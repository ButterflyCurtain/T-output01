### lang = ja

# T-output01

マークダウン形式のリッチテキスト書式とDiscord風の表示をサポートする軽量テキスト変換・共有ツールです。テキスト情報を内包したURLを生成し、書式設定されたテキストを他者と共有できます。

## 機能
* **リッチテキスト書式**: **太字**、*斜体*、> 引用、||ネタバレ防止|| など
* **テキストエンコードオプション**:
  * URLエンコード（短縮URL用）
  * Base64エンコード（互換性確保用）
* **メタデータカスタマイズ**:
  * 話者、感情、アクション、文末表現の設定
  * すべてのメタデータフィールドは任意設定
* **簡単な共有**:
  * テキスト共有用のURLを生成
  * 受信者はインストール不要で閲覧可能
* **プレビュー機能**:
  * 共有前にテキストを確認

## ディレクトリ構造

```
T-output01/
├── index.html              # テキスト入力画面
├── view.html               # 共有URL表示ページ
├── simple-text-processor.js # メイン処理ロジック
├── expressions.json        # メタデータ定義
├── UNLICENSE               # ライセンス（パブリックドメイン）
└── README.md               # 本ドキュメント
```

## 使用方法
1. テキスト入力と処理（index.html）
* **テキスト入力**: テキストボックスに内容を入力
* **書式の適用**:
  * ボタンまたはキーボードショートカットを使用:
    * `Ctrl + B`: 太字
    * `Ctrl + I`: 斜体
    * `Ctrl + Q`: 引用
    * `Ctrl + H`: スポイラー
* **メタデータの追加**（任意）:
  * ドロップダウンメニューから話者、感情などを選択
* **プレビュー**: リアルタイムで書式を確認、または「プレビュー」ボタンをクリック
* **共有URL生成**:
  * エンコード方式（URLまたはBase64）を選択
  * 「共有URL生成」をクリックしてリンクをコピー
  * URLを他者と共有

2. 共有テキストの閲覧（view.html）
   生成されたURL（例: `view.html#b=<エンコードされたテキスト>`）を開き、Discord風の書式設定されたテキストを表示。


## ライセンス
Unlicenseの下で公開されており、本プロジェクトはパブリックドメインです。
制限なく自由に使用、修正、配布が許可されています 。


---
### lang = en

# T-output01

A lightweight text transformation and sharing tool that supports Markdown-style rich text formatting and Discord-like display. Generate URLs containing text information and share the formatted text with others.

## Features

- **Rich Text Formatting**: Support for **bold**, *italic*, > quote, ||spoiler|| and more
- **Text Encoding Options**:
  - URL encoding (for shortened URLs)
  - Base64 encoding (for compatibility)
- **Metadata Customization**:
  - Set speaker, emotion, actions, and sentence-ending expressions
  - All metadata fields are optional
- **Easy Sharing**:
  - Generate URLs to share your formatted text
  - Recipients can view your text without needing to install anything
- **Preview Functionality**:
  - See your text before sharing

## Directory Structure

```
simple-text-processor/
├── index.html              # Text input screen
├── view.html               # Shared URL display page
├── simple-text-processor.js # Main processing logic
├── expressions.json        # Metadata definitions
├── UNLICENSE               # License (Public Domain)
└── README.md               # This document
```

## Usage

### 1. Text Input and Processing (index.html)

- **Enter Text**: Type your content in the text box
- **Apply Formatting**:
  - Use buttons or keyboard shortcuts:
    - `Ctrl + B`: Bold
    - `Ctrl + I`: Italic
    - `Ctrl + Q`: Quote
    - `Ctrl + H`: Spoiler
- **Add Metadata** (Optional):
  - Select speaker, emotion, etc. from dropdown menus
- **Preview**: Check formatting in real-time or click the "Preview" button
- **Generate Sharing URL**:
  - Choose encoding method (URL or Base64)
  - Click "Generate Sharing URL" and copy the link
  - Share the URL with others

### 2. Viewing Shared Text (view.html)

Open the generated URL (e.g., `view.html#b=<encoded-text>`) to see the Discord-styled formatted text.

## License

Released under the Unlicense, this project is in the public domain. You are free to use, modify, and distribute it without restrictions.

