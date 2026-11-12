# Mobile UX & PWA technical capabilities for a premium, calm personal health app (Samsung Android, Swedish, Next.js + Supabase + Vercel)

> Method note: research done 2026-11-12. In this session direct page fetches to developer.mozilla.org, supabase.com and vercel.com were blocked by the sandbox network, so findings from those sites come from search-engine summaries of the official pages (URLs cited are the official pages). Items marked **[unverified]** come from general background knowledge and were not confirmed against a source in this session; they belong to the report writer's "check before relying on" bucket.

## 1. Design principles: what makes Apple Health/Fitness, Material 3 and calm health apps feel premium yet calm

### Takeaway
"Premium + calm" comes from content-first hierarchy (controls recede, content leads), a small number of consistent components, generous spacing, restrained colour (one accent), and non-punitive tone (rest doesn't break streaks, no guilt notifications). Apple's 2025 HIG reframes this as hierarchy / harmony / consistency (Liquid Glass); the older clarity / deference / depth principles express the same idea.

### Cited Findings
- Apple's Liquid Glass overview (2025) says design should "establish hierarchy, create harmony, and maintain consistency across devices and platforms" — [Apple Developer: Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
- Secondary analyses: Liquid Glass is meant for UI that floats *above* content (nav bars, tab bars, toolbars, menus) so content stays primary; avoid glass inside scrolling lists and avoid stacking glass on glass because it "can overwhelm users visually"; consistency "reduces the cognitive load" — [Create with Swift](https://www.createwithswift.com/liquid-glass-redefining-design-through-hierarchy-harmony-and-consistency/); [Captain SwiftUI](https://captainswiftui.substack.com/p/the-northern-stars-of-liquid-glass)
- The earlier HIG triad: Clarity (legible, precise), Deference (UI serves content, never competes), Depth (layers and motion convey hierarchy). Whether Apple still lists these next to the 2025 principles is unconfirmed — [uithings HIG summary](https://uithings.com/apple-human-interface-guidelines)
- Gentler Streak (Slovenia) won a 2024 Apple Design Award (Social Impact) and 2022 Apple Watch App of the Year; its core is a single "Activity Path" visual (TSB-model based) rather than many metrics; rest days don't break streaks; users can set status to resting/sick/injured and the Activity Path is hidden "allowing them to recover without pressure" — [App Store listing](https://apps.apple.com/us/app/id1576857102); [The Next Web](https://thenextweb.com/news/slovenian-fitness-tracker-won-apple-watch-app-of-the-year-award)
- A 2025 Gentler Streak redesign adopted Liquid Glass and a clearer picker for daily / 10-day / 30-day views (i.e. a single segmented time-range control) — [BGR](https://bgr.com/tech/gentler-streak-gets-a-major-redesign-focused-on-your-wellbeing/)
- Reviews characterise Gentler Streak as "soft colors, no guilt-trip notifications, low-friction navigation" (blog, not official) — [Lifestack blog](https://lifestack.ai/blog/gentler-streak)
- Material 3 density guidance: denser layouts are discouraged for touch-first, lower-frequency tasks; density is a deliberate setting, not a default — [Material: Applying density](https://material.io/design/layout/applying-density.html)

### Inferences
- The common pattern across Apple Fitness, Gentler Streak and Happy Scale: **one hero visual per screen** (rings / path / trend line) with secondary numbers below, and progressive disclosure for detail. For an easily overwhelmed user this maps directly to "one primary action per screen".
- Non-punitive framing (no broken streaks, "rest" as a valid state, no red/negative colour for missed days) is a recurring differentiator of the calm apps (Gentler Streak, Finch's self-care framing [unverified for Finch], Headspace).
- **[unverified]** Apple typography conventions: SF Pro, default body 17pt, Large Title 34pt, Dynamic Type scaling; Apple Health uses a large bold number + small unit label + caption pattern. Haptics on iOS are not available to web; on Android web, only `navigator.vibrate()` exists (see §4).
- **[unverified]** Motion in premium apps is short (≈200–350 ms), eased (spring/ease-out), and respects `prefers-reduced-motion`; confetti/celebration used sparingly at real milestones.

### Gaps
- Could not fetch Apple HIG pages for "Health", "Activity rings", "Typography" directly; exact HIG numeric guidance (17pt body, spacing) not verified this session.
- No authoritative design-rationale statements from Headspace, Finch, Bearable or Happy Scale designers were found; their "calm" qualities are inferred from reviews/marketing.

## 2. Logging friction minimisation and accessibility for a middle-aged user

### Takeaway
Logging cost is a documented cause of self-tracking abandonment, so one-tap/defaulted logging is justified — but lowering burden alone does not create a habit; a consistent, visible daily ritual (reminder + same place in the app) matters too. For a 51-year-old, design to Apple/Material targets (44pt/48dp), not the WCAG AA floor of 24 px, and use ≥16–18 px body text with full support for user font scaling.

### Cited Findings
- Epstein et al. ("Beyond Abandonment", survey n=193, interviews n=12) identified six reasons people stop tracking; the *cost of collecting and integrating data* "often leads to abandonment"; people call tracking "a hassle" — [Epstein et al., eScholarship PDF](https://escholarship.org/content/qt0655n3p4/qt0655n3p4.pdf?t=r9metk); [typeset copy](https://typeset.io/pdf/beyond-abandonment-to-next-steps-understanding-and-designing-90r9gtn9y1.pdf)
- Personal-informatics design paper: burden of system maintenance, poor goal-setting support and misaligned user/system goals hinder engagement; proposes seven design strategies — [Fostering engagement with personal informatics systems](https://library.selfresearch.org/research/fostering-engagement-with-personal-informatics-systems/)
- Weight-loss case study comparing wearable vs photo app vs standard database app: participants found it harder to *remember* to use the low-burden tools; habit formation was stronger with the standard app — lower burden ≠ better adherence — [Is burden always bad?](https://library.selfresearch.org/research/is-burden-always-bad-emerging-low-burden-approaches-to-mobile-dietary-self-monitoring-and-the-role-burden-plays-with-engagement/)
- An mHealth app study: sustained use was "closely linked to the regular usage on self-monitoring function"; cites that more than two-thirds of mHealth app downloaders used the app only once — [PMC article](https://pmc.ncbi.nlm.nih.gov/articles/PMC6062090) (search summary; exact article attribution should be double-checked)
- Long-term tracking study (n=184 axSpA patients, up to 593 days): poor adherence to logging limits the utility of self-tracking — [Determinants of longitudinal adherence](https://library.selfresearch.org/research/determinants-of-longitudinal-adherence-in-smartphone-based-self-tracking-for-chronic-health-conditions-evidence-from-axial-spondyloarthritis/)
- WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA, new in 2.2: ≥24×24 CSS px or 24 px spacing offset; inline text links exempt. SC 2.5.5 (AAA, from WCAG 2.1): 44×44 CSS px — [Deque WCAG 2.2](https://dequeuniversity.com/resources/wcag-2.2); [Smashing Magazine](https://smashingmagazine.com/2024/07/getting-bottom-minimum-wcag-conformant-interactive-element-size/)
- Platform targets: Material 3 minimum touch target 48×48 dp (icon may be 24 dp with padding); Apple HIG 44×44 pt; ~8 dp/pt spacing between adjacent targets; 48 dp ≈ 9 mm, 44 pt ≈ 7 mm — [Design Systems Collective field guide](https://www.designsystemscollective.com/a-designers-field-guide-to-wcag-ios-and-android-rules-31ba5d01d46a); [frontendchecklist touch targets](https://frontendchecklist.io/rules/accessibility/touch-targets)
- NN/g older-user research: problems include illegible text, tiny targets, startling sounds; buttons/links often too small to tap; research base 2001, 2013, 2018–19 (focus 65+) — [NN/g: Why design for older adults](https://www.nngroup.com/alertbox/seniors.html)
- Systematic review on font size for older adults on mobile — [PMC9376262](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9376262/) (specific recommended pt values not extracted this session)
- Secondary design guide: body text floor 16 px, 18–20 px better for primary content (not NN/g) — [ZURB: Design for seniors](https://radar.zurb.com/article/design-for-seniors-ship-a-better-product-for-everyone)

### Inferences
- At 51, presbyopia is near-universal **[unverified general medical knowledge]**; NN/g's 65+ findings extrapolate partially. Treat 17–18 px body, 44–48 px targets and WCAG AA contrast (4.5:1 text, 3:1 UI components **[unverified numbers this session, well-known WCAG 1.4.3/1.4.11]**) as the minimum. A lime/green accent on soft white typically **fails** 4.5:1 for text — use lime for fills/rings/large shapes and a dark green or near-black for text on/near it.
- Friction patterns to adopt: prefilled defaults (yesterday's weight, usual protein portion chips like "+20 g", "+30 g"), steppers instead of keyboards, a single "Logga" sheet reachable from Today, and **undo-toast instead of confirm dialogs** (NN/g-style guidance on confirmations [unverified this session]).
- Because low burden alone didn't build habit in the cited study, pair one-tap logging with a fixed daily ritual: one reminder at a chosen time leading to the Today screen.

### Gaps
- No peer-reviewed evidence specifically on "undo vs confirm" in health logging was found in this session.
- No study specifically on women 45–55 and app overwhelm was found.

## 3. Data visualisation for weight and body measurements

### Takeaway
Show a smoothed trend line as the hero, with daily weigh-ins as faint dots; this is the established approach (Happy Scale, Libra, Hacker's Diet lineage) to reduce stress from day-to-day water-weight noise. Happy Scale's own docs confirm a moving-average trend with a predictor plus a "10-day-best" emphasis.

### Cited Findings
- Happy Scale uses "an advanced mathematical formula to pick out the trend while performing a moving average"; offers a separate "Happy Scale Smoothing" mode (recommended) that "excels at both predicting what you weigh today and predicting what your weight trend is"; emphasises your "10-day-best to counteract your body's natural weight fluctuations" — [Happy Scale Support](https://happyscale.com/support)
- Forum claim (unverified): Libra uses a simple moving average trendline, which "trail[s] significantly behind the actual data" — [MyFitnessPal forum](https://community.myfitnesspal.com/en/discussion/comment/42063635); [MyFitnessPal: best weight trend app](https://community.myfitnesspal.com/en/discussion/comment/37014281)
- Users actively seek Android equivalents of Happy Scale (evidence of demand for trend-smoothing on Android) — [Fitbit community thread](https://community.fitbit.com/t5/Android-App/Looking-for-an-android-alternative-to-Apple-s-Happy-Scale-app/td-p/5129928)
- Cronometer users request smoothing averages for weight trends — [Cronometer forum](https://forums.cronometer.com/discussion/3530/view-weight-trends-with-smoothing-averages)

### Inferences
- **[unverified]** The Hacker's Diet (John Walker) used an exponentially smoothed moving average with ~10% weight on the newest value (trend_t = trend_{t-1} + 0.1·(w_t − trend_{t-1})); this is a robust, simple choice that handles irregular weigh-ins better than a fixed-window SMA. Time-aware EMA (alpha scaled by days elapsed) handles skipped days.
- Copy should describe *trend*, not today's number: e.g. "Trend: −0,4 kg senaste 2 veckorna" (Swedish decimal comma). Avoid red for gains; use neutral grey and calm language.
- Body measurements (midja, höft, etc.) are logged rarely (weekly/monthly); show as small-multiple sparklines or a "since start" delta list rather than a dense multi-line chart. For a GLP-1 (Mounjaro) user, waist and non-scale progress may be motivating when the scale stalls.
- Default chart ranges: 30 dagar / 90 dagar / allt, one segmented control (mirrors Gentler Streak's daily/10-day/30-day picker).

### Gaps
- Happy Scale's exact algorithm is not public; Libra's algorithm not confirmed from primary source.
- No peer-reviewed study on whether trend lines reduce weighing-related distress was found in this session.

## 4. PWA capabilities on Android (Chrome & Samsung Internet), 2025–2026

### Takeaway
Everything needed is feasible on Android: installable PWA, Web Push (server-sent), Screen Wake Lock for the workout timer, vibration, and speech synthesis. The hard limit is **scheduling**: there is no shipped way for a PWA to schedule local notifications (Notification Triggers was abandoned), so reminders must be sent from a server on a schedule. Timers in a backgrounded page are throttled/suspended, so the workout timer must be timestamp-based and keep the screen on.

### Cited Findings
**Install**
- Chrome removed the requirement for a service worker with a fetch handler for menu installation (Chrome 108 mobile / 112 desktop) and is experimenting with simplifying manifest requirements — [Chrome: Revisiting installability criteria](https://developer.chrome.com/blog/update-install-criteria)
- Third-party guides still state `beforeinstallprompt` needs a registered service worker + valid manifest; treat as conflicting/unsettled — [PWA workshop](https://pwa-workshop.js.org/5-pwa-install/); [frontendchecklist PWA installability](https://frontendchecklist.io/rules/html/pwa-installability)

**Web Push**
- Samsung Internet for Android supports the Notification API and Push API since v4; push relies on service worker support — [Samsung Internet developer docs: PWAs](https://samsunginternet.github.io/docs/progressive-web-apps)
- Push requires HTTPS + active service worker; on Android a user can receive push after granting permission in the browser, even without installing to home screen (vendor guide) — [MobiLoud](https://www.mobiloud.com/blog/pwa-push-notifications/)
- Known Samsung quirk: when Samsung Internet is the default browser, notification taps for a TWA/installed app may open the browser instead of the app — test on device — [PWABuilder issue #4777](https://github.com/pwa-builder/PWABuilder/issues/4777)
- Payload limit ~4 KB cited informally (verify against spec) — [GitHub issue note](https://github.com/fresnizky/cohort-005-project/issues/5)

**Notification Triggers (local scheduled notifications)**
- Chrome-docs mirror: "development of Notification Triggers API, part of Google's capabilities project, is no longer pursued"; only had origin trials Chrome 80–83 and 86–88; used `showTrigger: new TimestampTrigger(ts)` — [Chrome docs mirror](https://chromeextensionsdocs.appspot.com/docs/web-platform/notification-triggers/); official page (no clear deprecation banner in search snapshot, past tense) — [developer.chrome.com](https://developer.chrome.com/docs/web-platform/notification-triggers)
- Conflict note: discontinuation statement found only on the mirror, but the API never shipped beyond origin trials in either source — either way it is unusable in production.

**Screen Wake Lock**
- Supported in all major browsers since May 2024 (Chrome, Safari 16.4+, Firefox); MDN marks it Baseline 2025 — [web.dev blog](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers); [MDN](https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API)
- Samsung Internet supports it from v14.0 — [Can I Use: wake-lock](https://caniuse.com/wake-lock)
- HTTPS only; the lock is released automatically when the page becomes hidden (tab switch, minimise); re-acquire on `visibilitychange` when visible again — [Chrome Developers: Wake Lock](https://developer.chrome.com/docs/capabilities/web-apis/wake-lock); [MDN](https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API)

**Background timers / audio**
- Chrome throttles background-page timers (≥1 s per timer since Chrome 11; Chrome 57 added budget-based throttling after 10 s hidden); pages playing *audible* audio (audio icon shown) or holding WebRTC/WebSocket connections are exempt; silent audio does not qualify — [Chrome blog: Background tabs in Chrome 57](https://developer.chrome.com/blog/background_tabs); [blink-dev Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/XRqy8mIOWps)
- 2016 blink-dev statement: background tabs on Android suspended after 5 minutes in background (dated) — [blink-dev Intent to Implement](https://groups.google.com/a/chromium.org/g/blink-dev/c/-dmrNAFHd-4)
- Web Audio scheduling runs on a high-priority audio thread and avoids timer drift (blog) — [Hackernoon](https://hackernoon.com/the-hidden-bug-breaking-most-javascript-timers?source=rss)

**Speech synthesis (Swedish)**
- Chrome on Android doesn't return the real list of installed voices; it returns an unfiltered list of languages/regions; voice availability varies by OEM, device and Android version — [Readium: SpeechSynthesis in browsers and OSes](https://readium.org/speech/docs/WebSpeech.html)
- On Samsung Internet, voices come from the installed Google TTS or Samsung TTS engine — [TestMu speech synthesis support](https://www.testmuai.com/learning-hub/speech-synthesis-api-browser-support/)
- `getVoices()` loads asynchronously; listen for `voiceschanged` — [MDN getVoices mirror](https://www-igm.univ-mlv.fr/~forax/MDN/developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices.html)

### Inferences
- **Workout timer design:** store `startedAt`/`phaseEndsAt` timestamps (and persist to IndexedDB/localStorage) and compute remaining time from `Date.now()` on every frame/visibility change, so a throttled or suspended page resyncs correctly. Hold a Wake Lock during workout mode and re-acquire on `visibilitychange`. Cues (beep/vibration/voice) only reliably fire while the screen is on and app foregrounded — say so in the UI ("Håll skärmen på under passet").
- **Music + timer:** if she plays Spotify in its own app, Spotify's audio is a different app; our page is then not "audible", so it gets throttled if backgrounded. Keeping our PWA in the foreground with Wake Lock is the realistic path; don't promise beeps while she's in Spotify.
- **Audio cues:** short pre-generated audio clips (Swedish voice recorded or generated once with a high-quality TTS and shipped as MP3/OGG) are more reliable than `speechSynthesis`, given Android voice-list unreliability. Use `speechSynthesis` with `lang='sv-SE'` only as an optional fallback. Note: audio cues will duck/mix with Spotify depending on Android audio focus **[unverified]**.
- **Vibration:** **[unverified this session]** `navigator.vibrate()` works in Chrome Android and Samsung Internet (not iOS Safari) and requires a user gesture/sticky activation; respects system vibration settings. Use short patterns (e.g. 40 ms on tap-confirm, [200,100,200] at phase change).
- **Offline:** **[unverified this session]** a service worker (e.g. Serwist, the maintained successor to next-pwa for Next.js App Router) can precache the app shell and today's workout; logging offline needs a local queue (IndexedDB) synced on reconnect. Background Sync API exists in Chromium (Chrome/Samsung) but not Safari.
- **Push permission UX:** ask for notification permission only after she has set a reminder time in-app (contextual prompt), not on first load — Chrome may show quieter permission UI for sites with low accept rates **[unverified: quiet-UI behaviour not confirmed this session]**.

### Gaps
- Exact Samsung Internet version currently shipped and its push reliability vs Chrome under Samsung's aggressive battery optimisation ("Sleeping apps") not verified; anecdotally Samsung battery management can delay pushes — needs on-device testing.
- Current (2026) Chrome `beforeinstallprompt` eligibility rules not confirmed from primary source.
- No confirmation that an installed PWA in Chrome Android 2026 escapes the 5-minute background suspension.

## 5. Opening Spotify / YouTube playlists from a PWA

### Takeaway
Simplest robust approach: store her playlist URLs (`https://open.spotify.com/playlist/...`, `https://music.youtube.com/playlist?list=...` or `https://www.youtube.com/playlist?list=...`) and open them with a normal link; Android's app-link handling usually hands these to the installed app. Embeds are second-class: the Spotify embed only plays 30-second previews unless the user is logged in to Spotify *in that browser* and `allow="encrypted-media"` is present.

### Cited Findings
- Spotify embed: non-logged-in visitors hear a preview and are asked to log in; can't be changed from embed code; full playback requires being logged in to spotify.com in the browser plus `allow="encrypted-media"` on the iframe — [Spotify Community](https://community.spotify.com/t5/Spotify-for-Developers/30-second-preview-showing-when-try-to-embed-playlist/m-p/5655484/highlight/true)
- Developers report only 30 s previews in Android WebView embeds — [Spotify Community: Android WebView](https://community.spotify.com/t5/Spotify-for-Developers/Only-30s-preview-on-Android-WebView-embeds/td-p/5386262)
- Spotify's Android docs: by default Android restricts WebViews and prevents deep-linking into apps — [Spotify for Developers: Android content linking](https://developer.spotify.com/documentation/android/tutorials/content-linking)
- In-app browsers (Instagram/TikTok/Messenger) often ignore universal/app links; `spotify.link` short links can open the app but fail to resolve the track — [Linkly](https://linklyhq.com/support/spotify-open-links-in-app); [Spotify Community: shared links](https://community.spotify.com/t5/Android/Shared-links-doesn-t-work/m-p/5588584)

### Inferences
- An installed PWA in Chrome/Samsung is not a WebView, so `open.spotify.com` links should be routed by Android to the Spotify app if installed **[unverified on-device]**. Use full `open.spotify.com/playlist/{id}` URLs, not `spotify.link` short links.
- **[unverified]** Fallback: `spotify:playlist:{id}` URI scheme or Android `intent://` URL (`intent://playlist/{id}#Intent;scheme=spotify;package=com.spotify.music;S.browser_fallback_url=...;end`) as a secondary option if plain links open the web player.
- Opening Spotify leaves the PWA; the workout screen loses foreground (wake lock released, timers throttled). Recommended flow: "Starta musik" button *before* "Starta passet", then she returns to the app and the timer starts. Re-acquire wake lock on return.
- YouTube embed (iframe API) can play full videos inline but YouTube may pause background playback for non-Premium users **[unverified]**; for music, deep-linking to YouTube Music app is cleaner.

### Gaps
- No primary source confirmed Android 14/15/16 app-link routing behaviour for links clicked inside an installed PWA on Samsung devices.

## 6. Supabase Auth long-lived sessions, Storage for private images, scheduled push via pg_cron + Edge Functions / Vercel cron

### Takeaway
Supabase sessions can effectively last indefinitely: refresh tokens don't expire (single-use, rotated), so as long as the client refreshes, she stays logged in; optional inactivity/time-box limits exist. Scheduled reminders are best done with Supabase pg_cron + pg_net calling an Edge Function every minute (or every 5–15 min) which sends Web Push; Vercel Hobby cron is too coarse (once/day, ±59 min).

### Cited Findings
- Refresh tokens "never expire" but can be used only once; each exchange returns a new access/refresh pair — [Supabase: Sessions](https://supabase.com/docs/guides/auth/sessions); [Supabase JS auth reference](https://supabase.com/docs/reference/javascript/auth)
- Optional inactivity timeout and time-boxed sessions configured in Auth settings; effective session length = timeout + JWT expiry; sessions are not proactively terminated — enforcement happens at next refresh — [Supabase: Sessions](https://supabase.com/docs/guides/auth/sessions)
- Access-token lifetime set via "JWT expiry limit" in project auth settings — [Supabase JS auth reference](https://supabase.com/docs/reference/javascript/auth)
- Community reports of unexpected logouts mostly trace to throttled JS timers / backgrounded mobile apps failing to refresh (anecdotal) — [WeWeb community](https://community.weweb.io/t/supabase-auth-plugin-session-expiring-after-tab-duplication-or-inactivity/18715)
- Scheduling: hosted Supabase supports pg_cron; with pg_net it can invoke Edge Functions periodically; store `project_url` and key in Supabase Vault and read from `vault.decrypted_secrets`; example `cron.schedule(..., '* * * * *', $$ select net.http_post(url := .../functions/v1/function-name, ...) $$)` — [Supabase: Scheduling Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions)
- Sub-minute schedules (e.g. '30 seconds') available on pg_cron ≥1.5.0 — [Supabase: pg_cron](https://supabase.com/docs/guides/database/extensions/pgcron)
- Vercel Cron: Hobby = once per day, per-hour precision (±59 min; `0 1 * * *` fires 1:00–1:59); Pro = once per minute with per-minute precision; more frequent expressions fail at deploy — [Vercel: Cron usage & pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- Conflicting: a newer Vercel "Schedules" page describes different Hobby behaviour (jitter 1–15 min, possibly every 15 min) — check which product applies — [Vercel Schedules](https://vercel.com/docs/schedules)

### Inferences
- **Auth in PWA:** Using `@supabase/ssr` with cookie storage in Next.js keeps the session across app restarts; on reopening after days, the client exchanges the refresh token on load (`autoRefreshToken`), so she stays logged in unless the refresh token was already used/revoked. Leave inactivity timeout **off** for this single-user app. Magic-link login is awkward in an installed PWA on Android (email link opens in browser, not the PWA) **[unverified on-device]** — prefer email + password or email OTP code (6-digit code typed into the app) for first login.
- **Storage for private images (progress photos):** private bucket + RLS policies keyed on `auth.uid()` and signed URLs with short expiry **[unverified this session; standard Supabase pattern]**. Strip EXIF/location client-side before upload; consider client-side resize to ~1600 px.
- **Push architecture:** `push_subscriptions` table (endpoint, p256dh, auth, user_id, created_at) + `reminders` table (time-of-day, weekdays, timezone 'Europe/Stockholm', last_sent_at). pg_cron every minute (or every 5 min) → Edge Function selects due reminders (computing local time in Europe/Stockholm, DST-aware) → sends via Web Push with VAPID keys. In Deno Edge Functions, the npm `web-push` package may or may not work due to Node crypto dependencies **[unverified]**; alternatives are a Deno-native web-push library, or have the Edge Function call a Next.js Route Handler on Vercel (Node runtime) that uses `web-push`. Delete subscriptions on 404/410 responses.
- Idempotency: update `last_sent_at` in the same transaction/statement to avoid double notifications if cron overlaps.

### Gaps
- Supabase free-plan constraints (project pause after inactivity — **[unverified]**, historically 7 days) could break scheduled push for a single-user app on the free tier; confirm current policy and consider Pro or a keep-alive.
- Whether `web-push` npm runs in Supabase Edge Functions (Deno 2 npm compat) in 2026 not verified.
- Storage signed-URL defaults and image-transformation availability per plan not verified.

## App design & technical implications

### Navigation & structure
- **3 bottom tabs** (fewer than the usual 4–5, to reduce overwhelm): **Idag** (Today), **Framsteg** (Progress), **Mer** (playlists, settings, measurements history, profile). Logging is not a tab but a single persistent **"+ Logga"** button on Idag (and optionally a floating button), opening a bottom sheet.
- **Idag** layout top-to-bottom: greeting + date (small); **one hero card** = today's main activity with one primary button ("Starta passet" / "Promenad 30 min"); a compact row of 3–4 "ring-like" progress indicators (protein, vatten, rörelse) with one-tap increment; a "Hur mår du?" mood/energy check-in chip row. Nothing else above the fold.
- **One primary action per screen**; secondary actions as text buttons or in overflow. Progressive disclosure for details (tap card → detail).
- **Workout mode** = full-screen, distraction-free: huge countdown (≥72–96 px digits, tabular numerals), current exercise name, next exercise preview, one large Pause/Fortsätt button (≥64 px), swipe/skip secondary. Wake Lock on; vibration + short audio cue at phase changes; visible "screen stays on" note.

### Typography & visual
- Font: system/variable sans with tabular numerals — e.g. Inter or Geist (Vercel) **[design choice]**; on Samsung the system default is One UI Sans, so ship a webfont for consistent "Apple-like" feel.
- Sizes (CSS px, scaling with user font settings via `rem`; don't block zoom): body 17–18, secondary 15–16 (never below 14 for meaningful text), section titles 20–22 semibold, screen titles 28–34 bold, hero metric numbers 40–56. Line-height 1.4–1.5.
- Colour: soft white background (e.g. #FAFAF7), near-black text (#1C1C1E-ish), neutral greys for secondary; **lime only for fills/progress/large accents**; text-on-lime must be dark; dark-green variant for text/links to meet 4.5:1. Dark mode via `prefers-color-scheme` + manual toggle. No red for weight gain or missed days.
- Spacing: 16–20 px screen gutters, 12–16 px card padding, 8 px min gap between targets; cards with large radius (16–24 px) and subtle shadows/borders rather than heavy elevation.
- Touch targets: **≥48×48 px** everywhere (exceeds WCAG 2.2 AA 24 px and matches Material 48 dp/Apple 44 pt); 56–64 px for primary actions.

### Interaction patterns
- One-tap logging with **smart defaults**: water "+1 glas (2,5 dl)"; protein chips of her common portions (learned from history) plus a stepper; weight pre-filled with last value, adjust with ±0,1 steppers or numeric keypad (`inputmode="decimal"`, Swedish comma accepted).
- **Undo toast** ("Sparat · Ångra", 5–6 s) instead of confirmation dialogs; edit/delete in history.
- Mood/energy: 5-point emoji/word scale + optional short note; never mandatory fields.
- Motion: 200–300 ms ease-out; gentle check animation on log; honour `prefers-reduced-motion`. Haptic: `navigator.vibrate(30)` on successful log (Android only, feature-detect).
- Tone: non-punitive Swedish microcopy; "vila" is a valid day; no streak loss shame; celebrate weekly consistency rather than daily perfection.

### Charts
- Weight: EMA trend line (hero) + faint daily dots, ranges 30 d / 90 d / Allt, headline = trend delta, not today's weight. Measurements: "sedan start" list + small sparklines. Library: Recharts or visx (React) or lightweight uPlot/Chart.js; keep axes minimal, no gridline clutter, large touch-friendly tooltips.

### Technical stack & architecture
- Next.js (App Router) on Vercel; PWA via **Serwist** (`@serwist/next`) for service worker, precaching and offline shell **[verify current recommended lib]**; web app manifest with `display: standalone`, theme/background colours, maskable icons; custom in-app install hint (capture `beforeinstallprompt` when available, else show "Lägg till på startskärmen" instructions for Chrome and Samsung Internet).
- Auth: Supabase `@supabase/ssr`, email+password or email OTP code; refresh tokens rotate indefinitely; leave inactivity timeout off.
- Data: Supabase Postgres with RLS on every table; local optimistic UI + IndexedDB queue for offline logs (e.g. TanStack Query with persisted cache).
- Storage: private bucket for progress photos, signed URLs, client-side EXIF strip + resize.
- **Push:** VAPID Web Push. Reminders scheduled server-side with **Supabase pg_cron + pg_net → Edge Function** every 1–5 min (Vercel Hobby cron is once/day ±59 min, unusable for user-chosen times; Vercel Pro cron per-minute is an alternative). Store reminders in Europe/Stockholm local time, DST-aware. Clean up expired subscriptions (404/410). Ask notification permission contextually after she picks a reminder time. Keep to 1–2 notifications/day max. Do **not** rely on Notification Triggers (abandoned) or client timers for reminders.
- Workout timer: timestamp-based state, Wake Lock + visibility re-acquire, Web Audio or preloaded short audio clips for cues (pre-recorded Swedish voice preferred over `speechSynthesis`; `speechSynthesis` with `lang: 'sv-SE'` as optional fallback with feature-detection).
- Music: store playlist URLs; open with plain `https://open.spotify.com/playlist/...` links (target `_blank`/same tab) so Android routes to the Spotify app; avoid relying on embeds (30-s previews unless logged in in-browser). Flow: start music → return → start timer.
- Testing priorities on her actual Samsung phone: install flow in both Chrome and Samsung Internet; push delivery with Samsung battery optimisation (exempt browser from "Sleeping apps" if needed); wake lock during a 30-min session; Spotify link routing; Swedish TTS availability.
