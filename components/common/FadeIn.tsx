"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/*
  Scroll entrance primitives. Three exports, one vocabulary:

    <FadeIn>          a single block
    <FadeInStagger>   a grid or list whose children cascade
    <FadeInItem>      a child of the above

  Everything animates opacity and transform only — never layout — and fires
  once. framer-motion does not honour prefers-reduced-motion on its own, so
  every component here checks it and renders the plain element instead: no
  motion, and no invisible initial state to recover from.
*/

const VIEWPORT = { once: true, margin: "-80px" };
const DURATION = 0.6;
const EASE = "easeOut" as const;
const STAGGER = 0.1;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

type Props = {
  children: ReactNode;
  className?: string;
};

export function FadeIn({ children, className, delay = 0 }: Props & { delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* `as` exists so a staggered list stays a real <ol>/<ul> around its <li>s —
   wrapping them in divs would break the list semantics. */
export function FadeInStagger({
  children,
  className,
  as = "div",
}: Props & { as?: "div" | "ol" | "ul" }) {
  const prefersReducedMotion = useReducedMotion();
  const Element = as === "ol" ? motion.ol : as === "ul" ? motion.ul : motion.div;

  if (prefersReducedMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Element
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </Element>
  );
}

export function FadeInItem({
  children,
  className,
  as = "div",
}: Props & { as?: "div" | "li" }) {
  const prefersReducedMotion = useReducedMotion();
  const Element = as === "li" ? motion.li : motion.div;

  if (prefersReducedMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Element className={className} variants={itemVariants}>
      {children}
    </Element>
  );
}
