import { type NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { AIRPORTS, type Airport } from "../data/airports";
import { SAMPLE_FLIGHTS } from "../data/sampleFlights";
import DefaultLayout from "../layout/default";
import { FiActivity, FiCompass, FiGlobe, FiMapPin, FiNavigation, FiRefreshCw } from "react-icons/fi";
import { FaPlane, FaBroadcastTower } from "react-icons/fa";

type RegionId = "north-america" | "europe" | "asia-pacific" | "global-demo";

interface Region {
  id: RegionId;
  label: string;
  centerLat: number;
  centerLon: number;
  radius: number;
}

interface AirplanesLiveAircraft {
  hex?: string;
  flight?: string;
  r?: string;
  t?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  gs?: number;
  track?: number;
  baro_rate?: number;
  seen?: number;
}

interface AirplanesLiveResponse {
  aircraft?: AirplanesLiveAircraft[];
  now?: number;
  total?: number;
}

interface FlightCardData {
  id: string;
  callsign: string;
  registration: string;
  aircraftType: string;
  lat: number;
  lon: number;
  altitudeFt: number;
  speedKts: number;
  headingDeg: number;
  verticalRateFpm: number;
  lastSeenSeconds: number;
  departure: Airport | null;
  destination: Airport | null;
  progressToDestination: number;
  source: "live" | "demo";
}

const REGIONS: Region[] = [
  { id: "north-america", label: "North America", centerLat: 39.8283, centerLon: -98.5795, radius: 2200 },
  { id: "europe", label: "Europe", centerLat: 50.1109, centerLon: 8.6821, radius: 1800 },
  { id: "asia-pacific", label: "Asia Pacific", centerLat: 22.3193, centerLon: 114.1694, radius: 2600 },
  { id: "global-demo", label: "Global demo", centerLat: 0, centerLon: 0, radius: 0 },
];

const KM_PER_NAUTICAL_MILE = 1.852;
const REFRESH_MS = 30000;

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

const haversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const earthRadius = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const projectCoordinate = (
  lat: number,
  lon: number,
  headingDeg: number,
  distanceKm: number
) => {
  const earthRadius = 6371;
  const angularDistance = distanceKm / earthRadius;
  const heading = degreesToRadians(headingDeg);
  const lat1 = degreesToRadians(lat);
  const lon1 = degreesToRadians(lon);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(heading)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(heading) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: radiansToDegrees(lat2),
    lon: ((radiansToDegrees(lon2) + 540) % 360) - 180,
  };
};

const findNearestAirport = (
  lat: number,
  lon: number,
  maxDistanceKm: number,
  excludeCode?: string
) => {
  const ranked = AIRPORTS.map((airport) => ({
    airport,
    distanceKm: haversineDistanceKm(lat, lon, airport.lat, airport.lon),
  }))
    .filter(({ airport, distanceKm }) => distanceKm <= maxDistanceKm && airport.code !== excludeCode)
    .sort((left, right) => left.distanceKm - right.distanceKm);

  return ranked[0]?.airport ?? null;
};

const estimateRoute = (
  lat: number,
  lon: number,
  headingDeg: number,
  altitudeFt: number,
  speedKts: number
) => {
  const searchRadius = altitudeFt < 6000 ? 120 : altitudeFt < 18000 ? 220 : 320;
  const departure = findNearestAirport(lat, lon, searchRadius);
  const projectionDistanceKm = Math.max(180, Math.min(speedKts * KM_PER_NAUTICAL_MILE * 1.4, 1400));
  const projected = projectCoordinate(lat, lon, headingDeg, projectionDistanceKm);
  let destination = findNearestAirport(projected.lat, projected.lon, 500, departure?.code);

  if (destination == null) {
    destination = findNearestAirport(lat, lon, 900, departure?.code);
  }

  const progressToDestination = destination
    ? Math.min(
        97,
        Math.max(
          8,
          Math.round(
            (haversineDistanceKm(departure?.lat ?? lat, departure?.lon ?? lon, lat, lon) /
              Math.max(
                haversineDistanceKm(departure?.lat ?? lat, departure?.lon ?? lon, destination.lat, destination.lon),
                1
              )) *
              100
          )
        )
      )
    : 50;

  return { departure, destination, progressToDestination };
};

const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);

const formatLastSeen = (seconds: number) =>
  seconds < 1 ? "live now" : `${Math.round(seconds)}s ago`;

const normalizeFlight = (aircraft: AirplanesLiveAircraft): FlightCardData | null => {
  if (
    aircraft.hex == null ||
    aircraft.flight == null ||
    aircraft.lat == null ||
    aircraft.lon == null ||
    aircraft.gs == null ||
    aircraft.track == null
  ) {
    return null;
  }

  const altitudeFt = typeof aircraft.alt_baro === "number" ? aircraft.alt_baro : 0;
  const route = estimateRoute(
    aircraft.lat,
    aircraft.lon,
    aircraft.track,
    altitudeFt,
    aircraft.gs
  );

  return {
    id: aircraft.hex,
    callsign: aircraft.flight.trim(),
    registration: aircraft.r ?? "Unknown tail",
    aircraftType: aircraft.t ?? "Unknown type",
    lat: aircraft.lat,
    lon: aircraft.lon,
    altitudeFt,
    speedKts: aircraft.gs,
    headingDeg: aircraft.track,
    verticalRateFpm: aircraft.baro_rate ?? 0,
    lastSeenSeconds: aircraft.seen ?? 0,
    departure: route.departure,
    destination: route.destination,
    progressToDestination: route.progressToDestination,
    source: "live",
  };
};

const demoFlights: FlightCardData[] = SAMPLE_FLIGHTS.map((flight) => ({
  ...flight,
  ...estimateRoute(flight.lat, flight.lon, flight.headingDeg, flight.altitudeFt, flight.speedKts),
}));

const Home: NextPage = () => {
  const [regionId, setRegionId] = useState<RegionId>("north-america");
  const [flights, setFlights] = useState<FlightCardData[]>(demoFlights);
  const [selectedFlightId, setSelectedFlightId] = useState<string>(demoFlights[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    "Trying to connect to the live air-traffic feed…"
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const selectedRegion = useMemo<Region>(
    () =>
      REGIONS.find((region) => region.id === regionId) ?? REGIONS[0] ?? REGIONS[1] ?? {
        id: "north-america",
        label: "North America",
        centerLat: 39.8283,
        centerLon: -98.5795,
        radius: 2200,
      },
    [regionId]
  );

  useEffect(() => {
    let isActive = true;

    const loadFlights = async () => {
      if (selectedRegion.id === "global-demo") {
        if (!isActive) {
          return;
        }

        setFlights(demoFlights);
        setSelectedFlightId((current) => current || demoFlights[0]?.id || "");
        setStatusMessage("Showing curated demo traffic from around the world.");
        setLastUpdatedAt(new Date());
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://api.airplanes.live/v2/point/${selectedRegion.centerLat}/${selectedRegion.centerLon}/${selectedRegion.radius}`
        );

        if (!response.ok) {
          throw new Error(`Feed returned ${response.status}`);
        }

        const payload = (await response.json()) as AirplanesLiveResponse;
        const normalized = (payload.aircraft ?? [])
          .map(normalizeFlight)
          .filter((flight): flight is FlightCardData => flight != null)
          .filter((flight) => flight.altitudeFt > 0 && flight.speedKts > 120)
          .sort((left, right) => right.altitudeFt - left.altitudeFt)
          .slice(0, 18);

        if (!normalized.length) {
          throw new Error("No active flights in range");
        }

        if (!isActive) {
          return;
        }

        setFlights(normalized);
        setSelectedFlightId((current) =>
          normalized.some((flight) => flight.id === current)
            ? current
            : normalized[0]?.id || ""
        );
        setStatusMessage(`Live feed active via Airplanes.live for ${selectedRegion.label}.`);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setFlights(demoFlights);
        setSelectedFlightId((current) => current || demoFlights[0]?.id || "");
        setStatusMessage(
          "Live feed is unavailable from this environment, so the app switched to realistic demo traffic."
        );
      } finally {
        if (isActive) {
          setLastUpdatedAt(new Date());
          setIsLoading(false);
        }
      }
    };

    void loadFlights();
    const interval = setInterval(() => {
      void loadFlights();
    }, REFRESH_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [refreshNonce, selectedRegion]);

  const filteredFlights = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return flights.filter((flight) => {
      if (!query) {
        return true;
      }

      return [
        flight.callsign,
        flight.registration,
        flight.aircraftType,
        flight.departure?.code,
        flight.destination?.code,
        flight.departure?.city,
        flight.destination?.city,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [flights, searchTerm]);

  const selectedFlight =
    filteredFlights.find((flight) => flight.id === selectedFlightId) ??
    filteredFlights[0] ??
    flights[0] ??
    demoFlights[0];

  const stats = useMemo(() => {
    const airborneFlights = filteredFlights.filter((flight) => flight.altitudeFt > 1000);
    const avgAltitude = airborneFlights.length
      ? airborneFlights.reduce((sum, flight) => sum + flight.altitudeFt, 0) / airborneFlights.length
      : 0;
    const avgSpeed = airborneFlights.length
      ? airborneFlights.reduce((sum, flight) => sum + flight.speedKts, 0) / airborneFlights.length
      : 0;

    return {
      tracked: filteredFlights.length,
      avgAltitude,
      avgSpeed,
      liveCount: filteredFlights.filter((flight) => flight.source === "live").length,
    };
  }, [filteredFlights]);

  return (
    <DefaultLayout>
      <main className="relative overflow-hidden px-4 pb-10 pt-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <section className="flight-panel grid gap-6 overflow-hidden p-6 lg:grid-cols-[1.3fr_0.9fr] lg:p-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-cyan-200">
                <FaBroadcastTower />
                Live aviation command deck
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Track real-time flights in a cinematic 3D radar experience.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  SkyVector 3D watches active aircraft, estimates where they lifted off from,
                  projects where they are headed next, and turns the feed into an immersive
                  flight-operations dashboard.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flight-card p-4">
                  <div className="flex items-center gap-3 text-cyan-200">
                    <FiActivity />
                    <span className="text-xs uppercase tracking-[0.3em]">Tracked flights</span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{stats.tracked}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {stats.liveCount > 0 ? `${stats.liveCount} live in the current view.` : "Demo traffic fallback active."}
                  </p>
                </div>
                <div className="flight-card p-4">
                  <div className="flex items-center gap-3 text-violet-200">
                    <FiCompass />
                    <span className="text-xs uppercase tracking-[0.3em]">Avg altitude</span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(stats.avgAltitude)} ft</p>
                  <p className="mt-2 text-sm text-slate-400">Pulled from the current radar scene.</p>
                </div>
                <div className="flight-card p-4">
                  <div className="flex items-center gap-3 text-emerald-200">
                    <FiNavigation />
                    <span className="text-xs uppercase tracking-[0.3em]">Avg groundspeed</span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(stats.avgSpeed)} kts</p>
                  <p className="mt-2 text-sm text-slate-400">Updated every {REFRESH_MS / 1000}s.</p>
                </div>
              </div>
            </div>

            <div className="flight-card relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Feed status</p>
                    <p className="mt-2 text-lg font-semibold text-white">{statusMessage}</p>
                  </div>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                    onClick={() => setRefreshNonce((current) => current + 1)}
                    type="button"
                    aria-label="Refresh indicator"
                  >
                    <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Radar region</span>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                      value={regionId}
                      onChange={(event) => setRegionId(event.target.value as RegionId)}
                    >
                      {REGIONS.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Search flight or airport</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                      placeholder="e.g. DAL214, JFK, A321"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </label>
                </div>

                <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <FiMapPin />
                    Estimated routing logic
                  </div>
                  <p className="mt-2 leading-6 text-slate-400">
                    This app uses live ADS-B positions when available, then estimates departure and
                    destination airports from the nearest major hubs plus current aircraft heading.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
            <div className="flight-panel p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">3D airspace</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Radar globe</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {lastUpdatedAt ? `Updated ${lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Refreshing…"}
                </div>
              </div>

              <div className="radar-stage">
                <div className="radar-globe">
                  <div className="radar-grid" />
                  {filteredFlights.map((flight, index) => {
                    const left = `${((flight.lon + 180) / 360) * 100}%`;
                    const top = `${((90 - flight.lat) / 180) * 100}%`;
                    const isSelected = selectedFlight?.id === flight.id;

                    return (
                      <button
                        key={flight.id}
                        type="button"
                        className={`radar-plane ${isSelected ? "selected" : ""}`}
                        style={{ left, top, animationDelay: `${index * 0.12}s` }}
                        onClick={() => setSelectedFlightId(flight.id)}
                      >
                        <span className="radar-plane__icon">
                          <FaPlane style={{ transform: `rotate(${flight.headingDeg - 45}deg)` }} />
                        </span>
                        <span className="radar-plane__label">{flight.callsign}</span>
                      </button>
                    );
                  })}
                  <div className="radar-scan" />
                </div>
              </div>
            </div>

            <aside className="flight-panel flex flex-col gap-4 p-4 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Selected flight</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedFlight?.callsign}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedFlight?.registration} · {selectedFlight?.aircraftType}
                </p>
              </div>

              {selectedFlight ? (
                <>
                  <div className="flight-card p-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Estimated route</span>
                      <span>{selectedFlight.progressToDestination}% complete</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">From</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{selectedFlight.departure?.code ?? "TBD"}</p>
                        <p className="text-sm text-slate-400">{selectedFlight.departure?.city ?? "Airborne region"}</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-px bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">To</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{selectedFlight.destination?.code ?? "TBD"}</p>
                        <p className="text-sm text-slate-400">{selectedFlight.destination?.city ?? "Projected destination"}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500"
                        style={{ width: `${selectedFlight.progressToDestination}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Altitude", value: `${formatNumber(selectedFlight.altitudeFt)} ft` },
                      { label: "Groundspeed", value: `${formatNumber(selectedFlight.speedKts)} kts` },
                      { label: "Heading", value: `${formatNumber(selectedFlight.headingDeg)}°` },
                      { label: "Vertical rate", value: `${formatNumber(selectedFlight.verticalRateFpm)} fpm` },
                      { label: "Latitude", value: selectedFlight.lat.toFixed(2) },
                      { label: "Longitude", value: selectedFlight.lon.toFixed(2) },
                    ].map((item) => (
                      <div key={item.label} className="flight-card p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                        <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flight-card p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-cyan-200">
                      <FiGlobe />
                      Position confidence
                    </div>
                    <p className="mt-2 leading-6 text-slate-400">
                      Last contact {formatLastSeen(selectedFlight.lastSeenSeconds)}. Route markers are inferred
                      from major airport proximity and current heading, so treat them as smart estimates rather than filed flight plans.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flight-card p-4 text-slate-400">No flights match your current search.</div>
              )}
            </aside>
          </section>

          <section className="flight-panel p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Traffic board</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Active flights</h2>
              </div>
              <div className="text-sm text-slate-400">
                Sorted by altitude and filtered for aircraft that are actively moving.
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {filteredFlights.map((flight) => {
                const isSelected = selectedFlight?.id === flight.id;
                return (
                  <button
                    key={flight.id}
                    type="button"
                    onClick={() => setSelectedFlightId(flight.id)}
                    className={`flight-card text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 ${
                      isSelected ? "border-cyan-400/40 shadow-[0_0_45px_rgba(34,211,238,0.16)]" : ""
                    } p-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{flight.callsign}</p>
                        <p className="text-sm text-slate-400">{flight.registration} · {flight.aircraftType}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        {flight.source}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">From</p>
                        <p className="mt-1">{flight.departure?.code ?? "TBD"} · {flight.departure?.city ?? "Airborne"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">To</p>
                        <p className="mt-1">{flight.destination?.code ?? "TBD"} · {flight.destination?.city ?? "Projected"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Altitude</p>
                        <p className="mt-1">{formatNumber(flight.altitudeFt)} ft</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Speed</p>
                        <p className="mt-1">{formatNumber(flight.speedKts)} kts</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </DefaultLayout>
  );
};

export default Home;
