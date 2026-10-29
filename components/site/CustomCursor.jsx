'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function RealFlyingCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Use refs to avoid continuous component re-renders for core rendering math
  const mouseRef = useRef({ x: -100, y: -100 });
  const objectRef = useRef({ x: -100, y: -100 });
  const timeRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if the screen is mobile or uses a touch display
    const checkDevice = () => {
      const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 768; // Target mobile breakpoint
      const isTouchOrMobile = isTouchDevice || isSmallScreen;
      setIsMobile(isTouchOrMobile);

      if (isTouchOrMobile) {
        document.body.classList.remove('has-custom-cursor');
        document.body.style.cursor = 'default';
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Do not run in admin studio
    if (window.location.pathname.startsWith('/admin')) {
      document.body.classList.remove('has-custom-cursor');
      document.body.style.cursor = '';
      return () => {
        window.removeEventListener('resize', checkDevice);
      };
    }

    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 768;

    if (isTouchDevice || isSmallScreen) {
      document.body.classList.remove('has-custom-cursor');
      document.body.style.cursor = 'default';
      return () => {
        window.removeEventListener('resize', checkDevice);
      };
    }

    // Mark body as having custom cursor active on desktop
    document.body.classList.add('has-custom-cursor');

    const handleMouseMove = (e) => {
      setIsVisible(true);
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"], .cursor-pointer, input, textarea, select')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Main animation loop engine
    let animationFrameId;
    
    const animateFlight = () => {
      timeRef.current += 0.08; // Control frequency of the insect wing flutter
      
      const currentObj = objectRef.current;
      const targetMouse = mouseRef.current;

      // 1. Natural lagging drag physics calculation
      const easeMultiplier = 0.07; 
      let dx = targetMouse.x - currentObj.x;
      let dy = targetMouse.y - currentObj.y;

      // 2. High-frequency organic fluttering calculation (Simulating autonomous flight)
      // Generates mathematical wave turbulence paths to avoid rigid straight lines
      const flutterAmplitude = 14; // Intensity of the offset in pixels
      const noiseX = Math.sin(timeRef.current * 1.5) * Math.cos(timeRef.current * 0.7) * flutterAmplitude;
      const noiseY = Math.cos(timeRef.current * 1.2) * Math.sin(timeRef.current * 0.9) * flutterAmplitude;

      // 3. Update spatial position coordinates dynamically
      currentObj.x += dx * easeMultiplier + noiseX * 0.2;
      currentObj.y += dy * easeMultiplier + noiseY * 0.2;

      // Update state value directly
      setPosition({ x: currentObj.x, y: currentObj.y });

      animationFrameId = requestAnimationFrame(animateFlight);
    };

    animationFrameId = requestAnimationFrame(animateFlight);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      document.body.classList.remove('has-custom-cursor');
      document.body.style.cursor = '';
    };
  }, []);

  // If it is a mobile or tablet viewport, render absolutely nothing!
  if (isMobile || !isVisible) return null;

  return (
    <>
      {/* THE INTEGRATED LIVING ORGANISM CELL */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[999999] -translate-x-1/2 -translate-y-1/2 mix-blend-screen select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Central Bright Energy Nucleus (The Core Insect Body) */}
          <div 
            className={`w-2 h-2 bg-emerald-300 rounded-full shadow-[0_0_12px_#34d399] transition-transform duration-300 ${
              isHovered ? 'scale-[2.5] bg-amber-300 shadow-[0_0_16px_#fbbf24]' : 'scale-100'
            }`} 
          />

          {/* Rapid Flapping Wing Membranes */}
          <div className="absolute flex justify-between w-6 pointer-events-none opacity-40">
            {/* Left Wing Membrane */}
            <div className="w-2.5 h-1.5 bg-zinc-300/40 rounded-full origin-right animate-[wingLeft_0.08s_infinite_linear]" />
            {/* Right Wing Membrane */}
            <div className="w-2.5 h-1.5 bg-zinc-300/40 rounded-full origin-left animate-[wingRight_0.08s_infinite_linear]" />
          </div>

          {/* Ambient Outer Light Halo Glow */}
          <div className={`absolute w-8 h-8 rounded-full border border-emerald-500/20 bg-emerald-500/5 blur-[1px] transition-all duration-300 ${
            isHovered ? 'scale-150 border-amber-500/30 bg-amber-500/10' : 'scale-100'
          }`} />
        </div>
      </div>
    </>
  );
}
