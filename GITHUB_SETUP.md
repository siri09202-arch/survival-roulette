# 🚀 GitHub Pages へのデプロイ方法

Survival Roulette を GitHub Pages で公開する手順を説明します。

## 📋 前提条件

- GitHub アカウント
- Git がインストールされている
- テキストエディタ

## ✅ ステップ 1: リポジトリを作成

### 1.1 GitHub で新規リポジトリを作成

1. GitHub にログイン
2. 右上の「+」 →「New repository」をクリック
3. リポジトリ名: `survival-roulette`
4. 説明: `Survival Roulette - A Turn-based Roulette Game`
5. Public を選択
6. README.md にチェック
7. 「Create repository」をクリック

### 1.2 ローカルにクローン

```bash
git clone https://github.com/yourusername/survival-roulette.git
cd survival-roulette
```

※ `yourusername` は自分の GitHub ユーザー名に置き換えてください

## 📁 ステップ 2: ファイルを配置

### 2.1 必要なファイルをコピー

```bash
# 以下のファイルをリポジトリルートに配置
# - index.html
# - README.md
```

ディレクトリ構成：
```
survival-roulette/
├── index.html          # ゲーム本体
├── README.md           # メインドキュメント
├── SETUP.md            # セットアップガイド
└── .github/
    └── workflows/
        └── pages.yml   # GitHub Actions設定（オプション）
```

## 🔧 ステップ 3: GitHub Pages を有効化

### 3.1 リポジトリ設定を開く

1. GitHub でリポジトリを開く
2. 「Settings」タブをクリック
3. 左メニューから「Pages」をクリック

### 3.2 Build and deployment を設定

1. **Source** を確認
   - Deploy from a branch を選択

2. **Branch** を設定
   - Branch: `main`
   - Folder: `/ (root)` を選択
   - 「Save」をクリック

3. 数分待つと URL が表示されます
   ```
   https://yourusername.github.io/survival-roulette/
   ```

## 📤 ステップ 4: ファイルをプッシュ

```bash
git add .
git commit -m "Initial commit: Add Survival Roulette game"
git push origin main
```

## ✨ ステップ 5: 動作確認

1. GitHub ページの URL にアクセス
2. ゲーム画面が表示される確認
3. 「ひとりで遊ぶ」でゲーム開始できるか確認

## 🎯 カスタマイズ

### リポジトリの説明を追加

About セクションで以下を設定：

```
🎰 Survival Roulette - ターン制ルーレットゲーム
```

### Topics を追加

- `game`
- `javascript`
- `react`
- `roulette`
- `turn-based`
- `entertainment`

## 🔐 セキュリティ

### index.html の注意点

- API キーは含まれていません（オフラインモード）
- データはローカルブラウザに保存
- 外部通信なし

### React版を公開する場合

**⚠️ 重要**: Firebase API キーを GitHub に公開しないでください

```javascript
// ❌ 危険: API キーを直接書かない
const firebaseConfig = {
  apiKey: "AIza...", // 公開してはいけない！
};

// ✅ 安全: 環境変数を使用
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
};
```

## 🚀 アップデート手順

コードを更新した場合：

```bash
# ローカルで修正
vim index.html

# コミット
git add index.html
git commit -m "Update: Fix bug or add feature"
git push origin main

# GitHub Pages が自動更新（数秒～数分）
```

## 📊 アクセス統計

GitHub Pages のアクセス情報を確認：

1. Settings → Pages → Analytics
2. アクセス数やリファラー確認可能

## 🆘 トラブルシューティング

### 問題: URL にアクセスしても真っ白画面

**解決策**: 
1. Settings → Pages で Build and deployment を確認
2. ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
3. 数分待つ

### 問題: スタイルが反映されていない

**解決策**:
1. index.html が正しいか確認
2. ブラウザの開発者ツール（F12）でエラー確認
3. リポジトリの GitHub Actions で build エラー確認

### 問題: ローカルで動作するが GitHub Pages で動作しない

**解決策**:
```bash
# サブディレクトリで実行する場合は base path を調整
# index.html の相対パスを確認
```

## 📝 ファイルチェックリスト

公開前に確認すること：

- [ ] index.html が ルートディレクトリに存在
- [ ] GitHub Pages で Build and deployment が main ブランチに設定
- [ ] Settings → Pages で Status が「Your site is live」
- [ ] ゲーム画面が表示される
- [ ] 「SPIN」ボタンでゲーム動作
- [ ] README.md が正しく表示される

## 🎉 完成

以下の URL でゲームを公開できました！

```
https://yourusername.github.io/survival-roulette/
```

友人や SNS でシェアしましょう！

---

## 🔗 参考リンク

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Configuration](https://docs.github.com/en/pages/getting-started-with-github-pages)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)

## 💡 Tips

### カスタムドメインを使用する場合

1. Settings → Pages → Custom domain
2. ドメイン名を入力
3. DNS レコードを設定

### HTTPS が自動有効化

GitHub Pages は自動で HTTPS を適用。特に設定は不要。

### ローカルサーバーでテスト

```bash
# Node.js
npx http-server

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

---

**Happy Gaming! 🎮**
