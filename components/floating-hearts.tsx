"use client"

import { useEffect, useState } from "react"
import { gsap } from "gsap"

type Heart = {
  id: number
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      // Occasionally create a new heart when mouse moves
      if (Math.random() > 0.9) {
        createHeart(e.clientX, e.clientY)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const createHeart = (x: number, y: number) => {
    const newHeart: Heart = {
      id: Date.now(),
      x,
      y,
      scale: 0.5 + Math.random() * 0.5,
      rotation: -30 + Math.random() * 60,
      opacity: 0.8,
    }

    setHearts((prevHearts) => [...prevHearts, newHeart])

    // Wait for the next render cycle to ensure the element exists
    setTimeout(() => {
      const heartElement = document.getElementById(`heart-${newHeart.id}`)
      if (heartElement) {
        gsap.to(heartElement, {
          y: y - 100 - Math.random() * 100,
          x: x + (-50 + Math.random() * 100),
          opacity: 0,
          scale: 0.2,
          duration: 1 + Math.random() * 2,
          ease: "power1.out",
          onComplete: () => {
            // Aseguramos que los corazones se eliminen del estado
            setHearts((prevHearts) => prevHearts.filter((h) => h.id !== newHeart.id))
          },
        })
      }
    }, 0)
  }

  // Limitamos el número máximo de corazones para evitar problemas de rendimiento
  const displayedHearts = hearts.slice(-30)

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {displayedHearts.map((heart) => (
        <div
          id={`heart-${heart.id}`}
          key={heart.id}
          className="absolute text-2xl"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            transform: `scale(${heart.scale}) rotate(${heart.rotation}deg)`,
            opacity: heart.opacity,
          }}
        >
          💖
        </div>
      ))}
    </div>
  )
}

