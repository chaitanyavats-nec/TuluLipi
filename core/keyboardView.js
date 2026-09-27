// Renders a keyboard from layout data and drives it with Pointer Events.
//
//   mode 'longpress'  keys with alternates type on release; holding opens an alternates popup
//                     that is chosen by sliding and releasing.
//   mode 'swipe'      letter keys type on release; sliding across letters types them as one
//                     glide (e.g. k -> h = "kh").
//
// Every pointer has its own session, so two-thumb typing, rollover and simultaneous
// backspace-hold all work. Keys are real <button>s: focusable, with roving arrow-key
// navigation, and a click that did not come from a pointer types the key.
import { describeKey } from '../keyboards/shared.js';

const LONG_PRESS_MS = 350;
const REPEAT_DELAY_MS = 350;
const REPEAT_INTERVAL_MS = 55;
const DOUBLE_TAP_MS = 400;
const CANCEL_DRAG_PX = 28;        // dragging this far below the key cancels the popup
const SWIPE_START_RATIO = 0.6;    // finger must travel 60% of a key width to count as a swipe
const PATH_STEP_PX = 6;           // sample spacing when interpolating a fast swipe
const POINTER_CLICK_GUARD_MS = 800;

function parseKey(raw, alternates) {
  switch (raw) {
    case 'space': return { type: 'space', value: ' ', label: 'Space', name: describeKey(raw) };
    case '⏎':     return { type: 'enter', value: '\n', label: '⏎', name: describeKey(raw) };
    case '⌫':     return { type: 'backspace', label: '⌫', name: describeKey(raw) };
    case '⇧':     return { type: 'shift', label: '⇧', name: describeKey(raw) };
    default:      return { type: 'char', value: raw, label: raw, name: describeKey(raw), alternates: alternates[raw] };
  }
}

// ---------------------------------------------------------------- popup
function createPopup(anchor, variants) {
  const el = document.createElement('div');
  el.className = 'diacritic-popup';
  el.setAttribute('role', 'listbox');
  el.setAttribute('aria-label', 'Alternate characters');

  const options = variants.map(variant => {
    const option = document.createElement('div');
    option.className = 'diacritic-variant';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-label', describeKey(variant));
    option.textContent = variant;
    el.append(option);
    return option;
  });

  document.body.append(el);

  const keyRect = anchor.getBoundingClientRect();
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const left = keyRect.left + keyRect.width / 2 - width / 2;
  const top = keyRect.top - height - 8;
  el.style.left = `${Math.max(4, Math.min(left, window.innerWidth - width - 4))}px`;
  el.style.top = `${top < 4 ? keyRect.bottom + 8 : top}px`;

  const popup = {
    variants,
    index: 0,

    select(index) {
      popup.index = index;
      el.classList.toggle('is-cancel', index < 0);
      options.forEach((option, i) => {
        option.classList.toggle('active-variant', i === index);
        option.setAttribute('aria-selected', String(i === index));
      });
      return index;
    },

    /** Choose a variant from a pointer position. */
    pick(x, y) {
      const rect = anchor.getBoundingClientRect();
      if (y > rect.bottom + CANCEL_DRAG_PX) return popup.select(-1);
      if (y >= rect.top && x >= rect.left && x <= rect.right) return popup.select(0);
      if (y < rect.top) {
        let best = 0;
        let bestDistance = Infinity;
        options.forEach((option, i) => {
          const r = option.getBoundingClientRect();
          const distance = Math.abs(x - (r.left + r.width / 2));
          if (distance < bestDistance) { best = i; bestDistance = distance; }
        });
        return popup.select(best);
      }
      return popup.index;            // beside the key: keep the current choice
    },

    close() { el.remove(); },
  };

  popup.select(0);
  return popup;
}

// ---------------------------------------------------------------- keyboard
/**
 * @param {HTMLElement} root
 * @param {object} config
 * @param {Object<string,string[][]>} config.layers   layer name -> rows; must contain "base"
 * @param {'longpress'|'swipe'} config.mode
 * @param {Object<string,string[]>} [config.alternates]
 * @param {boolean} [config.oneShotLayers]  non-base layers revert after one commit (double-tap ⇧ locks)
 * @param {{insert:Function, backspace:Function}} config.sink
 * @param {(message:string)=>void} [config.announce]
 */
export function mountKeyboard(root, config) {
  const { layers, mode, sink, announce = () => {}, oneShotLayers = false } = config;
  const alternates = mode === 'longpress' ? (config.alternates || {}) : {};

  const abort = new AbortController();
  const listen = (target, type, handler) =>
    target.addEventListener(type, handler, { signal: abort.signal });

  const specOf = new WeakMap();
  const sessions = new Map();
  let keys = [];                     // { el, row, col }
  let layer = 'base';
  let locked = false;
  let armedAt = 0;
  let focusIndex = 0;
  let lastPointerAt = -Infinity;
  let keyboardPopup = null;
  let suppressSpaceKeyup = false;

  // ------------------------------------------------------------ rendering
  function render({ focusShift = false } = {}) {
    const hadFocus = root.contains(document.activeElement);
    root.textContent = '';
    keys = [];

    layers[layer].forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'key-row';

      row.forEach((raw, col) => {
        const spec = parseKey(raw, alternates);
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `key key-${spec.type}`;
        el.setAttribute('aria-label', spec.name);
        el.append(document.createTextNode(spec.label));

        if (spec.alternates) {
          el.setAttribute('aria-haspopup', 'listbox');
          el.setAttribute('aria-expanded', 'false');
          const hint = document.createElement('span');
          hint.className = 'key-hint';
          hint.setAttribute('aria-hidden', 'true');
          hint.textContent = spec.alternates[1];
          el.append(hint);
        }
        if (spec.type === 'shift') {
          el.setAttribute('aria-pressed', String(layer !== 'base'));
          el.classList.toggle('is-locked', locked);
        }

        specOf.set(el, spec);
        keys.push({ el, row: rowIndex, col });
        rowEl.append(el);
      });
      root.append(rowEl);
    });

    if (focusShift) focusIndex = Math.max(0, keys.findIndex(k => specOf.get(k.el).type === 'shift'));
    focusIndex = Math.min(focusIndex, keys.length - 1);
    keys.forEach((k, i) => { k.el.tabIndex = i === focusIndex ? 0 : -1; });
    if (hadFocus) keys[focusIndex].el.focus();
  }

  function setLayer(name, options) {
    layer = name;
    cancelAll();
    render(options);
  }

  // ------------------------------------------------------------ commit / shift
  function commit(text) {
    sink.insert(text);
    if (oneShotLayers && layer !== 'base' && !locked) setLayer('base');
  }

  function toggleShift() {
    const now = performance.now();
    if (layer === 'base') {
      locked = false;
      armedAt = now;
      setLayer('shift', { focusShift: true });
      announce('Diacritics layer. Double-tap shift to lock.');
    } else if (!locked && now - armedAt < DOUBLE_TAP_MS) {
      locked = true;
      setLayer('shift', { focusShift: true });
      announce('Diacritics layer locked.');
    } else {
      locked = false;
      setLayer('base', { focusShift: true });
      announce('Letters layer.');
    }
  }

  function activate(spec) {
    if (spec.type === 'backspace') sink.backspace();
    else if (spec.type === 'shift') toggleShift();
    else commit(spec.value);
  }

  // ------------------------------------------------------------ pointer sessions
  const press = el => el.classList.add('is-pressed');
  const release = el => { if (el.isConnected) el.classList.remove('is-pressed'); };

  function keyAt(x, y) {
    const el = document.elementFromPoint(x, y)?.closest('.key');
    return el && root.contains(el) ? el : null;
  }

  function openPopup(session) {
    session.longPress = null;
    session.popup = createPopup(session.el, session.spec.alternates);
    session.el.setAttribute('aria-expanded', 'true');
    navigator.vibrate?.(10);
  }

  function endSession(session, shouldCommit) {
    clearTimeout(session.longPress);
    clearTimeout(session.repeatTimeout);
    clearInterval(session.repeatInterval);
    session.glide.forEach(g => release(g.el));
    release(session.el);

    if (session.popup) {
      const { index, variants } = session.popup;
      session.popup.close();
      session.el.setAttribute('aria-expanded', 'false');
      if (shouldCommit && index >= 0) commit(variants[index]);
    } else if (shouldCommit && !session.immediate && session.spec.type === 'char') {
      commit(session.glide.map(g => g.spec.value).join(''));
    }
  }

  function cancelAll() {
    for (const session of [...sessions.values()]) endSession(session, false);
    sessions.clear();
    closeKeyboardPopup();
  }

  listen(root, 'pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const el = event.target.closest?.('.key');
    const spec = el && specOf.get(el);
    if (!spec) return;

    event.preventDefault();
    lastPointerAt = performance.now();
    try { root.setPointerCapture(event.pointerId); } catch { /* not capturable */ }

    const session = {
      el, spec, immediate: false, swiping: false, travel: 0,
      x: event.clientX, y: event.clientY,
      glide: [{ el, spec }], popup: null, longPress: null,
      repeatTimeout: null, repeatInterval: null,
    };
    sessions.set(event.pointerId, session);
    press(el);

    if (spec.type === 'backspace') {
      session.immediate = true;
      sink.backspace();
      session.repeatTimeout = setTimeout(() => {
        session.repeatInterval = setInterval(() => sink.backspace(), REPEAT_INTERVAL_MS);
      }, REPEAT_DELAY_MS);
    } else if (spec.type === 'shift') {
      session.immediate = true;
      toggleShift();
    } else if (spec.type !== 'char') {
      session.immediate = true;
      commit(spec.value);
    } else if (mode === 'longpress' && spec.alternates) {
      session.longPress = setTimeout(() => openPopup(session), LONG_PRESS_MS);
    } else if (mode === 'longpress') {
      session.immediate = true;
      commit(spec.value);
    }
    // swipe mode: letters wait for release so a glide can collect several keys
  });

  listen(root, 'pointermove', event => {
    const session = sessions.get(event.pointerId);
    if (!session) return;

    const { x: px, y: py } = session;
    session.x = event.clientX;
    session.y = event.clientY;
    session.travel += Math.hypot(session.x - px, session.y - py);

    if (session.popup) {
      session.popup.pick(session.x, session.y);
      return;
    }

    if (session.longPress) {          // sliding off the key before the popup opens = plain tap
      const r = session.el.getBoundingClientRect();
      const inside = session.x >= r.left && session.x <= r.right && session.y >= r.top && session.y <= r.bottom;
      if (!inside) { clearTimeout(session.longPress); session.longPress = null; }
    }

    if (mode !== 'swipe' || session.spec.type !== 'char') return;

    const keyWidth = session.el.getBoundingClientRect().width;
    if (!session.swiping && session.travel > keyWidth * SWIPE_START_RATIO) session.swiping = true;
    if (!session.swiping) return;

    // Walk the path in small steps so fast swipes do not skip keys.
    const distance = Math.hypot(session.x - px, session.y - py);
    const steps = Math.max(1, Math.ceil(distance / PATH_STEP_PX));
    for (let s = 1; s <= steps; s++) {
      const el = keyAt(px + ((session.x - px) * s) / steps, py + ((session.y - py) * s) / steps);
      const spec = el && specOf.get(el);
      const last = session.glide[session.glide.length - 1];
      if (spec && spec.type === 'char' && el !== last.el) {
        session.glide.push({ el, spec });
        press(el);
      }
    }
  });

  const finishPointer = shouldCommit => event => {
    const session = sessions.get(event.pointerId);
    if (!session) return;
    sessions.delete(event.pointerId);
    endSession(session, shouldCommit);
  };
  listen(root, 'pointerup', finishPointer(true));
  listen(root, 'pointercancel', finishPointer(false));
  listen(root, 'lostpointercapture', finishPointer(false));

  listen(window, 'blur', cancelAll);
  listen(document, 'visibilitychange', cancelAll);

  // ------------------------------------------------------------ keyboard / assistive tech
  listen(root, 'click', event => {
    if (performance.now() - lastPointerAt < POINTER_CLICK_GUARD_MS) return;  // pointer path already typed it
    const el = event.target.closest?.('.key');
    const spec = el && specOf.get(el);
    if (spec) activate(spec);
  });

  listen(root, 'focusin', event => {
    const index = keys.findIndex(k => k.el === event.target);
    if (index < 0) return;
    focusIndex = index;
    keys.forEach((k, i) => { k.el.tabIndex = i === index ? 0 : -1; });
  });

  function closeKeyboardPopup() {
    if (!keyboardPopup) return;
    keyboardPopup.close();
    keyboardPopup.anchor.setAttribute('aria-expanded', 'false');
    keyboardPopup = null;
  }

  function moveFocus(direction) {
    const current = keys[focusIndex];
    let target = null;
    if (direction === 'left' || direction === 'right') {
      const next = direction === 'left' ? current.col - 1 : current.col + 1;
      target = keys.find(k => k.row === current.row && k.col === next);
    } else {
      const row = current.row + (direction === 'up' ? -1 : 1);
      const centerX = rect => rect.left + rect.width / 2;
      const from = centerX(current.el.getBoundingClientRect());
      let best = Infinity;
      keys.filter(k => k.row === row).forEach(k => {
        const distance = Math.abs(centerX(k.el.getBoundingClientRect()) - from);
        if (distance < best) { best = distance; target = k; }
      });
    }
    target?.el.focus();
  }

  listen(root, 'keydown', event => {
    const el = event.target.closest?.('.key');
    const spec = el && specOf.get(el);
    if (!spec) return;

    if (keyboardPopup) {
      const last = keyboardPopup.variants.length - 1;
      const handled = {
        ArrowRight: () => keyboardPopup.select(Math.min(last, keyboardPopup.index + 1)),
        ArrowLeft: () => keyboardPopup.select(Math.max(0, keyboardPopup.index - 1)),
        Home: () => keyboardPopup.select(0),
        End: () => keyboardPopup.select(last),
        Escape: closeKeyboardPopup,
        Enter: () => { commit(keyboardPopup.variants[keyboardPopup.index]); closeKeyboardPopup(); },
        ' ': () => { commit(keyboardPopup.variants[keyboardPopup.index]); closeKeyboardPopup(); suppressSpaceKeyup = true; },
      }[event.key];
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        handled();
      }
      return;
    }

    const arrows = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    const opensPopup = event.key === 'ContextMenu' || (event.altKey && event.key === 'ArrowDown');

    if (opensPopup && spec.alternates) {
      event.preventDefault();
      keyboardPopup = Object.assign(createPopup(el, spec.alternates), { anchor: el });
      el.setAttribute('aria-expanded', 'true');
    } else if (arrows[event.key] && !event.altKey) {
      event.preventDefault();
      moveFocus(arrows[event.key]);
    }
  });

  // A Space that selected a popup option must not also click the key on keyup.
  listen(root, 'keyup', event => {
    if (event.key === ' ' && suppressSpaceKeyup) {
      suppressSpaceKeyup = false;
      event.preventDefault();
    }
  });

  render();

  return {
    destroy() {
      abort.abort();
      cancelAll();
      root.textContent = '';
    },
  };
}
