import React from 'react';
import { motion } from 'framer-motion';
import { shimmerVariants, spring, staggerContainer } from '../utils/animations';

// Base shimmer skeleton component
const SkeletonBase = ({ className = '', children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring.gentle, delay }}
    className={`relative overflow-hidden ${className}`}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      variants={shimmerVariants}
      animate="animate"
      style={{
        backgroundSize: '200% 100%',
      }}
    />
    {children}
  </motion.div>
);

// Card skeleton with bouncy animation
export const CardSkeleton = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ ...spring.bouncy, delay }}
    className="relative rounded-2xl bg-gray-100 p-6 overflow-hidden"
  >
    {/* Shimmer overlay */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
    
    {/* Content skeletons */}
    <div className="space-y-4">
      <motion.div
        className="h-6 bg-gray-200 rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="space-y-2"
        variants={staggerContainer}
        initial="hidden"
        animate="animate"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.random() * 40 + 60}%` }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
      
      {/* Button skeletons */}
      <div className="flex gap-2 pt-4">
        <motion.div
          className="h-8 w-20 bg-gray-200 rounded-lg"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.div
          className="h-8 w-16 bg-gray-200 rounded-lg"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
      </div>
    </div>
    
    {/* Floating action button skeleton */}
    <motion.div
      className="absolute bottom-4 right-4 w-12 h-12 bg-gray-300 rounded-full"
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </motion.div>
);

// Grid of card skeletons with staggered animation
export const CardGridSkeleton = ({ count = 6 }) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    variants={staggerContainer}
    initial="hidden"
    animate="animate"
  >
    {[...Array(count)].map((_, i) => (
      <CardSkeleton key={i} delay={i * 0.1} />
    ))}
  </motion.div>
);

// List item skeleton
export const ListItemSkeleton = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ ...spring.gentle, delay }}
    className="relative flex items-center p-4 bg-gray-50 rounded-lg overflow-hidden"
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
    
    <motion.div
      className="w-12 h-12 bg-gray-200 rounded-full mr-4"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    
    <div className="flex-1 space-y-2">
      <motion.div
        className="h-4 bg-gray-200 rounded"
        style={{ width: '60%' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="h-3 bg-gray-200 rounded"
        style={{ width: '80%' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  </motion.div>
);

// Text skeleton with typewriter effect
export const TextSkeleton = ({ lines = 1, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="space-y-2"
  >
    {[...Array(lines)].map((_, i) => (
      <motion.div
        key={i}
        className="h-4 bg-gray-200 rounded relative overflow-hidden"
        style={{ width: i === lines - 1 ? '70%' : '100%' }}
        initial={{ width: 0 }}
        animate={{ width: i === lines - 1 ? '70%' : '100%' }}
        transition={{
          duration: 1,
          delay: delay + i * 0.2,
          ease: 'easeOut',
        }}
      >
        <motion.div
          className="absolute right-0 top-0 h-full w-1 bg-gray-400"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: delay + i * 0.2,
          }}
        />
      </motion.div>
    ))}
  </motion.div>
);

// Pulsing dot loader
export const PulsingDots = ({ count = 3, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} bg-gray-400 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Advanced loading spinner
export const FuturisticSpinner = ({ size = 40, primaryColor = '#f5f5f7' }) => (
  <div className="flex items-center justify-center p-4">
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 border-2 border-transparent rounded-full"
        style={{
          borderTopColor: primaryColor,
          borderRightColor: `${primaryColor}40`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute inset-2 border-2 border-transparent rounded-full"
        style={{
          borderBottomColor: primaryColor,
          borderLeftColor: `${primaryColor}40`,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Center pulsing dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: primaryColor }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Orbiting particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: primaryColor,
            top: '50%',
            left: '50%',
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'linear',
          }}
          transformTemplate={({ rotate }) =>
            `translate(-50%, -50%) rotate(${rotate}) translateY(-${size / 3}px)`
          }
        />
      ))}
    </div>
  </div>
);

// Progress bar with smooth animation
export const AnimatedProgressBar = ({ 
  progress = 0, 
  className = '',
  showLabel = true,
  color = '#f5f5f7' 
}) => (
  <div className={`w-full ${className}`}>
    {showLabel && (
      <motion.div
        className="flex justify-between items-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-sm text-gray-600">Loading...</span>
        <motion.span
          className="text-sm font-medium text-gray-800"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {Math.round(progress)}%
        </motion.span>
      </motion.div>
    )}
    
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full rounded-full relative"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  </div>
);

export default {
  CardSkeleton,
  CardGridSkeleton,
  ListItemSkeleton,
  TextSkeleton,
  PulsingDots,
  FuturisticSpinner,
  AnimatedProgressBar,
};