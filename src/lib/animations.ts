import { Variants } from "framer-motion";

// Defined Easing Curves & Durations (Clean, Precise, Calm)
export const transitions = {
  micro: { duration: 0.16, ease: "easeInOut" as const },
  card: { duration: 0.24, ease: [0.25, 1, 0.5, 1] as const }, // easeOutQuart
  page: { duration: 0.36, ease: [0.16, 1, 0.3, 1] as const }, // easeOutExpo
  visualization: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }, // easeOutQuart (smooth, extended)
};

// Reusable Variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.page
  },
  exit: { 
    opacity: 0,
    transition: transitions.micro
  }
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.page
  },
  exit: { 
    opacity: 0, 
    y: -6,
    transition: transitions.micro
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.card
  },
  exit: { 
    opacity: 0, 
    scale: 0.97,
    transition: transitions.micro
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.card
  }
};

export const drawerTransition: Variants = {
  hidden: { x: "100%" },
  visible: { 
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    x: "100%",
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  }
};

export const sheetLeftTransition: Variants = {
  hidden: { x: "-100%" },
  visible: { 
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    x: "-100%",
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  }
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 8,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};
