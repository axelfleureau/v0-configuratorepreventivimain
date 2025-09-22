"use client"

import { useEffect, useRef } from "react"

interface CommunicationPlanCircleProps {
  degree: number
  size?: number
  className?: string
}

export function CommunicationPlanCircle({ degree, size = 200, className = "" }: CommunicationPlanCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Calculate center and radius
    const centerX = size / 2
    const centerY = size / 2
    const radius = (size / 2) * 0.85

    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(255, 0, 146, 0.1)" // Light pink
    ctx.fill()

    // Draw filled portion based on degree
    if (degree > 0) {
      // Convert degree to radians, starting from -90 degrees (top)
      const startAngle = -Math.PI / 2
      const endAngle = startAngle + (degree / 360) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.lineTo(centerX, centerY)
      ctx.fillStyle = "rgba(255, 0, 146, 0.5)" // Pink with transparency
      ctx.fill()
    }

    // Draw border
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "rgba(255, 0, 146, 0.8)" // Darker pink
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw degree text
    ctx.font = "bold 32px Arial"
    ctx.fillStyle = "#ff0092" // Pink
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${Math.round(degree)}°`, centerX, centerY)
  }, [degree, size])

  return <canvas ref={canvasRef} width={size} height={size} className={className} />
}
