"use client";
import {useEffect, useRef, useCallback} from "react";
import {useRouter} from "next/navigation";

// Define an interface for our history state
interface ProtectedHistoryState {
  isProtectedPage: boolean;
}

/**
 * Custom hook to prevent navigation back while allowing forward navigation
 * Handles aggressive back navigation attempts (spamming gestures/shortcuts)
 * Also prevents page reloads with a confirmation dialog
 */
const usePreventNavigation = () => {
  const router = useRouter();
  const navigationLock = useRef(false);
  const backAttemptCount = useRef(0);
  const backPreventionActive = useRef(false);

  // Use useCallback to ensure navigateTo function has stable identity
  const navigateTo = useCallback(
    (path: string) => {
      if (navigationLock.current) return;

      try {
        navigationLock.current = true;

        // Use setTimeout to ensure we don't interfere with event handling
        setTimeout(() => {
          router.push(path);

          // Reset lock after navigation completes
          setTimeout(() => {
            navigationLock.current = false;
          }, 500);
        }, 0);
      } catch (error) {
        navigationLock.current = false;
        console.error("Navigation error:", error);
      }
    },
    [router]
  );

  useEffect(() => {
    // Check if running in a browser environment
    if (typeof window === "undefined") return;

    // Create a history entry marker to identify our pages
    const historyMarker: ProtectedHistoryState = {isProtectedPage: true};

    // Replace the current history state with our marker
    window.history.replaceState(historyMarker, "", window.location.pathname);

    // Add a few dummy states to absorb rapid back attempts
    for (let i = 0; i < 5; i++) {
      window.history.pushState(historyMarker, "", window.location.pathname);
    }

    // Handle popstate event (when user tries to go back)
    const handlePopState = (e: PopStateEvent) => {
      // Check if we're on a protected page
      if (e.state && (e.state as ProtectedHistoryState).isProtectedPage) {
        // Increment back attempt counter
        backAttemptCount.current += 1;

        // If user is spamming back, add more history entries as a buffer
        if (backAttemptCount.current > 2 && !backPreventionActive.current) {
          backPreventionActive.current = true;

          // Add more history entries to absorb rapid back attempts
          for (let i = 0; i < 10; i++) {
            window.history.pushState(historyMarker, "", window.location.pathname);
          }

          // Reset the prevention after a delay
          setTimeout(() => {
            backAttemptCount.current = 0;
            backPreventionActive.current = false;
          }, 1000);
        }

        // Push state to prevent going back
        window.history.pushState(historyMarker, "", window.location.pathname);
      }
    };

    // Handle keyboard shortcuts with more aggressive prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F5/Ctrl+R reload shortcuts
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if ((e.altKey && e.key === "ArrowLeft") || (e.altKey && e.key === "Left") || e.key === "BrowserBack") {
        e.preventDefault();
        e.stopPropagation();

        // Add more history entries when keyboard shortcuts are detected
        for (let i = 0; i < 3; i++) {
          window.history.pushState(historyMarker, "", window.location.pathname);
        }
      }
    };

    // Add handler for beforeunload to prevent reload and tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";
      // This will show a confirmation dialog
      return "";
    };

    // Handle touchpad gestures by monitoring rapid popstate events
    let popstateTimestamp = 0;
    const handleRapidPopstate = () => {
      const now = Date.now();
      if (now - popstateTimestamp < 300) {
        // Rapid popstate detected, likely a touchpad gesture
        // Add more history entries as buffer
        for (let i = 0; i < 5; i++) {
          window.history.pushState(historyMarker, "", window.location.pathname);
        }
      }
      popstateTimestamp = now;
    };

    // Add event listeners with capture to intercept early
    window.addEventListener("popstate", handlePopState, {capture: true});
    window.addEventListener("popstate", handleRapidPopstate);
    window.addEventListener("keydown", handleKeyDown, {capture: true});
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up
    return () => {
      window.removeEventListener("popstate", handlePopState, {capture: true});
      window.removeEventListener("popstate", handleRapidPopstate);
      window.removeEventListener("keydown", handleKeyDown, {capture: true});
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return {navigateTo};
};

export default usePreventNavigation;
