import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(10px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Stagger container for child animations
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Fade in animation for individual elements
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Scale in animation
const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Slide in from left
const slideInLeft = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Slide in from right
const slideInRight = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Main Page Transition wrapper
export function PageTransition({ children, className = "", ...props }) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger Container for sequential animations
export function StaggerContainer({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade In Up animation wrapper
export function FadeInUp({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale In animation wrapper
export function ScaleIn({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={className}
      variants={scaleIn}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide In Left animation wrapper
export function SlideInLeft({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={className}
      variants={slideInLeft}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide In Right animation wrapper
export function SlideInRight({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={className}
      variants={slideInRight}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animate Presence wrapper for exit animations
export function AnimatePresenceWrapper({ children, condition = true, className = "" }) {
  return (
    <AnimatePresence mode="wait">
      {condition && (
        <motion.div
          key="content"
          className={className}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}