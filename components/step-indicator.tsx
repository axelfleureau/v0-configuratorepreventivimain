"use client"

import { Check, ArrowRight } from "lucide-react"

interface Step {
  id: number
  name: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={`relative flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
            <button
              type="button"
              onClick={() => {
                if (index <= currentStep) {
                  onStepClick(step.id)
                }
              }}
              className={`group flex w-full items-center focus:outline-none ${
                index <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              disabled={index > currentStep}
            >
              <span className="flex items-center px-4 py-2 text-sm font-medium">
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    index < currentStep
                      ? "bg-[#ff0092] text-white"
                      : index === currentStep
                        ? "border-2 border-[#ff0092] text-[#ff0092]"
                        : "border-2 border-gray-300 text-gray-500"
                  }`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" aria-hidden="true" /> : <span>{index + 1}</span>}
                </span>
                <span
                  className={`ml-4 text-sm font-medium ${index <= currentStep ? "text-gray-900" : "text-gray-500"}`}
                >
                  {step.name}
                </span>
              </span>
            </button>

            {index < steps.length - 1 && (
              <div className="absolute right-0 top-0 hidden h-full w-5 md:flex items-center justify-center">
                <ArrowRight
                  className={`h-5 w-5 ${index < currentStep ? "text-[#ff0092]" : "text-gray-300"}`}
                  aria-hidden="true"
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
