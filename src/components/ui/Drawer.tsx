import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
}

export function Drawer({
  isOpen,
  onClose,
  children,
  side = "left",
}: DrawerProps) {
  const sideClass = side === "left" ? "left-0" : "right-0";
  const offscreen = side === "left" ? "-100%" : "100%";
  const overlay = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const panel = {
    initial: { x: offscreen },
    animate: { x: 0 },
    exit: { x: offscreen },
    transition: { type: "tween" as const, duration: 0.25 },
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/50"
            initial={overlay.initial}
            animate={overlay.animate}
            exit={overlay.exit}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed top-0 ${sideClass} z-50 h-full w-72 bg-white shadow-xl`}
            initial={panel.initial}
            animate={panel.animate}
            exit={panel.exit}
            transition={panel.transition}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
