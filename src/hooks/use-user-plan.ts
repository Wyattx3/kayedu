"use client";

import { useState, useEffect } from "react";

export type UserPlan = "free" | "pro";

export function useUserPlan(): { plan: UserPlan; loading: boolean } {
  const [plan, setPlan] = useState<UserPlan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) {
          const data = await res.json();
          setPlan(data.plan || "free");
        }
      } catch {
        // Default to free on error
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);

  return { plan, loading };
}
