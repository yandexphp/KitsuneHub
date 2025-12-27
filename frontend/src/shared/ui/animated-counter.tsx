import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useSpring(0, { damping: 60, stiffness: 100 });
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toString();
      }
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.span ref={ref} className={className}>
      0
    </motion.span>
  );
}
