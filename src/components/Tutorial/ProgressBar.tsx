interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {Array.from({ length: total }).map((_, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current - 1;
          
          return (
            <div
              key={index}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isCurrent ? 'bg-blue-500 text-white ring-2 ring-blue-300' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-700 text-gray-400' : ''}
              `}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
          );
        })}
      </div>
      
      {/* Step counter */}
      <p className="text-center text-sm text-gray-400">
        Step {current} of {total}
      </p>
    </div>
  );
}
