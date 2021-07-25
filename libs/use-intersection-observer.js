import { useEffect, useRef } from 'react';

/**
 * @typedef UseIntersectionObserverProps
 * @property {function} onEnter
 * @property {function} onExit
 * @property {string} [margin]
 * @property {number|number[]} [threshold]
 */

/**
 *
 * @template T
 * @param {UseIntersectionObserverProps} props
 * @returns {import('react').MutableRefObject<T & HTMLElement | null>}
 */
export function useIntersectionObserver({ onExit, onEnter, margin, threshold = 0 }) {
  const targetRef = useRef(/** @type{T & HTMLElement | null} */(null));

  useEffect(() => {
    if (targetRef.current) {
      const targetRefValue = targetRef.current;
      /**
       * @type {IntersectionObserverCallback}
       */
      function callback(entries) {
        entries.forEach((entry) => {
          if (entry.intersectionRatio === threshold) {
            onExit();
          } else {
            onEnter();
          }
        });
      }

      const config = {
        rootMargin: margin,
        threshold,
      };

      const observer = new IntersectionObserver(callback, config);
      observer.observe(targetRefValue);

      return () => {
        observer.unobserve(targetRefValue);
      };
    }
  }, [margin, onEnter, onExit, threshold]);

  return targetRef;
}
