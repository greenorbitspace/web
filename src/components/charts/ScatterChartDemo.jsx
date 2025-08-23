import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { x: 10, y: 30 },
  { x: 20, y: 50 },
  { x: 30, y: 40 },
  { x: 40, y: 80 },
  { x: 50, y: 70 },
];

export default function ScatterChartDemo() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <XAxis type="number" dataKey="x" />
        <YAxis type="number" dataKey="y" />
        <Tooltip />
        <Scatter data={data} fill="#8b5cf6" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}