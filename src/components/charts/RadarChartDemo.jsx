import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const data = [
  { factor: "Energy", score: 120 },
  { factor: "Water", score: 98 },
  { factor: "Waste", score: 86 },
  { factor: "Transport", score: 99 },
  { factor: "Materials", score: 85 },
];

export default function RadarChartDemo() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="factor" />
        <PolarRadiusAxis />
        <Radar name="Sustainability" dataKey="score" stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}