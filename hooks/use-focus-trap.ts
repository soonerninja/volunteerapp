"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Traps keyboard focus within the referenced element when `active` is true.
 * Also returns focus to `returnFocusRef` when deactivated.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  returnFocusRef?: React.RefObject<HTMLElement | null>
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );

    if (focusable.length === 0) return;

    // Focus the first focusable element
    focusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to trigger element when modal closes
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
    };
  }, [active, returnFocusRef]);

  return containerRef;
}
