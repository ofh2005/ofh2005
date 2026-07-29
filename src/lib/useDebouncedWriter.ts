"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Returns a `schedule(key, fn)` function: calling it again with the same key
 * before the delay elapses replaces the pending write, so rapid keystrokes on
 * the same field collapse into a single Supabase write.
 */
export function useDebouncedWriter(delay = 700) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
    };
  }, []);

  const schedule = useCallback(
    (key: string, fn: () => void) => {
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          fn();
        }, delay)
      );
    },
    [delay]
  );

  return schedule;
}
