# nicoSlack
Slackのコメントをニコニコ動画風に流します。

## イメージ
![image.png](image.png)

## 使い方
### API Tokenを取得
SlaclのAPI Tokenを取得。  
https://api.slack.com/custom-integrations/legacy-tokens  
※ レガシーのトークンにのみ対応

### ダウンロード
```
# Clone this repository
git clone https://github.com/RikutoYamaguchi/nicoSlack.git
# Go into the repositor
cd nicoSlack
```

### account.jsonにTokenを記入

取得したAPI Tokenを```account.json```に記入。

```
cp account_sample.json account.json
```

```
{
    "token" : "xoxp-xxxxxxxxxxxxxxx"}
}
```

### インストール＆実行

```
# Install dependencies
yarn install
# Run the App
yarn start
```

### Mac環境でのWindowsビルド

以下のツール群をインストールしてから `yarn build` を実行する

```
brew cask install xquartz
brew install wine
brew install winetricks
```

## Lisence
MIT Lisenceのもとで公開されています。
