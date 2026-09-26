import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useSettings } from '../../hooks/useData';

export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.01, margin: "50px" });
  const { settings } = useSettings();

  if (!settings.scrollAnimationsEnabled) {
    return <div className={className}>{children}</div>;
  }

  const yOffset = settings.scrollAnimationIntensity === 'subtle' ? 25 : 50;
  const scaleOffset = settings.scrollAnimationIntensity === 'subtle' ? 1 : 0.97;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: yOffset, scale: scaleOffset }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: yOffset, scale: scaleOffset }}
      transition={{ duration: 0.6, delay: inView ? delay : 0, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
