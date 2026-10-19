
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ThemeColors = {
  terrain: number;
  opacity: number;
  fog: number;
};

const getThemeColors = (): ThemeColors => {
  const isLight =
    document.documentElement.dataset.theme === "light";

  return isLight
    ? {
        terrain: 0x008c99,
        opacity: 0.16,
        fog: 0xf4f7fb,
      }
    : {
        terrain: 0x00f2fe,
        opacity: 0.2,
        fog: 0x0b0f19,
      };
};

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
      Math.max(mount.clientWidth, 1) /
        Math.max(mount.clientHeight, 1),
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

    // Create topographic terrain geometry.
    const geometry = new THREE.PlaneGeometry(42, 42, 100, 100);
    const positions = geometry.attributes.position;

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

    // Initial theme colors.
    const initialTheme = getThemeColors();

    const material = new THREE.MeshBasicMaterial({
      color: initialTheme.terrain,
      wireframe: true,
      transparent: true,
      opacity: initialTheme.opacity,
      depthWrite: false,
    });

    const terrain = new THREE.Mesh(geometry, material);

    // Lay terrain horizontally.
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -1.3;

    scene.add(terrain);

    // Theme-aware atmospheric fog.
    scene.fog = new THREE.FogExp2(initialTheme.fog, 0.018);

    // Update the existing scene when the theme changes.
    const updateTerrainTheme = () => {
      const colors = getThemeColors();

      material.color.setHex(colors.terrain);
      material.opacity = colors.opacity;

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(colors.fog);
      }
    };

    const themeObserver = new MutationObserver(updateTerrainTheme);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Scroll state.
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let animationFrame = 0;
    let isVisible = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateScrollProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      targetScrollProgress =
        scrollableHeight > 0
          ? THREE.MathUtils.clamp(
              window.scrollY / scrollableHeight,
              0,
              1
            )
          : 0;
    };

    const resizeRenderer = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (width <= 0 || height <= 0) return;

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

    // Pause rendering when the canvas is outside the viewport.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });

    visibilityObserver.observe(mount);

    // Scroll-reactive animation.
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      if (!isVisible) return;

      if (prefersReducedMotion.matches) {
        renderer.render(scene, camera);
        return;
      }

      const elapsedTime = performance.now();

      // Smoothly interpolate toward the scroll position.
      currentScrollProgress +=
        (targetScrollProgress - currentScrollProgress) * 0.045;

      // Combine gentle idle movement with scroll-driven rotation.
      terrain.rotation.y =
        Math.sin(elapsedTime * 0.0005) * 0.08 +
        currentScrollProgress * 0.65;

      // Create depth movement as the visitor scrolls.
      terrain.position.z = -currentScrollProgress * 2.2;
      terrain.position.y = -1.3 - currentScrollProgress * 0.5;

      // Slowly shift the camera angle.
      camera.position.x = currentScrollProgress * 0.8;
      camera.position.y = 7 + currentScrollProgress * 1.2;

      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup listeners, observers, and GPU resources.
    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", resizeRenderer);

      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();

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
