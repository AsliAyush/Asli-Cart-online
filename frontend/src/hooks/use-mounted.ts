import { useEffect, useState } from "react";

/**
 * Hook to determine if component has mounted on the client.
 * Prevents SSR / hydration mismatch issues.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

