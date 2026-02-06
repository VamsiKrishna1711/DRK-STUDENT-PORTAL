import { useEffect, useRef } from 'react';

export default function GlowingEffect({ disabled = false, spread = 40, proximity = 64, movementDuration = 300 }) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const evt = e.touches ? e.touches[0] : e;
      const x = evt.clientX || last.current.x;
      const y = evt.clientY || last.current.y;
      last.current = { x, y };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = (180 * Math.atan2(y - cy, x - cx)) / Math.PI + 90;
        el.style.setProperty('--start', String(angle));

        const isActive = x > rect.left - proximity && x < rect.right + proximity && y > rect.top - proximity && y < rect.bottom + proximity;
        el.style.setProperty('--active', isActive ? '1' : '0');
      });
    };

    const handleScroll = () => {
      // update once on scroll so active zone still works
      handleMove(last.current || { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };

    document.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('pointermove', handleMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [disabled, proximity]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="glowing-effect"
      style={{
        '--spread': spread,
        '--start': 0,
        '--active': 0,
      }}
    />
  );
}
