import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function isJsdomOrReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (navigator?.userAgent?.toLowerCase().includes('jsdom')) return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * GSAP staggered entrance reveal for cards, hero columns, or KPI metrics.
 * Safely skips invisible keyframes in JSDOM tests or when user prefers reduced motion.
 */
export function useGsapStaggerReveal(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isJsdomOrReducedMotion()) return;

    const ctx = gsap.context(() => {
      const targets = container.querySelectorAll(selector);
      if (!targets.length) return;
      gsap.fromTo(
        targets,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
      );
    }, container);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * GSAP subtle ambient float for background orbs / partner badges.
 */
export function useGsapFloat(targetRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el || isJsdomOrReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);

    return () => ctx.revert();
  }, [targetRef]);
}

