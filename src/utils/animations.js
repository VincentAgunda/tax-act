// Apple-style animation system with bouncy spring physics
// Inspired by iOS and macOS interface animations

export const spring = {
  // Apple's signature bouncy spring
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 20,
    mass: 0.8,
    restDelta: 0.001,
  },
  
  // Gentle bounce for cards and components
  gentle: {
    type: "spring",
    stiffness: 200,
    damping: 25,
    mass: 1,
  },
  
  // Snappy for buttons and interactions
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.6,
  },
  
  // Smooth for page transitions
  smooth: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },
  
  // Wobbly for playful interactions
  wobbly: {
    type: "spring",
    stiffness: 180,
    damping: 12,
    mass: 1,
  }
};

export const easing = {
  // Apple's cubic bezier curves
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.06, 0.68, 0.19],
  easeInOut: [0.645, 0.045, 0.355, 1],
  
  // Futuristic easing
  anticipate: [0.68, -0.6, 0.32, 1.6],
  backOut: [0.175, 0.885, 0.32, 1.275],
  circOut: [0.075, 0.82, 0.165, 1],
};

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.95,
    rotateX: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      ...spring.smooth,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -60,
    scale: 0.95,
    rotateX: -10,
    transition: {
      ...spring.snappy,
      duration: 0.3,
    },
  },
};

// Stagger container for child animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Card hover and tap animations
export const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
    rotateY: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.03,
    y: -8,
    rotateY: 2,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: spring.gentle,
  },
  tap: {
    scale: 0.98,
    y: 2,
    transition: spring.snappy,
  },
};

// Button animations with Apple-style feedback
export const buttonVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: spring.snappy,
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: {
      ...spring.snappy,
      duration: 0.1,
    },
  },
};

// Slide up animation for content reveals
export const slideUpVariants = {
  hidden: {
    y: 100,
    opacity: 0,
    rotateX: 10,
  },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      ...spring.bouncy,
      delay: i * 0.1,
    },
  }),
};

// Scale fade for modal and overlay animations
export const scaleFadeVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: spring.bouncy,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: spring.snappy,
  },
};

// Floating animation for decorative elements
export const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    rotateZ: [-1, 1, -1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Morphing background animation
export const backgroundVariants = {
  animate: {
    background: [
      "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)",
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Shimmer loading animation
export const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Glitch effect for futuristic feel
export const glitchVariants = {
  animate: {
    x: [0, -2, 2, 0],
    skew: [0, 2, -2, 0],
    filter: [
      "hue-rotate(0deg)",
      "hue-rotate(90deg)",
      "hue-rotate(180deg)",
      "hue-rotate(270deg)",
      "hue-rotate(360deg)",
    ],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Magnetic hover effect
export const magneticVariants = {
  rest: {
    scale: 1,
    filter: "blur(0px)",
  },
  hover: (direction) => ({
    scale: 1.1,
    x: direction.x * 10,
    y: direction.y * 10,
    filter: "blur(0.5px)",
    transition: spring.gentle,
  }),
};

// Parallax scroll effect
export const parallaxVariants = {
  animate: (scrollY) => ({
    y: scrollY * 0.5,
    opacity: 1 - scrollY * 0.002,
    scale: 1 - scrollY * 0.0005,
    transition: {
      type: "tween",
      ease: "linear",
      duration: 0,
    },
  }),
};

// Text reveal animations
export const textRevealVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: (i = 0) => ({
    y: "0%",
    opacity: 1,
    transition: {
      ...spring.bouncy,
      delay: i * 0.05,
    },
  }),
};

// Icon spin and bounce
export const iconVariants = {
  rest: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.2,
    rotate: 360,
    transition: {
      ...spring.bouncy,
      rotate: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  },
  tap: {
    scale: 0.9,
    transition: spring.snappy,
  },
};

// Navigation menu animations
export const menuVariants = {
  closed: {
    opacity: 0,
    x: "-100%",
    transition: {
      ...spring.snappy,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    x: "0%",
    transition: {
      ...spring.bouncy,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const menuItemVariants = {
  closed: {
    y: 50,
    opacity: 0,
  },
  open: {
    y: 0,
    opacity: 1,
    transition: spring.bouncy,
  },
};

// Loading spinner with multiple dots
export const loadingDotVariants = {
  start: (i) => ({
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.1,
    },
  }),
};

// Breathing animation for focus states
export const breatheVariants = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Advanced hover effects
export const advancedHover = {
  // Tilting card effect
  tilt: {
    rest: { rotateX: 0, rotateY: 0, scale: 1 },
    hover: (tilt) => ({
      rotateX: tilt.rotateX,
      rotateY: tilt.rotateY,
      scale: 1.05,
      transition: spring.gentle,
    }),
  },
  
  // Elastic scale
  elastic: {
    rest: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: spring.snappy,
    },
  },
  
  // Glow effect
  glow: {
    rest: {
      boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
      borderColor: "transparent",
    },
    hover: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
      borderColor: "rgba(59, 130, 246, 0.8)",
      transition: spring.gentle,
    },
  },
};

// Viewport animation hook configuration
export const viewportOptions = {
  once: true,
  margin: "-50px 0px -50px 0px",
  amount: 0.2,
};

// Animation duration constants
export const duration = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
};

// Transform origins for better animations
export const transformOrigins = {
  center: "center center",
  top: "top center",
  bottom: "bottom center",
  left: "left center",
  right: "right center",
  topLeft: "top left",
  topRight: "top right",
  bottomLeft: "bottom left",
  bottomRight: "bottom right",
};