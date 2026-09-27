// Keyboard 2 - "Shift Layer": ⇧ opens a palette of diacritic letters for the next key
// (double-tap ⇧ to lock it). Sliding across letters types them as one glide.
import { mountKeyboard } from '../core/keyboardView.js';
import { LETTER_ROWS, BOTTOM_ROW } from './shared.js';

const layers = {
  base: [
    LETTER_ROWS[0],
    LETTER_ROWS[1],
    ['⇧', ...LETTER_ROWS[2], '⌫'],
    BOTTOM_ROW,
  ],
  // Every diacritic reachable by long-press on keyboard 1 (same set, one key each).
  shift: [
    ['ɛ', 'ī', 'ĭ', 'ụ', 'ṛ', 'ṟ', 'ṭ', 'ḍ', 'ṇ', 'ñ'],
    ['ṅ', 'ḷ', 'ḻ', 'ś', 'ṣ', 'ḥ', 'ṃ'],
    ['⇧', '⌫'],
    BOTTOM_ROW,
  ],
};

export function initKeyboard(root, { sink, announce }) {
  return mountKeyboard(root, { layers, mode: 'swipe', oneShotLayers: true, sink, announce });
}
