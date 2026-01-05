"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Direction = "left" | "right" | "up" | "down" | "none";

export function RevealFromSide({
  children,
  direction = "up",
  delay = 0,
  distance = 24,
  className,
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  const initial: { opacity: number; x?: number; y?: number } = { opacity: 0 };

  switch (direction) {
    case "left":
      initial.x = -distance;
      break;
    case "right":
      initial.x = distance;
      break;
    case "up":
      initial.y = distance;
      break;
    case "down":
      initial.y = -distance;
      break;
    case "none":
    default:
      break;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.55,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
