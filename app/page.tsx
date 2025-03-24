"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import Lenis from "@studio-freight/lenis"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import FloatingHearts from "@/components/floating-hearts"
import AudioVisualizer from "@/components/audio-visualizer"
import SecretLetter from "@/components/secret-letter"
import { Play, Pause } from "lucide-react"

// Import Three.js components dynamically sin SSR
const GardenScene = dynamic(() => import("@/components/garden-scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-pink-50 flex items-center justify-center">
      <div className="text-pink-600 text-lg animate-pulse">Cargando jardín mágico...</div>
    </div>
  ),
})

export default function HomePage() {
  const [showLetter, setShowLetter] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const introTextRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  // Inicialización de animaciones y scroll suave con GSAP y Lenis
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin)

    // Inicializar Lenis para scroll suave
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Timeline GSAP para animación del Hero
    const tl = gsap.timeline({ delay: 0.5 })
    if (heroRef.current && introTextRef.current) {
      tl.fromTo(
        heroRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      )
      tl.to(introTextRef.current, {
        duration: 3,
        text: "Juliette, he creado este jardín digital para ti, donde cada flor, estrella y nota musical refleja lo que siento. Explora y descubre todos sus secretos...",
        ease: "none",
      })
    }

    // Animaciones en scroll para cada sección
    if (mainRef.current) {
      const sections = mainRef.current.querySelectorAll("section")
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        )
      })
    }

    return () => {
      lenis.destroy()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // Función para reproducir/pausar audio y configurar el visualizador
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return
  
    if (audioPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
    } else {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioPlaying(true)
  
            if (!audioContextRef.current && window.AudioContext) {
              audioContextRef.current = new AudioContext()
  
              if (audioRef.current instanceof HTMLAudioElement) {
                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
                sourceRef.current.connect(audioContextRef.current.destination)
              }
            }
          })
          .catch((error) => {
            console.error("Error al reproducir el audio:", error)
            setAudioPlaying(false)
          })
      } else {
        setAudioPlaying(true)
      }
    }
  }, [audioPlaying])
  

  return (
    <main ref={mainRef} className="min-h-screen bg-gradient-to-b from-[#1A1520] to-[#2D1F33] overflow-hidden relative">
      {/* Elemento de audio oculto */}
      <audio ref={audioRef} loop src="/assets/Amor2.mp3" className="hidden" />

      {/* Corazones flotantes */}
      <FloatingHearts />

      {/* Sección Hero con fondo parallax y animaciones */}
      <section ref={heroRef} className="h-screen flex flex-col items-center justify-center px-4 relative z-20">
        {/* Fondo parallax (puedes cambiar la imagen) */}
        <div className="absolute inset-0 bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center opacity-30 -z-10" />
        <h1 className="text-4xl md:text-6xl font-bold text-pink-600 mb-6 text-center drop-shadow-lg">
          Para el amor de mi alma
        </h1>
        <div ref={introTextRef} className="max-w-2xl text-lg md:text-xl text-center text-purple-800 mb-8 min-h-[100px] drop-shadow-md" />
        <div className="flex gap-4">
          <Button onClick={toggleAudio} className="bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300 shadow-md">
            {audioPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pausar música
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Reproducir música
              </>
            )}
          </Button>
          <Button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            variant="outline"
            className="border-[#8B2942] text-[#D9A566] hover:bg-[#2D1F33] transition-all duration-300 shadow-md"
          >
            Explorar el jardín
          </Button>
        </div>
      </section>

      {/* Sección del jardín interactivo */}
      <section className="py-16 px-4 relative z-20">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8 drop-shadow-md">
          Nuestro jardín mágico
        </h2>
        <p className="text-center text-purple-600 max-w-2xl mx-auto mb-8">
          Explora este jardín donde cada flor tiene un significado especial. Haz clic en las flores y estrellas para descubrir mensajes de amor.
        </p>
        <GardenScene />
      </section>

      {/* Sección del visualizador de audio con fondo animado */}
      <section className="py-16 px-4 bg-[#2D1F33] relative z-20">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-8 drop-shadow-md">
          Nuestra melodía
        </h2>
        <p className="text-center text-pink-700 max-w-2xl mx-auto mb-8">
          Esta visualización reacciona a una cancion que te dedico con todo mi amor💖. Cada onda representa un latido de mi corazón por ti.
        </p>
        {audioPlaying ? (
          <AudioVisualizer audioRef={audioRef} audioContext={audioContextRef.current} sourceNode={sourceRef.current} />
        ) : (
          <div className="w-full h-[300px] flex items-center justify-center bg-[#2D1F33] rounded-lg">
            <Button onClick={toggleAudio} className="bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300 shadow-md">
              <Play className="mr-2 h-4 w-4" /> Reproducir para ver la magia
            </Button>
          </div>
        )}
      </section>

      {/* Sección de la carta secreta con animación refinada */}
      <section className="py-16 px-4 relative z-20 mb-20">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8 drop-shadow-md">
          Una carta para ti
        </h2>
        <p className="text-center text-purple-600 max-w-2xl mx-auto mb-8">
          He escrito algo especial para ti. Haz clic para descubrirlo.
        </p>
        <div className="flex justify-center">
          <SecretLetter isOpen={showLetter} onToggle={() => setShowLetter(!showLetter)} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-pink-700 bg-pink-50 relative z-20">
        <p className="drop-shadow-md">Hecho con ❤️ para ti, con todo mi amor.</p>
      </footer>
    </main>
  )
}
