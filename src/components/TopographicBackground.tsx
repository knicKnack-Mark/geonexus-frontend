
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ThemeColors = {
  terrain: number;
  opacity: number;
  fog: number;
};

const getThemeColors = (): ThemeColors => {
  const isLight = document.documentElement.dataset.theme === "light";

  return isLight
    ? {
        terrain: 0x008c99,
        opacity: 0.38,
        fog: 0xf4f7fb,
      }
    : {
        terrain: 0x00f2fe,
        opacity: 0.42,
        fog: 0x0b0f19,
      };
};

export default function TopographicBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      55,
      Math.max(mount.clientWidth, 1) /
        Math.max(mount.clientHeight, 1),
      0.1,
      200
    );

    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.75)
    );
    renderer.setSize(
      Math.max(mount.clientWidth, 1),
      Math.max(mount.clientHeight, 1)
    );
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    mount.appendChild(renderer.domElement);

    // Generate the elevated topographic surface.
    const geometry = new THREE.PlaneGeometry(48, 48, 120, 120);
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      const elevation =
        Math.sin(x * 0.32) * 0.55 +
        Math.cos(y * 0.27) * 0.45 +
        Math.sin((x + y) * 0.18) * 0.3 +
        Math.cos(Math.sqrt(x * x + y * y) * 0.35) * 0.2;

      positions.setZ(i, elevation);
    }

    geometry.computeVertexNormals();

    const initialTheme = getThemeColors();

    const material = new THREE.MeshBasicMaterial({
      color: initialTheme.terrain,
      wireframe: true,
      transparent: true,
      opacity: initialTheme.opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const terrain = new THREE.Mesh(geometry, material);

    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, -0.8, 0);
    terrain.frustumCulled = false;

    scene.add(terrain);

    // Add a second, subtler terrain grid for more visual depth.
    const detailGeometry = new THREE.PlaneGeometry(48, 48, 60, 60);
    const detailMaterial = new THREE.MeshBasicMaterial({
      color: initialTheme.terrain,
      wireframe: true,
      transparent: true,
      opacity: initialTheme.opacity * 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const detailTerrain = new THREE.Mesh(
      detailGeometry,
      detailMaterial
    );

    detailTerrain.rotation.x = -Math.PI / 2;
    detailTerrain.position.set(0, -0.78, 0);
    detailTerrain.scale.set(1.04, 1.04, 1);
    detailTerrain.frustumCulled = false;

    scene.add(detailTerrain);

    scene.fog = new THREE.FogExp2(initialTheme.fog, 0.008);

    const updateTerrainTheme = () => {
      const colors = getThemeColors();

      material.color.setHex(colors.terrain);
      material.opacity = colors.opacity;

      detailMaterial.color.setHex(colors.terrain);
      detailMaterial.opacity = colors.opacity * 0.3;

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(colors.fog);
      }
    };

    const themeObserver = new MutationObserver(updateTerrainTheme);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

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
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
      );

      updateScrollProgress();
    };

    updateScrollProgress();

    window.addEventListener("scroll", updateScrollProgress, {
      passive: true,
    });
    window.addEventListener("resize", resizeRenderer);

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(mount);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });

    visibilityObserver.observe(mount);

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      if (!isVisible) return;

      if (!prefersReducedMotion.matches) {
        const elapsedTime = performance.now();

        currentScrollProgress +=
          (targetScrollProgress - currentScrollProgress) * 0.045;

        const rotation =
          Math.sin(elapsedTime * 0.0005) * 0.035 +
          currentScrollProgress * 0.25;

        terrain.rotation.z = rotation;
        detailTerrain.rotation.z = rotation;

        terrain.position.z = -currentScrollProgress * 1.2;
        detailTerrain.position.z = terrain.position.z;

        terrain.position.y = -0.8 - currentScrollProgress * 0.2;
        detailTerrain.position.y = terrain.position.y + 0.02;

        camera.position.x = currentScrollProgress * 0.4;
        camera.position.y = 8 + currentScrollProgress * 0.6;
      }

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", resizeRenderer);

      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();

      scene.remove(terrain, detailTerrain);

      geometry.dispose();
      material.dispose();
      detailGeometry.dispose();
      detailMaterial.dispose();

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
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        opacity: 1,
      }}
    />
  );
}
