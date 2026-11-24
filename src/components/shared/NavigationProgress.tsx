"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top viewport progress bar that smoothly animates during client-side route transitions.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const trickleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const clearTimers = () => {
    if (trickleTimer.current) {
      clearInterval(trickleTimer.current);
      trickleTimer.current = null;
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const startProgress = () => {
    clearTimers();
    setVisible(true);
    setProgress(22);

    trickleTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const step = prev < 50 ? 12 : prev < 75 ? 5 : 2;
        return Math.min(88, prev + step);
      });
    }, 180);
  };

  const completeProgress = () => {
    clearTimers();
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
  };

  // Complete progress whenever route or search params finish updating
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    completeProgress();
  }, [pathname, searchParams]);

  // Intercept internal anchor clicks to start the progress bar immediately
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (
        !href ||
        target === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      try {
        const nextUrl = new URL(href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;
        const currentPath = window.location.pathname + window.location.search;
        const targetPath = nextUrl.pathname + nextUrl.search;
        if (currentPath !== targetPath) {
          startProgress();
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          boxShadow: "0 0 10px color-mix(in srgb, var(--primary) 55%, transparent)",
        }}
      />
    </div>
  );
}
