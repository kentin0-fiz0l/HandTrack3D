import { getTotalSteps } from '@/data/tutorialSteps';

interface ProgressBarProps {
  currentStep: number;
  completedSteps: Set<number>;
}

export function ProgressBar({ currentStep, completedSteps }: ProgressBarProps) {
  const totalSteps = getTotalSteps();

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isComplete = completedSteps.has(index);
        const isCurrent = index === currentStep;

        return (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${
                isComplete
                  ? 'bg-green-400 scale-110'
                  : isCurrent
                  ? 'bg-blue-400 scale-125 animate-pulse'
                  : 'bg-gray-600'
              }
            `}
            title={`Step ${index + 1}${isComplete ? ' (complete)' : isCurrent ? ' (current)' : ''}`}
          />
        );
      })}
    </div>
  );
}
