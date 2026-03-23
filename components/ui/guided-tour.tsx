"use client";

import { usePathname, useRouter } from "next/navigation";
import { useGuidedTour, TOUR_STEPS } from "@/hooks/use-guided-tour";
import { X, ArrowRight, MapPin } from "lucide-react";

export function GuidedTour() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    skipTour,
  } = useGuidedTour();
  const pathname = usePathname();
  const router = useRouter();

  if (!isActive || !currentStep) return null;

  const isOnCorrectPage = pathname === currentStep.page;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (isLastStep) {
      nextStep();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    const nextStepPage = nextIndex < totalSteps ? TOUR_STEPS[nextIndex].page : null;

    nextStep();

    if (nextStepPage && nextStepPage !== pathname) {
      router.push(nextStepPage);
    }
  };

  const formatPageName = (page: string) => {
    const name = page.replace("/", "");
    return name.charAt(0).toUpperCase() + name.slice(1) || "Dashboard";
  };

  // If not on the right page, show a small nudge
  if (!isOnCorrectPage) {
    return (
      <div className="fixed bottom-6 right-6 z-[60] animate-in">
        <div className="w-80 rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 text-blue-500" aria-hidden="true" />
              <span>Quick Start Guide</span>
            </div>
            <button
              onClick={skipTour}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Head to{" "}
            <button
              onClick={() => router.push(currentStep.page)}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              {formatPageName(currentStep.page)}
            </button>{" "}
            to continue the tour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in">
      <div className="w-80 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-600">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
              <h3 className="mt-1 font-semibold text-gray-900">
                {currentStep.title}
              </h3>
            </div>
            <button
              onClick={skipTour}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {currentStep.description}
          </p>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? "Finish" : "Next"}
              {!isLastStep && (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
