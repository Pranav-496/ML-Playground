import { useEffect, useRef, useState } from "react";

/**
 * Custom hook that uses Intersection Observer to detect
 * when an element scrolls into view.
 * Returns a ref to attach and a boolean `isVisible`.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  rootMargin = "0px",
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return [ref, isVisible];
}

/**
 * Hook to track which section (by index) is currently
 * in the viewport. Used for the sticky realm nav.
 */
export function useActiveSection(sectionIds: string[]): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id, index) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { threshold: 0.35 },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [sectionIds]);

  return activeIndex;
}
