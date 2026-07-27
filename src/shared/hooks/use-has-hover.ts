import { useSyncExternalStore } from "react";

// `(hover: hover)` alone, deliberately. Pairing it with `(pointer: fine)`
// is unreliable: Chrome's device emulation (and some real touch devices)
// still report a fine pointer, so requiring both makes the hook claim
// hover support on a phone — the desktop cluster takes over and the
// mobile quick-view button disappears. This is also the signal Tailwind
// uses to gate its own `hover:` variants.
const HOVER_QUERY = "(hover: hover)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * True only on devices that can actually hover (mouse/trackpad).
 *
 * Touch browsers simulate :hover and fire mouse events on tap, so hover
 * UI must be gated on input capability rather than viewport width — that
 * also gets touch laptops and tablets right.
 */
export function useHasHover() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(HOVER_QUERY).matches,
    // Server snapshot: assume no hover, so hover-only UI is never in the
    // HTML sent down and can't mismatch on hydration.
    () => false,
  );
}
