import type { ReactNode } from "react";
import { motion } from "framer-motion";

const hidden = { opacity: 0, y: 22 };
const shown = { opacity: 1, y: 0 };
const viewportConfig = { once: true, amount: 0.2 };
const easeCurve = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const transition = { duration: 0.65, ease: easeCurve, delay };
  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={viewportConfig}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
