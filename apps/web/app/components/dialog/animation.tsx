import { AnimatePresence as _AnimationPresence, motion } from "framer-motion";
import type { PropsWithChildren } from "react";

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const modalVariants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.15,
    },
  },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

const contentVariants = {
  closed: { opacity: 0, y: 10 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

export const MotionOverlay: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      initial="closed"
      animate="open"
      exit="closed"
      variants={overlayVariants}
    >
      {children}
    </motion.div>
  );
};

export const MotionModal: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      variants={modalVariants}
      initial="closed"
      animate="open"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export const MotionContent: React.FC<
  PropsWithChildren & { custom?: number }
> = ({ children, custom = 0 }) => {
  return (
    <motion.div
      variants={contentVariants}
      custom={custom}
      initial="closed"
      animate="open"
    >
      {children}
    </motion.div>
  );
};

export const AnimatePresence = _AnimationPresence;
