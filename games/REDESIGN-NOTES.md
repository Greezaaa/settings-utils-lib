# games.su-labs.dev — redesign notes

## Mobile apps
- Skip the App Store for now: Apple charges €99/year, even for a free app.
- iPhone/iPad: the PWA (Add to Home Screen) is the "app".
- Android: the PWA install button, plus optionally Google Play (€25 once). Wrap the site with Capacitor if you do that.
- If it ever goes to the stores, follow the kids rules: no third-party ads or tracking, a parental gate before external links, in-app account deletion.

## Login (Luma-style)
1. The parent enters name + email and gets a 6-digit code by email (Resend / Brevo).
2. After the code is confirmed, offer "Save a passkey?" with WebAuthn (SimpleWebAuthn, server + browser).
3. Next logins: Face ID / Touch ID. The email code stays as the fallback on new devices.
- Kids: under 14 in Spain needs parental consent, so the **parent** registers and creates **child profiles** (nickname + avatar only, no child email). Kids tap their avatar to play.

## Page loading & menus
- View Transitions API: Angular `withViewTransitions()` in the router. A game card morphs into the game screen.
- Menus: floating bottom bar on phones, or a menu that expands out of the button. Use native `popover` + anchor positioning.

## Notifications
- Use `@su-labs/notifications` for in-game toasts: "Ana joined the room", "New record!".
- Later: web push (works on iPhone once the site is installed). Only send messages the user asked for, like room invites; no "come back" nagging.

## Settings panel
### Install section
- Move it out of the settings list into its own card (icon, bold title "Play from your home screen", 2 numbered steps with the real icons).
- Show steps for each browser: Safari (Share at the bottom), Chrome iOS (Share in the address bar), Android/desktop (real Install button).
- Hide it when already installed.

```js
const installed = matchMedia('(display-mode: standalone)').matches;
const isIOS = /iPhone|iPad/.test(navigator.userAgent);
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e; showInstallButton();
});
```

### General
- Contrast: grey labels and helper text are too faint on dark grey. Brighten labels, make helper text a bit bigger.
- Group into sections: **Appearance** (theme, colours, text size, language), **Playing** (answers, offline), **Rooms** (stickers), **Profile** (gender).
- Yes/No pairs become switches; keep segmented buttons for 2–3 choices.
- The theme rows need a label (none above "System"); swap the white circles for small theme previews.
- On phones, use a bottom sheet with a grab handle and close button (Language is currently cut off).
- "Play offline" can be automatic when installed.
- "a boy / a girl" moves to the child profile, asked once: "How should we talk to you?"
