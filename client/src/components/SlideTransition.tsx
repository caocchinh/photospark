"use client";

import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {createPortal} from "react-dom";

const variants = {
  initial: {
    x: "100vw",
    opacity: 1,
  },
  animate: {
    x: 0,
    opacity: 0,
    transition: {
      x: {duration: 1, ease: "easeInOut", when: "beforeChildren"},
      opacity: {duration: 0, ease: "easeInOut", delay: 2},
    },
  },
};

const EndTransition = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center flex-col w-full bg-black"
        initial="initial"
        animate="animate"
        onAnimationStart={() => document.body.classList.add("overflow-hidden")}
        onAnimationComplete={() => {
          document.body.classList.remove("overflow-hidden");
          setVisible(false);
        }}
        variants={variants}
      ></motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default EndTransition;
