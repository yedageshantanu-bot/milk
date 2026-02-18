Mobile APK build instructions

- Build locally (requires Node, npm, JDK 17, Android SDK/NDK and Gradle):

  1. Install dependencies: `npm ci`
  2. Build web assets: `npm run build`
  3. Initialize Capacitor (only first time): `npm run mobile:init`
  4. Add/sync Android: `npm run mobile:sync`
  5. Build release APK: `cd android && ./gradlew assembleRelease`
  6. The APK will be at `android/app/build/outputs/apk/release/`.

- CI build (GitHub Actions):
  - Push to `main` or run the workflow manually (`Actions` → `Build Android APK`).
  - The workflow builds the web app, runs `npx cap sync android` and runs Gradle to assemble a release APK.
  - The produced APK is available as a workflow artifact named `android-apk`.

- Generate a QR code (after you have a download URL for the APK):
  - Install `qrcode` locally: `npm i qrcode`
  - Run: `node tools/generate-qr.js "https://example.com/path/to/app.apk" ./app-qrcode.png`

Notes:
- Building an APK requires an Android build environment. If you want, I can:
  - Run the CI build (which will produce an APK artifact) or
  - Help you set up a release signing configuration for a production APK.
