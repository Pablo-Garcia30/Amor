"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"

export default function GardenScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interactiveObjects, setInteractiveObjects] = useState<THREE.Object3D[]>([])
  const animationIdRef = useRef<number | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  // Datos personalizados para flores y estrellas
  const flowerData = [
    { x: -2, z: -2, color: "#ff8fa3", message: "Flor 1: Mi primer suspiro de amor" },
    { x: 2, z: -1, color: "#ffb7c5", message: "Flor 2: Eres mi rayo de luz" },
    { x: 0, z: -3, color: "#ffc8dd", message: "Flor 3: Cada día contigo es un regalo" },
    { x: -3, z: 0, color: "#ff5c8a", message: "Flor 4: Mi pasión por ti crece sin fin" },
    { x: 3, z: -3, color: "#ff99ac", message: "Flor 5: Tu amor me inspira" },
  ]

  const starData = [
    { x: 1, y: 3, z: -2, message: "Estrella 1: Brillas en mi cielo" },
    { x: -2, y: 4, z: -1, message: "Estrella 2: Iluminas mi camino" },
    { x: 3, y: 2, z: -3, message: "Estrella 3: Eres mi guía en la noche" },
  ]

  // Función para mostrar el mensaje asignado
  const showMessage = useCallback((msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    try {
      // Limpiar contenido previo
      containerRef.current.innerHTML = ""
      const interactiveObjs: THREE.Object3D[] = []

      // Crear escena, cámara y renderer
      const scene = new THREE.Scene()
      scene.background = new THREE.Color("#fff5f8")
      sceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        60,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(0, 3, 8)
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
      containerRef.current.appendChild(renderer.domElement)

      // Añadir luces
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
      scene.add(ambientLight)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 5, 5)
      scene.add(directionalLight)

      // Crear suelo
      const groundGeometry = new THREE.PlaneGeometry(20, 20)
      const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x88cc88 })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -2
      scene.add(ground)

      // Función para crear una flor interactiva con mensaje personalizado
      const createFlower = (x: number, z: number, color: string, msg: string) => {
        const group = new THREE.Group()

        // Tallo
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 6)
        const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00 })
        const stem = new THREE.Mesh(stemGeometry, stemMaterial)
        stem.position.y = -0.5
        group.add(stem)

        // Centro de la flor
        const centerGeometry = new THREE.SphereGeometry(0.2, 8, 8)
        const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        const center = new THREE.Mesh(centerGeometry, centerMaterial)
        group.add(center)

        // Pétalos
        const petalGeometry = new THREE.SphereGeometry(0.2, 8, 8)
        const petalMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2
          const petal = new THREE.Mesh(petalGeometry, petalMaterial)
          petal.position.x = Math.cos(angle) * 0.3
          petal.position.z = Math.sin(angle) * 0.3
          group.add(petal)
        }

        // Agregar hitbox invisible para ampliar la zona de detección
        const hitboxGeometry = new THREE.SphereGeometry(0.5, 8, 8)
        const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false })
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial)
        hitbox.name = "hitbox"
        group.add(hitbox)

        group.position.set(x, -1, z)
        group.userData = { message: msg }
        scene.add(group)
        interactiveObjs.push(group)
      }

      // Función para crear una estrella interactiva con mensaje personalizado
      const createStar = (x: number, y: number, z: number, msg: string) => {
        const group = new THREE.Group()

        // Crear estrella
        const starGeometry = new THREE.OctahedronGeometry(0.3, 0)
        const starMaterial = new THREE.MeshStandardMaterial({
          color: 0xffff99,
          emissive: 0xffff99,
          emissiveIntensity: 0.5,
        })
        const star = new THREE.Mesh(starGeometry, starMaterial)
        group.add(star)

        // Agregar hitbox invisible
        const hitboxGeometry = new THREE.SphereGeometry(0.5, 8, 8)
        const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false })
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial)
        hitbox.name = "hitbox"
        group.add(hitbox)

        group.position.set(x, y, z)
        group.userData = { message: msg }
        scene.add(group)
        interactiveObjs.push(group)
      }

      // Crear flores con datos personalizados
      flowerData.forEach((data) => {
        createFlower(data.x, data.z, data.color, data.message)
      })

      // Crear estrellas con datos personalizados
      starData.forEach((data) => {
        createStar(data.x, data.y, data.z, data.message)
      })

      // Guardar los objetos interactivos en el state
      setInteractiveObjects(interactiveObjs)

      // Texto "Te Amo" (objeto 3D complementario)
      const textMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.5, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff6b95 }),
      )
      textMesh.position.set(0, 4, -5)
      scene.add(textMesh)

      // Función de animación
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate)
        const time = Date.now() * 0.001

        // Animar objetos interactivos (flores y estrellas)
        interactiveObjs.forEach((obj) => {
          // Para las flores, asumimos que tienen más de 2 hijos (hitbox incluida)
          if (obj.userData.message && obj.children.length > 2) {
            obj.rotation.y += 0.01
            obj.position.y = -1 + Math.sin(time) * 0.05
          }
        })

        // Animar la cámara con un sutil movimiento circular
        camera.position.x = Math.sin(time * 0.1) * 8
        camera.position.z = Math.cos(time * 0.1) * 8
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }
      animate()

      // Ajustar renderer al redimensionar la ventana
      const handleResize = () => {
        if (!containerRef.current) return
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
      window.addEventListener("resize", handleResize)

      setIsLoaded(true)

      // Limpieza al desmontar
      return () => {
        window.removeEventListener("resize", handleResize)
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
        renderer.dispose()
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            if (Array.isArray(object.material)) {
              object.material.forEach((m) => m.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
        containerRef.current && (containerRef.current.innerHTML = "")
      }
    } catch (err) {
      console.error("Error al crear la escena 3D:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar el jardín 3D")
      setIsLoaded(true)
    }
  }, [])

  // Detección de pointerdown con conversión correcta de coordenadas
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return

      // Obtener el rectángulo del contenedor
      const rect = containerRef.current.getBoundingClientRect()

      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )

      // Actualizar matrices antes de hacer el raycasting
      cameraRef.current.updateMatrixWorld(true)
      interactiveObjects.forEach(obj => obj.updateMatrixWorld(true))

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, cameraRef.current)
      const intersects = raycaster.intersectObjects(interactiveObjects, true)
      if (intersects.length > 0) {
        // Se asume que el mensaje está en el objeto padre
        const msg = intersects[0].object.parent?.userData?.message
        if (msg) showMessage(msg)
      }
    }

    containerRef.current?.addEventListener("pointerdown", handlePointerDown)
    return () => containerRef.current?.removeEventListener("pointerdown", handlePointerDown)
  }, [interactiveObjects, showMessage])

  return (
    <div className="w-full h-[500px] relative rounded-lg overflow-hidden">
      {message && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 px-4 py-2 rounded-full text-pink-600 font-medium animate-bounce">
          {message}
        </div>
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-pink-50 z-20">
          <div className="text-pink-600 text-lg animate-pulse">Cargando jardín mágico...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-50 z-20 p-4">
          <div className="text-pink-600 text-lg mb-4 text-center">
            No se pudo cargar el jardín 3D, pero aún puedes ver mensajes de amor
          </div>
          <Button onClick={() => showMessage("Intenta de nuevo")} className="bg-pink-500 hover:bg-pink-600 text-white">
            Mostrar mensaje de amor
          </Button>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full bg-pink-50" />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <Button onClick={() => showMessage("¡Tendras que buscar mas mi niña hermosa!")} className="bg-pink-500 hover:bg-pink-600 text-white">
          Mostrar mensaje de amor
        </Button>
      </div>
    </div>
  )
}
