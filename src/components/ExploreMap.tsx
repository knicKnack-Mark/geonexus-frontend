
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";
import {
  ArrowLeft,
  Crosshair,
  LocateFixed,
  MapPin,
  RotateCcw,
  Ruler,
  Search,
  Sun,
  Moon,
} from "lucide-react";

type Coordinates = {
  lat: number;
  lng: number;
};
type MeasurementMode = "none" | "distance" | "area";
type MeasurePoint = {
  lng: number;
  lat: number;
};

const EARTH_RADIUS_METERS = 6_371_008.8;

function calculateDistance(points: MeasurePoint[]): number {
  let total = 0;

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];

    const lat1 = (previous.lat * Math.PI) / 180;
    const lat2 = (current.lat * Math.PI) / 180;
    const deltaLat = lat2 - lat1;
    const deltaLng = ((current.lng - previous.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) ** 2;

    total +=
      2 *
      EARTH_RADIUS_METERS *
      Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  return total;
}

function calculateArea(points: MeasurePoint[]): number {
  if (points.length < 3) return 0;

  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    const currentLng = (current.lng * Math.PI) / 180;
    const nextLng = (next.lng * Math.PI) / 180;
    const currentLat = (current.lat * Math.PI) / 180;
    const nextLat = (next.lat * Math.PI) / 180;

    sum +=
      (nextLng - currentLng) *
      (2 + Math.sin(currentLat) + Math.sin(nextLat));
  }

  return Math.abs((sum * EARTH_RADIUS_METERS ** 2) / 2);
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(3)} km`;
  }

  return `${meters.toFixed(2)} m`;
}

function formatArea(squareMeters: number): string {
  if (squareMeters >= 10_000) {
    return `${(squareMeters / 10_000).toFixed(4)} ha`;
  }

  return `${squareMeters.toFixed(2)} m²`;
}

const INITIAL_CENTER: [number, number] = [121.774, 12.8797];
const INITIAL_ZOOM = 5;

export default function ExploreMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [searchError, setSearchError] = useState("");

  const measurementModeRef = useRef<MeasurementMode>("none");
  const measurementPointsRef = useRef<MeasurePoint[]>([]);

  const [measurementMode, setMeasurementMode] =
    useState<MeasurementMode>("none");
  const [measurementPoints, setMeasurementPoints] =
    useState<MeasurePoint[]>([]);
  const [mapStyle, setMapStyle] = useState<"dark" | "light">("dark");
  const measurementGeometryRef = useRef<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;

    async function initializeMap() {
      if (!containerRef.current) return;

      try {
        const maplibregl = await import("maplibre-gl");

        if (cancelled || !containerRef.current) return;

        maplibregl.setWorkerUrl(
          new URL(
            "../../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
            import.meta.url,
          ).toString(),
        );

        map = new maplibregl.Map({
          container: containerRef.current,
          style: `https://tiles.openfreemap.org/styles/${mapStyle}`,
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          maxZoom: 19,
        });

        mapRef.current = map;

        map.addControl(
          new maplibregl.NavigationControl({
            visualizePitch: true,
          }),
          "top-right",
        );

        map.addControl(
          new maplibregl.ScaleControl({
            unit: "metric",
          }),
          "bottom-left",
        );

        map.on("style.load", () => {
          if (cancelled || !map) return;

          if (!map.getSource("measurement-geometry")) {
            map.addSource("measurement-geometry", {
              type: "geojson",
              data: measurementGeometryRef.current,
            });
          }

          if (!map.getLayer("measurement-area-fill")) {
            map.addLayer({
              id: "measurement-area-fill",
              type: "fill",
              source: "measurement-geometry",
              filter: ["==", ["geometry-type"], "Polygon"],
              paint: {
                "fill-color": "#38bdf8",
                "fill-opacity": 0.16,
              },
            });
          }

          if (!map.getLayer("measurement-line")) {
            map.addLayer({
              id: "measurement-line",
              type: "line",
              source: "measurement-geometry",
              filter: ["==", ["geometry-type"], "LineString"],
              paint: {
                "line-color": "#38bdf8",
                "line-width": 3,
                "line-dasharray": [2, 1],
              },
            });
          }

          if (!map.getLayer("measurement-points")) {
            map.addLayer({
              id: "measurement-points",
              type: "circle",
              source: "measurement-geometry",
              filter: ["==", ["geometry-type"], "Point"],
              paint: {
                "circle-radius": 5,
                "circle-color": "#ffffff",
                "circle-stroke-color": "#38bdf8",
                "circle-stroke-width": 2,
              },
            });
          }

          setMapReady(true);
          setMapError("");
        });

        map.on("error", () => {
          if (!cancelled) {
            setMapError(
              "Some map resources could not load. Check your connection and try refreshing.",
            );
          }
        });

        map.on("click", (event) => {
          const { lng, lat } = event.lngLat;
          const mode = measurementModeRef.current;

          if (mode !== "none") {
            const nextPoints = [
              ...measurementPointsRef.current,
              { lng, lat },
            ];

            measurementPointsRef.current = nextPoints;
            setMeasurementPoints(nextPoints);

            const source = map?.getSource(
              "measurement-geometry",
            ) as GeoJSONSource | undefined;

            if (source) {
              const coordinates = nextPoints.map(
                (point) => [point.lng, point.lat] as [number, number],
              );

              const features: GeoJSON.Feature[] = [];

              if (mode === "distance" && coordinates.length >= 2) {
                features.push({
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates,
                  },
                });
              }

              if (mode === "area" && coordinates.length >= 3) {
                features.push({
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Polygon",
                    coordinates: [[...coordinates, coordinates[0]]],
                  },
                });
              }

              for (const coordinate of coordinates) {
                features.push({
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: coordinate,
                  },
                });
              }

              const measurementGeometry: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features,
              };
              measurementGeometryRef.current = measurementGeometry;
              source.setData(measurementGeometry);
            }

            return;
          }

          const activeMap = map;
          if (!activeMap) return;

          setCoordinates({ lat, lng });
          setSearchValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setSearchError("");

          markerRef.current?.remove();

          markerRef.current = new maplibregl.Marker({
            color: "#38bdf8",
            scale: 1.1,
          })
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup({ offset: 22 }).setText(
                `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              ),
            )
            .addTo(activeMap);
        });
      } catch {
        if (!cancelled) {
          setMapError("Unable to initialize the map. Please refresh and try again.");
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  const searchCoordinates = () => {
    const values = searchValue.split(",").map((value) => value.trim());

    if (values.length !== 2 || values.some((value) => value === "")) {
      setSearchError("Enter coordinates as latitude, longitude.");
      return;
    }

    const lat = Number(values[0]);
    const lng = Number(values[1]);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setSearchError("Enter a valid latitude and longitude.");
      return;
    }

    const map = mapRef.current;

    if (!map) {
      setSearchError("The map is still loading. Please try again.");
      return;
    }

    import("maplibre-gl").then((maplibregl) => {
      markerRef.current?.remove();

      markerRef.current = new maplibregl.Marker({
        color: "#38bdf8",
        scale: 1.1,
      })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 22 }).setText(
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          ),
        )
        .addTo(map);

      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 13),
        essential: true,
      });

      setCoordinates({ lat, lng });
      setSearchValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setSearchError("");
    });
  };

  const startMeasurement = (mode: Exclude<MeasurementMode, "none">) => {
    measurementModeRef.current = mode;
    measurementPointsRef.current = [];
    measurementGeometryRef.current = {
      type: "FeatureCollection",
      features: [],
    };

    setMeasurementMode(mode);
    setMeasurementPoints([]);
    setSearchError("");

    markerRef.current?.remove();
    markerRef.current = null;

    const source = mapRef.current?.getSource(
      "measurement-geometry",
    ) as GeoJSONSource | undefined;

    source?.setData(measurementGeometryRef.current);
  };

  const finishMeasurement = () => {
    measurementModeRef.current = "none";
    setMeasurementMode("none");
  };

  const clearMeasurement = () => {
    measurementPointsRef.current = [];
    setMeasurementPoints([]);
    measurementGeometryRef.current = {
      type: "FeatureCollection",
      features: [],
    };

    const source = mapRef.current?.getSource(
      "measurement-geometry",
    ) as GeoJSONSource | undefined;

    source?.setData(measurementGeometryRef.current);
  };

  const toggleMapStyle = () => {
    const nextStyle = mapStyle === "dark" ? "bright" : "dark";
    mapRef.current?.setStyle(
      `https://tiles.openfreemap.org/styles/${nextStyle}`,
    );
    setMapStyle(nextStyle === "bright" ? "light" : "dark");
  };

  const resetMap = () => {
    measurementModeRef.current = "none";
    measurementPointsRef.current = [];
    measurementGeometryRef.current = {
      type: "FeatureCollection",
      features: [],
    };

    setMeasurementMode("none");
    setMeasurementPoints([]);

    const source = mapRef.current?.getSource(
      "measurement-geometry",
    ) as GeoJSONSource | undefined;

    source?.setData(measurementGeometryRef.current);

    mapRef.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      essential: true,
    });

    markerRef.current?.remove();
    markerRef.current = null;
    setCoordinates(null);
    setSearchValue("");
    setSearchError("");
  };

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080d18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to GeoNexus</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.06em]"
          >
            GEO<span className="text-sky-400"></span>NEXUS
          </Link>

          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 sm:text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                mapReady ? "bg-sky-400" : "bg-amber-400"
              }`}
            />
            {mapReady ? "Map online" : "Initializing"}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-400">
              GeoNexus / Spatial explorer
            </p>

            <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
              Explore the{" "}
              <span className="text-sky-400">ground truth.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Explore locations, navigate the map, and inspect geographic
              coordinates. Select any point on the map to drop a marker.
            </p>
          </div>

          <button
            type="button"
            onClick={resetMap}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75 transition hover:border-sky-400/40 hover:text-sky-300"
          >
            <RotateCcw className="h-4 w-4" />
            Reset map
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1320]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-5">
              <div className="rounded-xl border border-white/10 bg-[#080d18]/85 px-3 py-2.5 backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                  Map interface
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-white/80">
                  <Crosshair className="h-3.5 w-3.5 text-sky-400" />
                  Interactive map
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#080d18]/85 px-3 py-2.5 text-right backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                  Projection
                </p>
                <p className="mt-1 text-xs text-white/80">
                  Web Mercator
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMapStyle}
              aria-label={`Switch to ${mapStyle === "dark" ? "light" : "dark"} map`}
              className="absolute right-4 top-20 z-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#080d18]/90 px-3 py-2.5 text-xs text-white/80 shadow-lg backdrop-blur-md transition hover:border-sky-400/40 hover:text-sky-300"
            >
              {mapStyle === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {mapStyle === "dark" ? "Light map" : "Dark map"}
            </button>

            <div
              ref={containerRef}
              className="h-[60vh] min-h-[420px] w-full sm:h-[680px]"
              aria-label="Interactive geographic map. Click to select a location."
            />

            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080d18]/75 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-400" />
                  <p className="mt-4 text-sm text-white/65">
                    Loading spatial data...
                  </p>
                </div>
              </div>
            )}

            {mapError && (
              <div
                role="status"
                className="absolute bottom-4 left-4 right-4 z-30 rounded-xl border border-amber-400/20 bg-[#080d18]/95 p-4 text-sm text-amber-100 backdrop-blur-md"
              >
                {mapError}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-medium">Measurement tools</h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Choose a tool, then click points on the map to draw your measurement.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => startMeasurement("distance")}
                  aria-pressed={measurementMode === "distance"}
                  className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
                    measurementMode === "distance"
                      ? "border-sky-400/60 bg-sky-400/10 text-sky-300"
                      : "border-white/10 text-white/65 hover:border-sky-400/40"
                  }`}
                >
                  <Ruler className="mb-2 h-4 w-4" />
                  <span className="block font-medium">Distance</span>
                  <span className="mt-1 block text-[10px] opacity-60">
                    Measure a line
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => startMeasurement("area")}
                  aria-pressed={measurementMode === "area"}
                  className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
                    measurementMode === "area"
                      ? "border-sky-400/60 bg-sky-400/10 text-sky-300"
                      : "border-white/10 text-white/65 hover:border-sky-400/40"
                  }`}
                >
                  <MapPin className="mb-2 h-4 w-4" />
                  <span className="block font-medium">Land area</span>
                  <span className="mt-1 block text-[10px] opacity-60">
                    Outline a parcel
                  </span>
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/45">
                    Measurement status
                  </span>
                  <span className="text-xs text-sky-300">
                    {measurementMode === "none"
                      ? "Inactive"
                      : measurementMode === "distance"
                        ? "Distance mode"
                        : "Area mode"}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {measurementMode === "area"
                      ? "Estimated area"
                      : "Total distance"}
                  </p>

                  <p className="mt-1 text-2xl font-medium tracking-tight text-white">
                    {measurementMode === "area"
                      ? measurementPoints.length >= 3
                        ? formatArea(calculateArea(measurementPoints))
                        : "—"
                      : measurementPoints.length >= 2
                        ? formatDistance(calculateDistance(measurementPoints))
                        : "—"}
                  </p>

                  {measurementMode === "area" &&
                    measurementPoints.length >= 3 && (
                      <p className="mt-1 text-xs text-white/40">
                        {calculateArea(measurementPoints).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 },
                        )}{" "}
                        square meters
                      </p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs text-white/45">Points added</span>
                  <span className="font-mono text-sm text-white/80">
                    {measurementPoints.length}
                  </span>
                </div>

                {measurementMode === "area" &&
                  measurementPoints.length < 3 && (
                    <p className="mt-3 text-xs leading-5 text-amber-200/75">
                      Add at least 3 points to calculate an area.
                    </p>
                  )}

                {measurementMode === "distance" &&
                  measurementPoints.length < 2 && (
                    <p className="mt-3 text-xs leading-5 text-white/40">
                      Add at least 2 points to calculate distance.
                    </p>
                  )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={finishMeasurement}
                  disabled={measurementMode === "none"}
                  className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/70 transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Finish drawing
                </button>

                <button
                  type="button"
                  onClick={clearMeasurement}
                  disabled={measurementPoints.length === 0}
                  className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/70 transition hover:border-rose-400/40 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear drawing
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-medium">Coordinate search</h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Enter decimal-degree coordinates in latitude, longitude order.
              </p>

              <form
                className="mt-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  searchCoordinates();
                }}
              >
                <label
                  htmlFor="coordinate-search"
                  className="text-xs text-white/60"
                >
                  Latitude, longitude
                </label>

                <input
                  id="coordinate-search"
                  type="text"
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setSearchError("");
                  }}
                  placeholder="13.6218, 123.1948"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-sky-400/60"
                />

                {searchError && (
                  <p role="alert" className="mt-2 text-xs text-rose-300">
                    {searchError}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-[#07111c] transition hover:bg-sky-300"
                >
                  <LocateFixed className="h-4 w-4" />
                  Find coordinates
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-medium">Selected location</h2>
              </div>

              {coordinates ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                      Latitude
                    </p>
                    <p className="mt-1 break-all font-mono text-lg text-sky-300">
                      {coordinates.lat.toFixed(6)}°
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                      Longitude
                    </p>
                    <p className="mt-1 break-all font-mono text-lg text-sky-300">
                      {coordinates.lng.toFixed(6)}°
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard
                        ?.writeText(
                          `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
                        )
                        .catch(() => {
                          setSearchError(
                            "Could not copy automatically. Select the coordinates and copy them manually.",
                          );
                        });
                    }}
                    className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/70 transition hover:border-sky-400/40 hover:text-sky-300"
                  >
                    Copy coordinates
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
                  <Crosshair className="mx-auto h-5 w-5 text-white/30" />
                  <p className="mt-3 text-sm text-white/55">
                    No location selected
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Click anywhere on the map or search for coordinates.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.04] p-5">
              <p className="text-xs font-medium text-sky-300">
                Survey note
              </p>
              <p className="mt-2 text-xs leading-6 text-white/50">
                Map coordinates are for exploration and planning. They do
                not establish legal property boundaries or replace a
                professional land survey.
              </p>
            </section>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-[11px] leading-5 text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>GEO//NEXUS — Spatial exploration interface</p>
          <p>
            Map data © OpenStreetMap contributors · Map style by OpenFreeMap
          </p>
        </footer>
      </div>
    </main>
  );
}
