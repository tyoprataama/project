import type { ReactNode } from "react";
import { motion } from "framer-motion";

const enter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={enter.initial}
      animate={enter.animate}
      transition={enter.transition}
    >
      {children}
    </motion.div>
  );
}
