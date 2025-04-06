import type React from "react"

interface StepBarProps {
  steps: string[]
  currentStep: number
}

const StepBar: React.FC<StepBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center justify-between w-full max-w-3xl">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center text-white font-bold ${
                index <= currentStep ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className="h-1 w-20 bg-gray-300"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StepBar

