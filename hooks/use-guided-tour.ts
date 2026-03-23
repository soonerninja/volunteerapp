"use client";

import { useState, useEffect, useCallback } from "react";

const TOUR_STORAGE_KEY = "goodtally_tour_completed";
const TOUR_STEP_KEY = "goodtally_tour_step";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  page: string; // pathname the step appears on
  target?: string; // CSS selector for the element to highlight (optional)
  position?: "top" | "bottom" | "left" | "right";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to GoodTally!",
    description:
      "Let's take a quick look around so you know where everything is. This will only take a minute.",
    page: "/dashboard",
  },
  {
    id: "volunteers",
    title: "Add your volunteers",
    description:
      "This is where you'll manage everyone — add new volunteers, track their skills, and see who's active. Start by adding a few people.",
    page: "/volunteers",
    target: "[data-tour='volunteer-list']",
  },
  {
    id: "events",
    title: "Create an event",
    description:
      "Set up upcoming events, assign volunteers, and log hours when they're done. Everything ties back to your volunteer profiles.",
    page: "/events",
    target: "[data-tour='event-list']",
  },
  {
    id: "committees",
    title: "Organize into committees",
    description:
      "Group volunteers into committees with chairs and priorities. A great way to keep working groups accountable.",
    page: "/committees",
    target: "[data-tour='committee-list']",
  },
  {
    id: "settings",
    title: "Customize your org",
    description:
      "Set up your organization details, invite team members, and define skills and roles. You can also load sample data here to explore.",
    page: "/settings",
    target: "[data-tour='settings-panel']",
  },
  {
    id: "done",
    title: "You're all set!",
    description:
      "That's the basics. You can restart this tour anytime from Settings. Now go make an impact!",
    page: "/dashboard",
  },
];

export function useGuidedTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    const savedStep = localStorage.getItem(TOUR_STEP_KEY);

    if (!completed) {
      setIsActive(true);
      setCurrentStepIndex(savedStep ? parseInt(savedStep, 10) : 0);
    }
    setLoaded(true);
  }, []);

  const currentStep = TOUR_STEPS[currentStepIndex] || null;

  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= TOUR_STEPS.length) {
      // Tour complete
      setIsActive(false);
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      localStorage.removeItem(TOUR_STEP_KEY);
    } else {
      setCurrentStepIndex(nextIndex);
      localStorage.setItem(TOUR_STEP_KEY, String(nextIndex));
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    localStorage.removeItem(TOUR_STEP_KEY);
  }, []);

  const restartTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_STEP_KEY);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  return {
    isActive: loaded && isActive,
    currentStep,
    currentStepIndex,
    totalSteps: TOUR_STEPS.length,
    nextStep,
    skipTour,
    restartTour,
  };
}
