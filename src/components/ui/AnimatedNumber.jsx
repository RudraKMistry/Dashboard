import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useSettings } from "../../hooks/useData";

export default function AnimatedNumber({
  value,
  format = (val) => Math.round(val).toString(),
  className = ""
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const { settings } = useSettings();
  const speed = settings?.animationSpeed || 'normal';

  const springConfigs = {
    slow: { damping: 50, stiffness: 100 },
    normal: { damping: 30, stiffness: 200 },
    fast: { damping: 20, stiffness: 350 },
    instant: { damping: 10, stiffness: 1000 }
  };

  const springValue = useSpring(motionValue, springConfigs[speed] || springConfigs.normal);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });
    return unsubscribe;
  }, [springValue, format]);

  return <span ref={ref} className={className} />;
}
