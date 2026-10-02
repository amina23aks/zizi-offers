"use client";

import type { HTMLAttributes, SVGProps } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import type { Variants } from "motion/react";
import { LazyMotion, domMin, m, motion, useAnimation, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type AnimatedIconProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "color" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> & {
  size?: number;
  color?: string;
};

export type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

// BrainIcon adapted from AnimateIcons / Lucide by Avijit Dey. MIT.
export const BrainIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 26, color, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const groupControls = useAnimation();
    const sparkControls = useAnimation();
    const reduced = useReducedMotion();
    const controlled = useRef(false);

    useImperativeHandle(ref, () => {
      controlled.current = true;
      return {
        startAnimation: () => {
          groupControls.start(reduced ? "normal" : "animate");
          sparkControls.start(reduced ? "normal" : "animate");
        },
        stopAnimation: () => {
          groupControls.start("normal");
          sparkControls.start("normal");
        },
      };
    });

    const run = useCallback(() => {
      if (!controlled.current && !reduced) {
        groupControls.start("animate");
        sparkControls.start("animate");
      }
    }, [groupControls, sparkControls, reduced]);

    const stop = useCallback(() => {
      if (!controlled.current) {
        groupControls.start("normal");
        sparkControls.start("normal");
      }
    }, [groupControls, sparkControls]);

    const tilt: Variants = {
      normal: { rotate: 0, scale: 1 },
      animate: { rotate: [0, -2, 1, 0], scale: [1, 1.03, 1], transition: { duration: 0.7 } },
    };

    const draw: Variants = {
      normal: { pathLength: 1, opacity: 1 },
      animate: { pathLength: [0, 1], opacity: [0.45, 1], transition: { duration: 0.55 } },
    };

    const spark: Variants = {
      normal: { pathLength: 0, opacity: 0 },
      animate: { pathLength: [0, 1], opacity: [0, 1, 0], transition: { duration: 0.65, delay: 0.18 } },
    };

    return (
      <LazyMotion features={domMin} strict>
        <m.div
          className={cn("inline-flex items-center justify-center", className)}
          onMouseEnter={(event) => {
            run();
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            stop();
            onMouseLeave?.(event);
          }}
          {...props}
          style={{ color, ...props.style }}
        >
          <m.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <m.g variants={tilt} initial="normal" animate={groupControls}>
              <m.path d="M12 18V5" variants={draw} />
              <m.path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" variants={draw} />
              <m.path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" variants={draw} />
              <m.path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" variants={draw} />
              <m.path d="M18 18a4 4 0 0 0 2-7.464" variants={draw} />
              <m.path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" variants={draw} />
              <m.path d="M6 18a4 4 0 0 1-2-7.464" variants={draw} />
              <m.path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" variants={draw} />
              <m.path d="M8.5 11.6 10.2 10.4" strokeWidth="1.4" variants={spark} animate={sparkControls} />
              <m.path d="M13.8 9.4 15.6 10.7" strokeWidth="1.4" variants={spark} animate={sparkControls} />
            </m.g>
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  },
);

BrainIcon.displayName = "BrainIcon";

export function HeartIcon({ size = 26, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path fill="none" stroke="currentColor" strokeDasharray="30" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c0 0 0 0-.76-1-.88-1.16-2.18-2-3.74-2C5.01 5 3 7.01 3 9.5c0 .93.28 1.79.76 2.5.81 1.21 8.24 9 8.24 9M12 8c0 0 0 0 .76-1 .88-1.16 2.18-2 3.74-2 2.49 0 4.5 2.01 4.5 4.5 0 .93-.28 1.79-.76 2.5-.81 1.21-8.24 9-8.24 9">
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="30;0" />
      </path>
    </svg>
  );
}

// SparklesIcon adapted from Lucide Animated by dmytro. MIT.
export const SparklesIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 28, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const starControls = useAnimation();
    const sparkleControls = useAnimation();
    const controlled = useRef(false);

    useImperativeHandle(ref, () => {
      controlled.current = true;
      return {
        startAnimation: () => {
          sparkleControls.start("hover");
          starControls.start("blink");
        },
        stopAnimation: () => {
          sparkleControls.start("initial");
          starControls.start("initial");
        },
      };
    });

    const sparkleVariants: Variants = {
      initial: { y: 0, fill: "none" },
      hover: { y: [0, -1, 0], fill: "currentColor", transition: { duration: 0.9 } },
    };
    const starVariants: Variants = {
      initial: { opacity: 1 },
      blink: { opacity: [0, 1, 0, 1], transition: { duration: 1.2 } },
    };

    return (
      <div
        className={cn("inline-flex", className)}
        onMouseEnter={(event) => {
          if (!controlled.current) {
            sparkleControls.start("hover");
            starControls.start("blink");
          }
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          if (!controlled.current) {
            sparkleControls.start("initial");
            starControls.start("initial");
          }
          onMouseLeave?.(event);
        }}
        {...props}
      >
        <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
          <motion.path animate={sparkleControls} variants={sparkleVariants} d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <motion.path animate={starControls} variants={starVariants} d="M20 3v4" />
          <motion.path animate={starControls} variants={starVariants} d="M22 5h-4" />
          <motion.path animate={starControls} variants={starVariants} d="M4 17v2" />
          <motion.path animate={starControls} variants={starVariants} d="M5 18H3" />
        </svg>
      </div>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";

// FingerPrintIcon adapted from Heroicons Animated by Aniket Pawar. MIT.
export const FingerPrintIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 30, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const controlled = useRef(false);
    const variants: Variants = {
      normal: { pathLength: 1, opacity: 1 },
      animate: { opacity: [0, 0.8, 1], pathLength: [0.12, 0.55, 1], transition: { duration: 1.4 } },
    };

    useImperativeHandle(ref, () => {
      controlled.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const paths = [
      "M7.864 4.243C9.05 3.457 10.471 3 12 3c4.142 0 7.5 3.358 7.5 7.5 0 2.919-.556 5.709-1.568 8.269",
      "M5.743 6.364C4.957 7.55 4.5 8.971 4.5 10.5c0 1.468-.421 2.837-1.15 3.993",
      "M5.339 18.052C7.148 16.056 8.25 13.407 8.25 10.5c0-2.071 1.679-3.75 3.75-3.75s3.75 1.679 3.75 3.75c0 .527-.021 1.049-.064 1.565",
      "M12 10.5c0 3.723-1.356 7.129-3.601 9.751",
      "M15.033 15.654c-.548 1.92-1.394 3.714-2.485 5.33",
    ];

    return (
      <div
        className={cn("inline-flex", className)}
        onMouseEnter={(event) => {
          if (!controlled.current) controls.start("animate");
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          if (!controlled.current) controls.start("normal");
          onMouseLeave?.(event);
        }}
        {...props}
      >
        <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
          {paths.map((path) => (
            <g key={path}>
              <path d={path} strokeOpacity={0.35} />
              <motion.path d={path} animate={controls} initial="normal" variants={variants} />
            </g>
          ))}
        </svg>
      </div>
    );
  },
);

FingerPrintIcon.displayName = "FingerPrintIcon";
