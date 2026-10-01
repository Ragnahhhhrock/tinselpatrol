# Tinsel Patrol: iOS app and App Store (no Mac needed)

The iOS app is the same game, wrapped with Capacitor. `public/` is still the website; `npm run sync:ios` copies it (plus offline fonts) into `www/` and then into the Xcode project in `ios/`. A cloud Mac (Codemagic) builds, signs and uploads it to TestFlight.

## One-time setup

1. **Apple Developer Program** (US$99/year): https://developer.apple.com/programs/enroll/
2. **App Store Connect > Apps > + New App**: platform iOS, name Tinsel Patrol, bundle ID `com.tinselpatrol.app` (register it first under Certificates, Identifiers & Profiles > Identifiers), SKU `tinselpatrol`. Copy the numeric **Apple ID** from App Information.
3. **API key**: App Store Connect > Users and Access > Integrations > App Store Connect API > generate a key with **App Manager** access. Download the `.p8` once, note the Key ID and Issuer ID.
4. **Codemagic** (https://codemagic.io, sign in with GitHub, add this repo):
   - Teams > Integrations > App Store Connect: add the key and name it `Tinsel Patrol ASC` (or change the name in `codemagic.yaml`).
   - In `codemagic.yaml` set `APP_STORE_APPLE_ID`.
   - Distribution certificate and profile: Codemagic creates them from the API key on the first build (Code signing identities > iOS, "Fetch from Apple" if prompted).
5. **Build**: push a tag, e.g. `git tag ios-1.0.0 && git push --tags`. The build appears in TestFlight in about 15 minutes. Install the TestFlight app on your iPhone and play it.

## Store listing (App Store Connect)

- Name, subtitle, description, keywords, category Games > Casual, age rating questionnaire (cartoon cat tapping is mild).
- **Screenshots**: 6.9-inch iPhone (1320x2868). Capture from the TestFlight build on your iPhone 17 (side button + volume up). Follow the style guide: no emoji, no invented copy.
- **Privacy policy URL**: publish a page on tinselpatrol.com. The game stores a name and score on the public leaderboard (and a hashed IP for rate limiting), so declare "Other User Content" and a hashed identifier honestly in the App Privacy answers. No tracking, no ads.
- Support URL: tinselpatrol.com.
- Review notes: "Single-player arcade game. Online leaderboard is optional; no account needed."

## Review risks to watch

- **4.2 minimum functionality**: the app is a wrapped web game. Haptics, offline play, portrait lock and bundled fonts help; consider Game Center scores later.
- Share chips open web links (X, Facebook, WhatsApp). The native Share sheet is used where available; test on device.
- Store copy must not say "no download needed" (that is website copy).
- Submit by mid-November for Christmas. Reviews slow in December.

## Local commands (on any machine with Node)

```
npm ci
npm run sync:ios     # rebuilds www/ and copies it into ios/
```
