"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>
  audioContext: AudioContext | null
  sourceNode: MediaElementAudioSourceNode | null
}

export default function AudioVisualizer({ audioRef, audioContext, sourceNode }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    // Verificamos que tenemos todo lo necesario
    if (!audioRef.current || !canvasRef.current || !audioContext || !sourceNode) return

    try {
      // Crear analizador
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser

      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      dataArrayRef.current = dataArray

      // Connect the source node to the analyzer without connecting to destination
      // The source is already connected to destination in the parent component
      sourceNode.connect(analyser)

      // DO NOT connect analyzer to destination again
      // Remove this line: analyser.connect(audioContext.destination)

      const canvas = canvasRef.current
      const canvasCtx = canvas.getContext("2d")

      if (!canvasCtx) return

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current || !canvasCtx) return

        animationRef.current = requestAnimationFrame(draw)

        analyserRef.current.getByteFrequencyData(dataArrayRef.current)

        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight

        const WIDTH = canvas.width
        const HEIGHT = canvas.height

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

        // Create gradient background
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, HEIGHT)
        gradient.addColorStop(0, "rgba(255, 182, 193, 0.2)")
        gradient.addColorStop(1, "rgba(147, 112, 219, 0.2)")
        canvasCtx.fillStyle = gradient
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

        // Draw heart-shaped visualizer
        const barWidth = (WIDTH / dataArrayRef.current.length) * 2.5
        let barHeight
        let x = 0

        const centerX = WIDTH / 2
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          barHeight = dataArrayRef.current[i] / 2

          // Create color gradient for bars
          const barGradient = canvasCtx.createLinearGradient(0, HEIGHT - barHeight, 0, HEIGHT)
          barGradient.addColorStop(0, "#ff6b95")
          barGradient.addColorStop(1, "#ff99ac")

          canvasCtx.fillStyle = barGradient

          // Draw heart-like shape
          const angle = (i / dataArrayRef.current.length) * Math.PI * 2
          const radius = 50 + barHeight
          const heartShape = (angle: number, radius: number) => {
            const heartX = centerX + Math.cos(angle) * radius * (1 - Math.sin(angle) * 0.5)
            const heartY = HEIGHT / 2 + Math.sin(angle) * radius
            return { x: heartX, y: heartY }
          }

          const pos = heartShape(angle, radius)

          canvasCtx.beginPath()
          canvasCtx.arc(pos.x, pos.y, barWidth / 2, 0, Math.PI * 2)
          canvasCtx.fill()

          x += barWidth + 1
        }

        // Draw pulsating heart in the center
        const heartSize = 30 + (dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length) * 0.2

        canvasCtx.fillStyle = "#ff3366"
        canvasCtx.beginPath()
        canvasCtx.moveTo(centerX, HEIGHT / 2 - heartSize / 4)

        // Left curve
        canvasCtx.bezierCurveTo(
          centerX - heartSize / 2,
          HEIGHT / 2 - heartSize / 2,
          centerX - heartSize,
          HEIGHT / 2,
          centerX,
          HEIGHT / 2 + heartSize / 2,
        )

        // Right curve
        canvasCtx.bezierCurveTo(
          centerX + heartSize,
          HEIGHT / 2,
          centerX + heartSize / 2,
          HEIGHT / 2 - heartSize / 2,
          centerX,
          HEIGHT / 2 - heartSize / 4,
        )

        canvasCtx.fill()
      }

      draw()
    } catch (error) {
      console.error("Audio visualization error:", error)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Disconnect the analyzer when component unmounts
      if (analyserRef.current) {
        analyserRef.current.disconnect()
      }
    }
  }, [audioRef, audioContext, sourceNode])

  return (
    <div className="w-full h-[300px] bg-pink-50 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

