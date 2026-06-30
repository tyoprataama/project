import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const panel = {
  initial: { scale: 0.95, y: 20, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
  exit: { scale: 0.95, y: 20, opacity: 0 },
  transition: { type: "spring" as const, duration: 0.3 },
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={overlay.initial}
          animate={overlay.animate}
          exit={overlay.exit}
        >
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            initial={panel.initial}
            animate={panel.animate}
            exit={panel.exit}
            transition={panel.transition}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Tutup"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {children}
            </div>
            {footer && (
              <div className="border-t border-slate-100 px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
