// Shared dataset for all visualisation components
export const sustainabilityData = {
  emissions: [
    { year: 2015, value: 42 },
    { year: 2020, value: 38 },
    { year: 2025, value: 29 },
  ],
  launches: [
    { year: 2015, value: 86 },
    { year: 2020, value: 114 },
    { year: 2025, value: 180 },
  ],
  satellites: [
    { year: 2015, value: 1200 },
    { year: 2020, value: 3300 },
    { year: 2025, value: 8300 },
  ],
  sdgBreakdown: [
    { goal: "SDG 7", progress: 0.65 },
    { goal: "SDG 9", progress: 0.55 },
    { goal: "SDG 13", progress: 0.72 },
  ],
  regions: [
    { region: "Europe", emissions: 12, launches: 45 },
    { region: "North America", emissions: 18, launches: 70 },
    { region: "Asia", emissions: 25, launches: 55 },
  ],
};