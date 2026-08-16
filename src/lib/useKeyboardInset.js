import { useEffect, useState } from 'react';

// Tracks how much the iOS on-screen keyboard is covering the bottom of the
// viewport in a standalone PWA, so a fixed input bar can lift above it
// instead of being hidden underneath (env(safe-area-inset-bottom) alone
// doesn't account for the keyboard).
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onChange = () => {
      const gap = window.innerHeight - vv.height - vv.offsetTop;
      setInset(Math.max(0, Math.round(gap)));
    };
    onChange();
    vv.addEventListener('resize', onChange);
    vv.addEventListener('scroll', onChange);
    return () => {
      vv.removeEventListener('resize', onChange);
      vv.removeEventListener('scroll', onChange);
    };
  }, []);
  return inset;
}
