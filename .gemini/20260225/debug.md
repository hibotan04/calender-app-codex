# Debug Report: TestFlight Local Build Issue

## 調査結果
ユーザーから「なんでtestflightできないの？local build」との相談を受け、以下の調査を行いました。

1. 直近のローカルビルドファイル (`.ipa`) の存在確認
   - プロジェクト直下や `build/` フォルダなどに本日作成された `.ipa` ファイルが存在しませんでした。
2. ローカルビルドの再実行 (`eas build --local --non-interactive`)
   - 依存関係のインストール、Pod installは成功しましたが、Xcodeのビルド（コンパイル）プロセスで以下のエラーが発生し、ビルドが失敗していました。

### エラー内容
```
unable to open output file '.../ExplicitPrecompiledModules/...': 'No space left on device'
```
**原因:** Mac本体のストレージ（空き容量）が不足していたため、Xcodeがビルドファイルを生成できずにクラッシュしていました。（確認時点での空き容量はわずか 3.2GB でした）

## 実施した対応（解決策）
ストレージ不足を解消するため、以下の不要なキャッシュ・一時ファイルを削除しました。
- `~/Library/Developer/Xcode/DerivedData/*` (Xcodeの中間生成ファイル)
- `/var/folders/*/*/*/eas-build-local-nodejs` (EASローカルビルドの過去の一時ファイル)
- `~/.npm/_cacache` (npmの不要なキャッシュ)

これにより、**約8GBの空き容量を確保**し、現在の空き容量は **11GB** となりました。ローカルビルドを完了させるための十分な容量が確保されています。

## 次のステップ (Next Steps)
1. 再度ローカルビルドを実行し、`.ipa` ファイルを生成します。
   ```bash
   eas build --platform ios --local
   ```
2. ビルド成功後、生成された `.ipa` ファイルを Apple (TestFlight) にアップロードします。
   - 方法A: `"Transporter"` アプリ（MacのApp Storeからダウンロード可能）に `.ipa` をドラッグ＆ドロップして送信。
   - 方法B: ターミナルから `eas submit -p ios` コマンドを実行して送信。
