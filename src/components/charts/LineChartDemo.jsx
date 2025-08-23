import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", emissions: 40 },
  { month: "Feb", emissions: 30 },
  { month: "Mar", emissions: 20 },
  { month: "Apr", emissions: 27 },
  { month: "May", emissions: 18 },
  { month: "Jun", emissions: 23 },
];

export default function LineChartDemo() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="emissions" stroke="#10b981" />
      </LineChart>
    </ResponsiveContainer>
  );
}