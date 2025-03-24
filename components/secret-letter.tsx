"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Heart, X } from "lucide-react"

interface SecretLetterProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SecretLetter({ isOpen, onToggle }: SecretLetterProps) {
  const envelopeRef = useRef<HTMLDivElement>(null)
  const letterRef = useRef<HTMLDivElement>(null)
  const [letterVisible, setLetterVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Animación para abrir el sobre usando un timeline
      const tl = gsap.timeline()
      const flapElement = envelopeRef.current?.querySelector(".envelope-flap")
      if (flapElement && letterRef.current) {
        tl.to(flapElement, {
          rotationX: 180,
          duration: 0.6,
          ease: "power2.inOut",
        })
          .to(letterRef.current, {
            y: -200,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => setLetterVisible(true),
          }, "-=0.2")
      }
    } else {
      // Animación para cerrar el sobre
      setLetterVisible(false)
      const tl = gsap.timeline()
      if (letterRef.current) {
        tl.to(letterRef.current, {
          y: 0,
          duration: 0.6,
          ease: "power2.in",
        })
      }
      const flapElement = envelopeRef.current?.querySelector(".envelope-flap")
      if (flapElement) {
        tl.to(flapElement, {
          rotationX: 0,
          duration: 0.6,
          ease: "power2.inOut",
          delay: 0.2,
        }, "-=0.3")
      }
    }
  }, [isOpen])

  return (
    <div className="relative" style={{ zIndex: 20 }}>
      {/* Sobre */}
      <div
        ref={envelopeRef}
        className={`w-64 h-40 bg-pink-100 border-2 border-pink-300 rounded-md mx-auto cursor-pointer ${isOpen ? "pointer-events-none" : ""}`}
        onClick={!isOpen ? onToggle : undefined}
        style={{ perspective: "1000px" }}
      >
        {/* Tapa del sobre */}
        <div
          className="envelope-flap w-full h-16 bg-pink-200 border-b-2 border-pink-300 rounded-t-md"
          style={{
            transformOrigin: "bottom",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <div className="w-0 h-0 border-l-[32px] border-r-[32px] border-t-[16px] border-l-transparent border-r-transparent border-t-pink-200 absolute left-1/2 -translate-x-1/2"></div>
          </div>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
          >
            <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500" />
          </div>
        </div>

        {/* Cuerpo del sobre */}
        <div className="w-full h-24 bg-pink-200 flex items-center justify-center">
          <Heart className="text-pink-500" size={32} />
        </div>
      </div>

      {/* Carta */}
      <div
        ref={letterRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-56 min-h-80 bg-white shadow-md rounded-md p-4 z-10 overflow-auto"
        style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      >
        {letterVisible && (
          <div className="h-full flex flex-col">
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-2">
              <h3 className="text-xl font-bold text-pink-600">Mi amor</h3>
              <p className="text-pink-700">
                Cada día a tu lado es una aventura maravillosa. Gracias por llenar mi vida de alegría y amor.
              </p>
              <p className="text-pink-700">
                Eres mi persona favorita y quiero compartir contigo todos los momentos especiales que nos esperan.
              </p>
              <p className="text-pink-700 font-bold">Te amo con todo mi corazón ❤️</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
