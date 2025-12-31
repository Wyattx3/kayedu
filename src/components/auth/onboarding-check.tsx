"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { OnboardingDialog } from "./onboarding-dialog";

export function OnboardingCheck() {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (status !== "authenticated" || !session?.user?.id) {
        setChecked(true);
        return;
      }

      const userId = session.user.id;
      const onboardingKey = `onboarding-complete-${userId}`;

      // Check if onboarding is already complete for this user
      const onboardingComplete = localStorage.getItem(onboardingKey);
      if (onboardingComplete === "true") {
        setChecked(true);
        return;
      }

      // Check database for existing profile data
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          
          // If user has any profile data, mark onboarding as complete
          if (user && (user.school || user.educationLevel || user.subjects?.length > 0 || user.major)) {
            localStorage.setItem(onboardingKey, "true");
            setChecked(true);
            return;
          }
        }
      } catch {
        // API error - don't show onboarding if we can't check
        setChecked(true);
        return;
      }

      // Show onboarding for new users without profile data
      setShowOnboarding(true);
      setChecked(true);
    };

    checkOnboarding();
  }, [session, status]);

  const handleOnboardingComplete = () => {
    if (session?.user?.id) {
      localStorage.setItem(`onboarding-complete-${session.user.id}`, "true");
    }
    setShowOnboarding(false);
  };

  if (!checked || status === "loading") {
    return null;
  }

  return (
    <OnboardingDialog
      isOpen={showOnboarding}
      onComplete={handleOnboardingComplete}
      userEmail={session?.user?.email || ""}
      userName={session?.user?.name || ""}
      userImage={session?.user?.image || ""}
    />
  );
}

