"use client";

import {AnimatePresence, motion} from "framer-motion";
import {createPortal} from "react-dom";
import {useState, useEffect} from "react";

const blackBox = {
  initial: {
    height: "100vh",
    opacity: 1,
  },
  animate: {
    opacity: 1,
    height: 0,
    transition: {
      height: {
        delay: 3,
        duration: 1.5,
        ease: [0.87, 0, 0.13, 1],
        when: "afterChildren",
      },
    },
  },
};

const textSVGContainer = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1.5,
    },
  },
};
const text = {
  initial: {
    y: 30,
  },
  animate: {
    y: 80,
    transition: {
      duration: 1.5,
      ease: [0.87, 0, 0.13, 1],
      delay: 1.5,
    },
  },
};

const imageContainer = {
  initial: {
    y: 30,
    opacity: 0,
  },
  animate: {
    y: 62,
    opacity: 1,
    transition: {
      y: {duration: 1.5, ease: [0.87, 0, 0.13, 1], delay: 1.5},
      opacity: {duration: 1, ease: [0.87, 0, 0.13, 1]},
    },
  },
};

const textContainer = {
  initial: {
    opacity: 0,
  },
  animate: {
    y: 30,
    opacity: 1.5,
    transition: {
      duration: 1,
      ease: [0.87, 0, 0.13, 1],
    },
  },
};
const CollabTransition = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center flex-col w-full bg-black"
        initial="initial"
        animate="animate"
        onAnimationStart={() => document.body.classList.add("overflow-hidden")}
        onAnimationComplete={() => document.body.classList.remove("overflow-hidden")}
        variants={blackBox}
      >
        <motion.svg
          className="flex w-full"
          viewBox="0 0 1200 160"
          variants={imageContainer}
          preserveAspectRatio="xMidYMid meet"
        >
          <motion.pattern
            id="image-pattern"
            patternUnits="userSpaceOnUse"
            width="100%"
            height="100%"
            className="text-white"
          ></motion.pattern>

          <image
            href="/vteam-logo-large.png"
            x="500"
            y="70"
            width="160"
            height="160"
            style={{fill: "url(#image-pattern)"}}
            className="object-contain filter invert"
            preserveAspectRatio="xMidYMid meet"
            transform="translate(-80, -80)"
          />
          <image
            href="/vectr-large.png"
            x="710"
            y="90"
            width="125"
            height="125"
            style={{fill: "url(#image-pattern)"}}
            className="object-contain"
            preserveAspectRatio="xMidYMid meet"
            transform="translate(-80, -80)"
          />
        </motion.svg>

        <motion.svg
          className="flex w-full"
          variants={textContainer}
        >
          <motion.pattern
            id="pattern"
            patternUnits="userSpaceOnUse"
            width={750}
            height={800}
            variants={textSVGContainer}
            className="text-white"
          >
            <rect className="w-full h-full fill-current" />
            <motion.rect
              variants={text}
              className="w-full h-full text-gray-600 fill-current"
            />
          </motion.pattern>

          <text
            className="w-full text-6xl font-bold"
            textAnchor="middle"
            x="50%"
            y="50%"
            style={{fill: "url(#pattern)"}}
          >
            VTEAM x VECTR
          </text>
        </motion.svg>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CollabTransition;
