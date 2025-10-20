import { useEffect, useState, useCallback, useRef } from 'react';
import { useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1, rootMargin = '0px') => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isInView];
};

// Hook for parallax scroll effects
export const useParallax = (offset = 50) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);
  const smoothY = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return smoothY;
};

// Hook for scroll-based opacity fade
export const useScrollOpacity = (startOffset = 0, endOffset = 300) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(
    scrollY,
    [startOffset, endOffset],
    [1, 0]
  );

  return opacity;
};

// Hook for scroll progress
export const useScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return { progress: scrollYProgress, scaleX };
};

// Hook for element scroll progress (useful for progress bars)
export const useElementScrollProgress = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return [ref, smoothProgress];
};

// Hook for magnetic mouse following effect
export const useMagneticMouse = (strength = 0.2, damping = 0.1) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });
  
  const springY = useSpring(mouseY, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    mouseX.set(deltaX);
    mouseY.set(deltaY);
  }, [strength, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return [ref, { x: springX, y: springY }];
};

// Hook for scroll velocity
export const useScrollVelocity = () => {
  const { scrollY } = useScroll();
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    let lastScrollY = scrollY.get();
    let lastTime = Date.now();

    const unsubscribe = scrollY.onChange((current) => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      const deltaY = current - lastScrollY;
      
      if (deltaTime > 0) {
        setVelocity(deltaY / deltaTime);
      }
      
      lastScrollY = current;
      lastTime = now;
    });

    return unsubscribe;
  }, [scrollY]);

  return velocity;
};

// Hook for smooth scroll to element
export const useSmoothScroll = () => {
  const scrollToElement = useCallback((elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.offsetTop - offset;
    
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }, []);

  return scrollToElement;
};

// Hook for scroll direction
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const { scrollY } = useScroll();

  useEffect(() => {
    let lastScrollY = scrollY.get();

    const unsubscribe = scrollY.onChange((current) => {
      const direction = current > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection && Math.abs(current - lastScrollY) > 5) {
        setScrollDirection(direction);
      }
      
      lastScrollY = current;
    });

    return unsubscribe;
  }, [scrollY, scrollDirection]);

  return scrollDirection;
};

// Hook for creating staggered scroll animations
export const useStaggeredScrollAnimation = (
  itemCount,
  staggerDelay = 0.1,
  threshold = 0.1
) => {
  const [ref, isInView] = useScrollAnimation(threshold);
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    if (isInView) {
      // Stagger the appearance of items
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, i]));
        }, i * staggerDelay * 1000);
      }
    }
  }, [isInView, itemCount, staggerDelay]);

  return [ref, visibleItems];
};

// Hook for creating floating/breathing animations based on scroll
export const useFloatingOnScroll = (intensity = 0.5) => {
  const { scrollY } = useScroll();
  const [isFloating, setIsFloating] = useState(false);

  const y = useTransform(
    scrollY,
    (value) => Math.sin(value * 0.01) * intensity * 10
  );

  const rotate = useTransform(
    scrollY,
    (value) => Math.sin(value * 0.005) * intensity * 2
  );

  useEffect(() => {
    const unsubscribe = scrollY.onChange((current) => {
      setIsFloating(current > 100);
    });

    return unsubscribe;
  }, [scrollY]);

  return { y, rotate, isFloating };
};

// Hook for scroll-based color transitions
export const useScrollColorTransition = (colors, scrollRange = [0, 1000]) => {
  const { scrollY } = useScroll();
  const [currentColor, setCurrentColor] = useState(colors[0] || '#000000');

  useEffect(() => {
    const unsubscribe = scrollY.onChange((current) => {
      const progress = Math.min(Math.max(
        (current - scrollRange[0]) / (scrollRange[1] - scrollRange[0]), 
        0
      ), 1);
      
      const colorIndex = Math.floor(progress * (colors.length - 1));
      const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
      
      // Simple color interpolation would go here
      // For now, just use discrete color changes
      setCurrentColor(colors[colorIndex] || colors[0]);
    });

    return unsubscribe;
  }, [scrollY, colors, scrollRange]);

  return currentColor;
};

export default {
  useScrollAnimation,
  useParallax,
  useScrollOpacity,
  useScrollProgress,
  useElementScrollProgress,
  useMagneticMouse,
  useScrollVelocity,
  useSmoothScroll,
  useScrollDirection,
  useStaggeredScrollAnimation,
  useFloatingOnScroll,
  useScrollColorTransition,
};