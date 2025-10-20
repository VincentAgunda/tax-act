import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, spring, staggerContainer, viewportOptions } from '../utils/animations';

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={`w-full ${className}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        variants={staggerContainer}
        className="w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Futuristic blur transition effect
export const BlurTransition = ({ children, isVisible = true, delay = 0 }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            filter: 'blur(20px)',
            rotateX: 10,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            rotateX: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            filter: 'blur(20px)',
            rotateX: -10,
          }}
          transition={{
            ...spring.smooth,
            delay,
            filter: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Staggered content reveal
export const StaggeredReveal = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
      transition={{
        staggerChildren: 0.08,
        delayChildren: delay,
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: {
              y: 60,
              opacity: 0,
              rotateX: 10,
              scale: 0.9,
            },
            visible: {
              y: 0,
              opacity: 1,
              rotateX: 0,
              scale: 1,
              transition: {
                ...spring.bouncy,
                delay: index * 0.1,
              },
            },
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Morphing section backgrounds
export const MorphingBackground = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* Animated background layers */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(225deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(315deg, #ffecd2 0%, #fcb69f 100%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 blur-xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Glitch text effect
export const GlitchText = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        scale: 1.02,
      }}
      transition={spring.gentle}
    >
      {/* Main text */}
      <motion.span className="relative z-10">
        {children}
      </motion.span>
      
      {/* Glitch layers */}
      <motion.span
        className="absolute top-0 left-0 text-red-500 opacity-0"
        animate={{
          opacity: [0, 0.7, 0],
          x: [0, -2, 2, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {children}
      </motion.span>
      
      <motion.span
        className="absolute top-0 left-0 text-cyan-500 opacity-0"
        animate={{
          opacity: [0, 0.7, 0],
          x: [0, 2, -2, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 3,
          delay: 0.05,
        }}
      >
        {children}
      </motion.span>
    </motion.div>
  );
};

// Particle field background
export const ParticleField = ({ count = 50 }) => {
  const particles = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-white rounded-full opacity-30"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2,
        ease: 'easeInOut',
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

// Holographic loading effect
export const HolographicLoader = ({ isLoading = true, size = 40 }) => {
  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-2 border-transparent rounded-full"
          style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'padding-box',
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 border-2 border-transparent rounded-full"
          style={{
            background: 'linear-gradient(225deg, #ffecd2, #fcb69f)',
            backgroundClip: 'padding-box',
          }}
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        
        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
};

// Magnetic button wrapper
export const MagneticWrapper = ({ children, strength = 0.2 }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        x: isHovering ? mousePosition.x : 0,
        y: isHovering ? mousePosition.y : 0,
      }}
      transition={spring.gentle}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;