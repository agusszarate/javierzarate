"use client";
import { useEffect, useRef, useState } from "react";

export const useScrollAnimation = (threshold = 0.1, timeout = 200) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add a small delay before showing animation
          setTimeout(() => setInView(true), timeout);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, timeout]);

  return { ref, inView };
};