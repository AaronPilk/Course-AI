---
module: 5
position: 4
title: "Publishing to platforms (mobile, PC, console)"
objective: "Ship your game to actual players."
estimated_minutes: 5
---

# Publishing to platforms (mobile, PC, console)

## Platforms overview

Unity supports:
- **PC** (Windows / Mac / Linux). Steam, Epic Games, GOG, itch.io.
- **Mobile** (iOS, Android). App Store, Google Play.
- **Console** (PS5, Xbox, Switch). Platform-specific dev programs.
- **Web** (WebGL). Browser games on itch.io, Newgrounds.
- **VR/AR** (Quest, Vision Pro, Vive). Platform stores.

Each has process + requirements.

## Steam (PC dominant)

For PC distribution:
1. **Steamworks account.** $100 one-time per game.
2. **Steam Direct submission.** Build + upload via Steamworks SDK.
3. **Store page.** Screenshots, trailer, description.
4. **30-day review wait** typically before publishing.
5. **30% Steam cut** (or 20-25% based on volume).

For: vast majority of indie PC sales.

## App Store (iOS)

For iOS:
1. **Apple Developer Program.** $99/year.
2. **Xcode build.** Unity exports to Xcode project; build + sign.
3. **Provisioning profiles + certificates.**
4. **App Store Connect.** Submit build; metadata; screenshots.
5. **App Review.** Apple reviews; reject for various reasons.
6. **30% cut** (15% under $1M annual revenue).

For: iOS distribution; quality bar high.

## Google Play (Android)

For Android:
1. **Google Play Developer account.** $25 one-time.
2. **AAB (Android App Bundle).** Build from Unity (replaces APK for Play Store).
3. **Play Console.** Submit; metadata.
4. **Play Review.** Faster than App Store; less strict.
5. **15% cut** (under $1M annual; 30% over).

For: Android distribution; lower barrier.

## Console (PS5 / Xbox / Switch)

For consoles:
1. **Apply to platform dev program.** Sony / Microsoft / Nintendo.
2. **Get approved.** Indie programs (PlayStation Indies, ID@Xbox, Nintendo Switch indie) lower barrier.
3. **Get devkits.** Physical hardware.
4. **Pass certification** (TRC for Sony / Xbox; lot checks for Nintendo).
5. **Submit to platform store.**

For: console release, allocate months for cert + iteration.

## WebGL (Browser)

For browser games:
- Build → WebGL platform.
- Output is HTML + JS + WASM files.
- Host on itch.io, GitHub Pages, your own site.

Limitations: no multi-threading, file system limited, memory constrained, mobile browser compat varies.

For: easy distribution; demos; itch.io games.

## VR / AR

For Quest:
- Build → Android (Quest uses Android).
- Sideload via SideQuest (informal) or App Lab (official).
- Or get into Quest Store (curation process).

For Vision Pro:
- Build → visionOS (newer Unity support).
- App Store submission similar to iOS.

For: VR/AR-specific UX, hand tracking, etc.

## App store screenshots + assets

Required per store:
- **Multiple screenshot sizes.** Phone, tablet, etc.
- **Trailer / promotional video.**
- **App icon (per platform sizes).**
- **Feature graphic** (Google Play).
- **Description + keywords.**

Investment: hours per store; quality matters for discoverability.

## Pricing + monetization

Models:
- **Premium paid.** $X upfront.
- **Free-to-play with IAP.** In-app purchases.
- **Ads.** Banner / interstitial / rewarded.
- **Subscription.** Monthly access.
- **Free with paid DLC.** Base game free; expansions paid.

Pick by audience + genre. Mobile leans F2P + ads; PC leans premium; consoles vary.

## Analytics

Track player behavior post-launch:
- **Unity Analytics.** Built-in.
- **GameAnalytics.** Free tier; good for indie.
- **Firebase.** Cross-platform.

For: understanding what works + improving via data.

## Crash reporting

For shipped games:
- **Unity Cloud Diagnostics.** Built-in.
- **Firebase Crashlytics.** Cross-platform.
- **Sentry.** Generic crash reporting.

For: identifying post-launch issues.

## Updates + patches

Post-launch:
- Re-build + re-upload to each store.
- Stores have update processes (some faster than others).
- Communicate updates to players (patch notes; in-game messages).

For: ongoing maintenance.

## Marketing

- **Wishlists pre-launch.** Steam, App Store, Google Play.
- **Demos.** Steam Next Fest, Steam demos year-round.
- **Press kit.** Screenshots, trailer, fact sheet.
- **YouTubers / streamers.** Send keys; get coverage.
- **Social media.** Build community pre-launch.

For: discoverability; competing in crowded marketplaces.

## Mistakes to avoid

- **Skip testing on actual platform.** Editor != device.
- **No analytics.** Blind to player behavior.
- **No crash reporting.** Post-launch issues invisible.
- **Underestimating cert time** (consoles).
- **Bad store page assets.** Poor conversion to install.

## Summary

- Platforms: Steam (PC), App Store (iOS), Google Play (Android), Console (PS5/Xbox/Switch), WebGL, VR/AR.
- Each has dev program + cost + review process.
- Build via Unity → submit via platform's portal.
- Marketing + assets + analytics + crash reporting all matter post-launch.

## Course complete

You've covered Unity end-to-end: editor + GameObjects + Components + Scenes + Prefabs + C# scripting + lifecycle + variables + coroutines + events + ScriptableObjects + physics + input + raycasting + UI + Animator + Timeline + audio + VFX + scene management + saves + build pipeline + performance + shipping.

Next steps:
1. Pick a small project (a 5-minute game; one mechanic; one level). Apply everything.
2. Build for your target platform; test on device.
3. Ship to itch.io (low barrier; instant distribution).
4. Engage Unity community (r/Unity3D, Discord, forums) for feedback.
5. Pick next project; larger scope; iterate skills.

Unity's depth is years of learning; the foundations you have now scale to any project size. Specialization comes from doing — character animation, level design, gameplay programming, VFX, audio, multiplayer — pick what excites you most; deepen there. Modern Unity (2024+) is mature + capable; the same engine powers Pokémon GO, Hollow Knight: Silksong, Cuphead, Beat Saber, Genshin Impact, and countless others. Indie + AAA both viable. Welcome to Unity.
