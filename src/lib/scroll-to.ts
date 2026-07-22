const DURATION = 800;
const NAVBAR_HEIGHT = 72;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(hash: string | null): void {
  const reduced = prefersReducedMotion();

  if (hash === null) {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    return;
  }

  const el = document.querySelector(hash);
  if (!el) return;

  const targetPosition =
    el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;

  if (reduced) {
    window.scrollTo({ top: targetPosition, behavior: "auto" });
    return;
  }

  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  function animate(time: number) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / DURATION, 1);

    window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
