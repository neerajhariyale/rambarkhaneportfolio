// Reference-counted body scroll lock so multiple overlays (nav drawer,
// lightbox) can't clobber each other's lock when one closes.
let count = 0;

export function lockScroll() {
  count += 1;
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  count = Math.max(0, count - 1);
  if (count === 0) document.body.style.overflow = "";
}
