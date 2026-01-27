## Mobile (Capacitor)

### App IDs (Bundle ID / Application ID)
- Default App ID: `com.oriflame.coast`
- To change it for release builds, set:
  - `CAPACITOR_APP_ID=com.yourcompany.oriflamecoast`
  - `CAPACITOR_APP_NAME=Oriflame Coast`

Then run `npm run mobile:sync` again so iOS/Android projects pick up the new identifiers.

### Server URL (what the native app loads)
- Default: `https://oriflame-coast-frontend-iota.vercel.app`
- To point to a different environment (staging/prod), set:
  - `CAPACITOR_SERVER_URL=https://your-vercel-domain.vercel.app`

Then run `npm run mobile:sync`.

### iOS build (App Store / TestFlight)
1) Open the iOS project: `npm run cap:open:ios`
2) In Xcode:
   - Set Team (Signing & Capabilities)
   - Confirm Bundle Identifier matches your Apple Developer account
   - Archive and upload to App Store Connect

### Android build (Play Store)
1) Open the Android project: `npm run cap:open:android`
2) In Android Studio:
   - Set signing config for release
   - Build an AAB for Play Console

