// Keyboard 1 - "Long Press": hold a key to open its diacritic variants, slide, release.
import { mountKeyboard } from '../core/keyboardView.js';
import { ALTERNATES, LETTER_ROWS, BOTTOM_ROW } from './shared.js';

const layers = {
  base: [
    LETTER_ROWS[0],
    LETTER_ROWS[1],
    [...LETTER_ROWS[2], '⌫'],
    BOTTOM_ROW,
  ],
};

export function initKeyboard(root, { sink, announce }) {
  return mountKeyboard(root, { layers, mode: 'longpress', alternates: ALTERNATES, sink, announce });
}
