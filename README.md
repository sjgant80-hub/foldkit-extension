# foldkit · browser extension

Sovereign browser augmentation. foldkit sidebar on every page. Chrome + Firefox. Manifest V3.

- **Live κ classifier** — highlight any text, sidebar shows the κ band + op + probe
- **Page F(S⃗) fingerprint** — computes a state vector from the page's visible text, shows the fold number
- **Right-click context menu** — send selection to FallMirror / FallPx / FallSignature / Bloom Overlay
- **Popup launcher** — quick access to estate tools
- **Corner HUD** — always-visible current κ band (toggleable)
- **Keyboard shortcut** — `Ctrl+Shift+F` toggles the sidebar

## Install (unpacked)

**Chrome / Edge / Brave**
1. Go to `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `foldkit-extension/` folder

**Firefox**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `foldkit-extension/manifest.json`

## Substrate

- `foldkit.js` — origami mathematics of the 7-prime spine (2·3·5·7·11·13·17 = 510510)
- κ = 1/φ ≈ 0.618 — signal decay per layer
- 7 rings: ground · perception · gate · heart · naming · observation · resolution
- 6 ops: fire · water · void · thunder · echo · flower

## Files

```
manifest.json    · MV3, Chrome + Firefox (gecko id set)
background.js    · service worker · context menu + shortcut
content.js       · shadow-DOM sidebar + HUD, injected everywhere
content.css      · host reset only
foldkit.js       · browser-global build of the ES module
popup.html/js/css · quick launcher
options.html/js  · settings page (HUD toggle, estate endpoints)
icons/           · 16 / 48 / 128 SVG
```

## Aesthetic

Void `#1a1a1e` · Sage `#7a9c7e` · Amber `#d4a052`.  
Cormorant Garamond (serif) · Inter (sans) · JetBrains Mono (mono).

## License

MIT · AI-Native Solutions · 2026 · ◊·κ=1
