# Tulu-Tigalari Keyboard

A transliteration keyboard prototype: type Tulu in Latin phonetic letters and see Tulu-Tigalari
script appear. It hosts two input methods so they can be compared in a typing test.

| Keyboard | Diacritics | Combined sounds |
|---|---|---|
| **Long Press** | hold `n`, `t`, `s`, ... and slide to a variant | - |
| **Shift Layer** | tap `⇧` for a diacritic palette (one-shot; double-tap to lock) | slide across letters (`k` → `h` = `kh`) |

A physical keyboard also works. Copy exports the Tulu-script text.

## Run

The app uses ES modules, so it must be served over HTTP (opening `index.html` from disk will not work).

```
npm start        # http://localhost:8080  (needs Node; serves with caching off)
npm test         # unit tests (node:test, no dependencies)
```

## Layout

```
index.html, style.css, main.js   page shell and wiring
core/store.js                    the typed text (single source of truth)
core/keyboardView.js             renders a layout + Pointer Events input (taps, long-press, swipe, repeat)
core/display.js                  output panes, suggestions, Copy, Reset
core/hardware.js                 physical-keyboard input
keyboards/keyboard1.js, 2.js     layouts as data (Long Press / Shift Layer)
keyboards/shared.js              alternates and rows shared by both keyboards
translit/tuluMap.js              romanisation -> Unicode mapping (data)
transliteration.js               shaping logic: vowels, conjuncts, virama
predictiveEngine.js, words.js    diacritic-insensitive word prediction over the lexicon
testmode.js                      typing test (logic + view)
tests/                           unit tests
```

## Input behaviour

- Every finger is tracked separately, so two-thumb typing and rollover work.
- Keys with alternates (Long Press) type on release; other keys type on press.
- Backspace repeats while held and always stops on release or cancel.
- Keys are real buttons: `Tab` into the keyboard, arrow keys move between keys, `Enter`/`Space` types,
  `ContextMenu` (or `Alt+↓`) opens a key's alternates, arrows choose, `Enter` commits, `Esc` cancels.
- Typing-test accuracy is keystroke accuracy: characters typed right the first time / characters typed.

## Transliteration rules

- `ka` → KA (the `a` is the inherent vowel); `kaa`, `ki`, ... use dependent vowel signs.
- A consonant not followed by a vowel gets a virama (`k` → K + virama), so word-final consonants render correctly.
- Consecutive consonants are joined with the conjoiner (`kra`). Type `_` to force a virama instead (`k_ra`).
- `e`/`ē`/`ɛ` → EE and `o`/`ō` → OO (the script has no separate short forms).
- Uppercase and decomposed (NFD) input are normalised.

## Open questions for a Tulu / Unicode reviewer

These were inherited from the earlier prototype or decided provisionally while fixing bugs:

1. **`ụ` / `ụụ`** keep the original dependent signs (U+113BB and U+113CF); independent forms were added
   so a standalone `ụ` no longer disappears. Confirm the correct signs.
2. **Repha (U+113D1)** is not produced. The earlier branch was unreachable; the encoding order for repha
   needs confirming before it is implemented.
3. **Short `e` / `o`** map to EE / OO. If Tulu needs a distinction, the block has no separate letters for it.
4. **`ḷ`, `ḻ`, `ṟ`** now map to LLA (U+113B3), LLLA (U+113B5) and RRA (U+113B4). Vocalic L (previously on `ḷ`)
   is no longer typeable.
5. **Digits** were removed from the map (only `0` and `1` were guessed). Add all ten once the code points
   are confirmed; they currently pass through as ASCII.
6. **Keys removed** because nothing maps them: `q w f x z`. Re-add to `keyboards/shared.js` if a mapping is chosen.
7. **Lexicon**: all entries have `frequency: null`, so ranking uses dialect/region only. `latin_phonetic`
   contains IPA symbols, so suggestions insert `variant` (the typeable spelling), not `latin_phonetic`.
