import { useEffect, useRef } from 'react';

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(circle 800px at ${e.clientX}px ${e.clientY}px, rgba(139, 92, 246, 0.03), transparent 80%)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed inset-0 z-50 transition-all duration-500 ease-out"
      style={{
        background:
          'radial-gradient(circle 800px at 50% 50%, rgba(139, 92, 246, 0.03), transparent 80%)',
      }}
    />
  );
}
