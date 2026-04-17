"use client";

import { motion, type Variants } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const directionOffset = {
  up:    { y: 20,   x: 0   },
  down:  { y: -20,  x: 0   },
  left:  { y: 0,    x: 20  },
  right: { y: 0,    x: -20 },
  none:  { y: 0,    x: 0   },
};

export function FadeIn({ children, className, delay = 0, direction = "up" }: FadeInProps) {
  const { x, y } = directionOffset[direction];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerGridProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
