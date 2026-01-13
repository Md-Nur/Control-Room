interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const StepIndicator = ({
  currentStep,
  totalSteps,
  stepLabels,
}: StepIndicatorProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <ul className="steps steps-horizontal w-full">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <li
            key={step}
            className={`step ${step <= currentStep ? "step-primary" : ""}`}
            data-content={step <= currentStep ? "✓" : step}
          >
            <span className="hidden sm:inline">{stepLabels[step - 1]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StepIndicator;
