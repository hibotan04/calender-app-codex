# TestFlight Local Build Task List

- [x] Check configuration (`eas.json`, `package.json`)
- [x] Run EAS local build for iOS (`eas build --platform ios --profile production --local`)
- [x] Monitor build logs for errors (e.g., C99 errors from previous sessions)
  - [x] Fixed `RNFBStorage` C99 compilation error by updating `withGrpcWorkaround.js`
- [x] Output the IPA file path: `/Users/tadaishireina/アプリ開発/calendar-diary-app/build-1772003504672.ipa`
- [x] Run `sync_git.sh` if any changes were made
- [x] Create an application record in App Store Connect (com.tadaishireina.calendardiary)
- [x] Upload the IPA file to App Store Connect via Transporter
