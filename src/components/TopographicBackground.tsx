
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function TopographicBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );

    camera.position.set(0, 7, 13);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    mount.appendChild(renderer.domElement);

    // Create the topographic terrain mesh
    const geometry = new THREE.PlaneGeometry(42, 42, 100, 100);
    const positions = geometry.attributes.position;

    // Add natural-looking elevation to the wireframe.
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      const elevation =
        Math.sin(x * 0.32) * 0.35 +
        Math.cos(y * 0.27) * 0.3 +
        Math.sin((x + y) * 0.18) * 0.2 +
        Math.cos(Math.sqrt(x * x + y * y) * 0.35) * 0.15;

      positions.setZ(i, elevation);
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });

    const terrain = new THREE.Mesh(geometry, material);

    // Lay the terrain horizontally.
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -1.3;

    scene.add(terrain);

    // Subtle cyan atmosphere.
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.018);

    // Scroll state.
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let animationFrame = 0;
    let isVisible = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const updateScrollProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      targetScrollProgress =
        scrollableHeight > 0
          ? THREE.MathUtils.clamp(window.scrollY / scrollableHeight, 0, 1)
          : 0;
    };

    const resizeRenderer = () => {
      if (!mount) return;

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

      updateScrollProgress();
    };

    updateScrollProgress();

    window.addEventListener("scroll", updateScrollProgress, {
      passive: true,
    });

    window.addEventListener("resize", resizeRenderer);

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(mount);

    // Pause rendering while the background is off-screen.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });

    visibilityObserver.observe(mount);

    // Animation loop.
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      if (!isVisible) return;

      if (prefersReducedMotion) {
        // Keep the terrain still for reduced-motion preferences.
        renderer.render(scene, camera);
        return;
      }

      const elapsedTime = performance.now();

      // Smoothly catch up with the user's scroll position.
      currentScrollProgress +=
        (targetScrollProgress - currentScrollProgress) * 0.045;

      // Gentle idle movement combined with scroll-reactive rotation.
      terrain.rotation.y =
        Math.sin(elapsedTime * 0.0005) * 0.08 +
        currentScrollProgress * 0.65;

      // Move the terrain gradually through the depth of the scene.
      terrain.position.z = -currentScrollProgress * 2.2;
      terrain.position.y = -1.3 - currentScrollProgress * 0.5;

      // Slightly change the camera angle as the visitor scrolls.
      camera.position.x = currentScrollProgress * 0.8;
      camera.position.y = 7 + currentScrollProgress * 1.2;

      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up animation, observers, and GPU resources.
    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", resizeRenderer);

      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      scene.remove(terrain);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    />
  );
}
