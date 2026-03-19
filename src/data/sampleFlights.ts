export interface SampleFlight {
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
  source: "demo";
}

export const SAMPLE_FLIGHTS: SampleFlight[] = [
  { id: "a18f5d", callsign: "DAL214", registration: "N394DN", aircraftType: "A321", lat: 33.98, lon: -96.88, altitudeFt: 34200, speedKts: 452, headingDeg: 84, verticalRateFpm: 0, lastSeenSeconds: 5, source: "demo" },
  { id: "a4d2c1", callsign: "UAL907", registration: "N27957", aircraftType: "B789", lat: 41.12, lon: -67.2, altitudeFt: 37100, speedKts: 489, headingDeg: 71, verticalRateFpm: 64, lastSeenSeconds: 7, source: "demo" },
  { id: "c02fa2", callsign: "AAL118", registration: "N816AN", aircraftType: "B77W", lat: 52.01, lon: -24.4, altitudeFt: 36000, speedKts: 503, headingDeg: 93, verticalRateFpm: 0, lastSeenSeconds: 3, source: "demo" },
  { id: "406a2d", callsign: "BAW117", registration: "G-STBN", aircraftType: "B77W", lat: 54.65, lon: -41.85, altitudeFt: 35200, speedKts: 495, headingDeg: 268, verticalRateFpm: -128, lastSeenSeconds: 9, source: "demo" },
  { id: "71c381", callsign: "KAL927", registration: "HL8038", aircraftType: "B77W", lat: 44.98, lon: 156.31, altitudeFt: 34050, speedKts: 476, headingDeg: 102, verticalRateFpm: 0, lastSeenSeconds: 6, source: "demo" },
  { id: "7c4ee8", callsign: "QFA11", registration: "VH-ZNG", aircraftType: "A388", lat: -15.12, lon: 130.42, altitudeFt: 38800, speedKts: 512, headingDeg: 312, verticalRateFpm: 0, lastSeenSeconds: 8, source: "demo" },
  { id: "89617c", callsign: "UAE203", registration: "A6-EGD", aircraftType: "B77W", lat: 52.84, lon: 32.9, altitudeFt: 35000, speedKts: 474, headingDeg: 302, verticalRateFpm: 0, lastSeenSeconds: 4, source: "demo" },
  { id: "e8027a", callsign: "LAN804", registration: "CC-BGG", aircraftType: "B789", lat: -12.9, lon: -54.12, altitudeFt: 39900, speedKts: 492, headingDeg: 191, verticalRateFpm: -64, lastSeenSeconds: 10, source: "demo" },
  { id: "3c5ee2", callsign: "DLH492", registration: "D-AGWN", aircraftType: "A319", lat: 47.88, lon: 11.67, altitudeFt: 11800, speedKts: 245, headingDeg: 180, verticalRateFpm: -1200, lastSeenSeconds: 2, source: "demo" },
  { id: "a0ec2f", callsign: "FFT890", registration: "N936FR", aircraftType: "A20N", lat: 36.01, lon: -115.08, altitudeFt: 4200, speedKts: 168, headingDeg: 242, verticalRateFpm: -900, lastSeenSeconds: 5, source: "demo" },
];
