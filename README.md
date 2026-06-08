# 🎰 Survival Roulette

ターン制のルーレットゲーム。運を試しながら生存を目指す！個人戦・チーム戦対応、豊富なイベント機能搭載。

## 🌐 オンライン版

ブラウザから直接プレイ：  
**[GitHub Pages](https://yourusername.github.io/survival-roulette/)** ※URLは自身のリポジトリに合わせて変更してください

## 📦 ファイル構成

```
survival-roulette/
├── index.html                    # ブラウザ直接実行版（オフラインモード）
├── SurvivalRoulette_FIXED.jsx   # React完全版（マルチプレイ対応）
├── README.md                     # このファイル
└── docs/
    └── SETUP.md                  # セットアップ手順
```

## 🚀 クイックスタート

### ブラウザで直接実行（最も簡単）

1. このリポジトリをクローン：
```bash
git clone https://github.com/yourusername/survival-roulette.git
```

2. `index.html`をブラウザで開く：
```bash
# ローカルサーバーで実行（推奨）
npx http-server
# または
python -m http.server 8000
```

3. `http://localhost:8000` にアクセス

### GitHub Pagesで公開

1. リポジトリのSettings → Pages → Source を `main` ブランチに設定
2. URL: `https://yourusername.github.io/survival-roulette/`

## 🎮 ゲームルール

### モード選択
- **個人戦**: 最後に残った1人が勝利
- **チーム戦**: 同じチームの複数プレイヤーで戦う

### 基本の流れ
1. **セットアップ**: プレイヤー名、ゲーム設定を決定
2. **ゲーム開始**: 「SPIN」ボタンでルーレット実行
3. **ダメージ計算**: ランダムに選ばれたプレイヤーにダメージ
4. **結果**: HPが0になったプレイヤーが脱落
5. **繰り返し**: 1人（または1チーム）が残るまで続行

### 設定項目

| 設定 | 説明 | デフォルト |
|------|------|-----------|
| タイトル | ゲームの名前 | - |
| モード | 個人戦 / チーム戦 | 個人戦 |
| 初期HP | 各プレイヤーの初期体力 | 1000 |
| 速度 | ルーレット回転速度（秒） | 1.5 |
| 回復頻度 | N ターン毎に全員回復 | 10T |

### ルーレット構成

**ランダム範囲**: 1～20 ダメージ（70%の確率）
- 例）「50ダメージ」（20%）
- 例）「100ダメージ」（10%）

数値は自由に設定可能。確率の合計が100%になる必要があります。

## ✨ 特別イベント

マルチプレイ版（`SurvivalRoulette_FIXED.jsx`）で実装：

### イベント一覧
- **🔄 リバース**: 選ばれたプレイヤー「以外」全員にダメージ
- **👥 マルチ**: ランダムに複数プレイヤーを選択
- **⚡ フェイント**: 一度表示したプレイヤーが外れる
- **🎲 ダイスルーレット**: カスタマイズ可能な範囲でランダムダメージ
- **🔢 特殊数値形式**: ローマ数字やギリシャ数字など44種類の数字表記
- **🌐 名前の多言語化**: プレイヤー名を言語翻訳（20言語対応）
- **💀 脱落イベント**: 確定で1プレイヤーを即死
- **🔥 完全ランダム**: HPバランス調整を無視した完全ランダム選択
- **🔫 ロシアンルーレット**: 6人が引き金を引く！
- **💣 時限爆弾解除**: 正しい導線を1分以内に切る！
- **✏️ 漢字クイズ**: 5問全問正解で回避
- **🧮 計算クイズ**: 計算問題を解いてダメージ回避
- **📚 英単語クイズ**: 英単語から日本語訳を答える

## 📱 マルチプレイ（完全版）

`SurvivalRoulette_FIXED.jsx` を React 環境で実行する場合：

### セットアップ

1. Node.js をインストール
2. 依存パッケージをインストール：
```bash
npm install react react-dom lucide-react firebase
```

3. React プロジェクトに追加：
```bash
# Create React App を使用
npx create-react-app survival-roulette
cd survival-roulette
```

4. `src/App.jsx` に内容をコピー

5. Firebase 設定（オプション）：
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-auth-domain.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

6. 実行：
```bash
npm start
```

## 🎯 Tips & トリックス

### 確率の設定テクニック

**スリリングな展開**
- ランダム: 1～50 (70%)
- 大ダメージ: 150 (20%)
- 超大ダメージ: 500 (10%)

**バランス型**
- ランダム: 1～30 (50%)
- 中ダメージ: 50 (30%)
- 大ダメージ: 100 (20%)

**予測不可能**
- ランダム: 1～200 (100%)
- ※すべてランダムで予測が難しい

### HPバランス調整

有効にすると、HPが低いプレイヤーほど選ばれやすくなります。
- **無効**: 完全ランダム
- **有効**: HPの低さに応じた確率調整

## 🐛 既知の問題

### html版（index.html）
- マルチプレイ非対応（オフラインシングルのみ）
- 一部イベント未実装
- Firebase機能なし

### React版（SurvivalRoulette_FIXED.jsx）
- Firebase設定が必須
- 環境構築が必要

## 📋 トラブルシューティング

### Q: HTMLを開いても画面が表示されない
**A:** ローカルサーバーで実行してください：
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

### Q: 確率が100%にならないエラー
**A:** ルーレット構成内のすべての確率の合計が正確に100%になるように調整してください。

### Q: プレイヤーを追加したい
**A:** セットアップ画面の「プレイヤーリスト」に改行区切りで名前を入力します。

## 🎨 カスタマイズ

### 色の変更

`index.html` で検索可能：
```html
<span style={{ color: '#a5f3fc' }}>Roulette</span>
```

色コード例：
- 赤: `#ef4444`
- 青: `#3b82f6`
- 緑: `#10b981`
- 黄: `#eab308`
- 紫: `#8b5cf6`

## 📝 ゲーム記録

結果をコピーして保存できます：
- **通常テキスト**: SNS共有向け
- **Discord形式**: Discord サーバー用

## 🤝 貢献

バグ報告や機能リクエスト：
1. Issues を作成
2. バグの詳細や期待される動作を記述
3. Pull Request で修正提案

## 📄 ライセンス

MIT License - 自由に使用・改変・配布が可能です

## 🎬 使用技術

### HTML版
- React 18 (Standalone)
- Babel (JSX トランスパイル)
- Tailwind CSS風スタイル

### React版
- React 18
- Firebase (Realtime DB, Authentication)
- Lucide React Icons
- Tailwind CSS

## 🌟 機能一覧

- [x] シングルプレイ（個人戦・チーム戦）
- [x] マルチプレイ（Firebase）
- [x] 44種類の数値形式
- [x] 20言語翻訳対応
- [x] 5種類のミニゲーム
- [x] ゲームログ出力
- [x] HP自動バランス調整
- [x] カスタマイズ可能なルーレット設定
- [x] リアルタイム同期
- [x] モバイル対応

## 💬 FAQ

**Q: オンラインで複数人でプレイできる？**  
A: React版を Firebase 設定で実行すればマルチプレイ可能です。

**Q: スマートフォンで遊べる？**  
A: はい、両方とも対応しています。

**Q: ゲームルールを編集したい**  
A: セットアップ画面のすべての項目がカスタマイズ可能です。

**Q: データは保存される？**  
A: HTML版はブラウザを閉じるとリセット。React版+Firebase版はサーバー保存。

---

**Last Updated**: 2024  
**Made with ❤️ for Game Lovers**
