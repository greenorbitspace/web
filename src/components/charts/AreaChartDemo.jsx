import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { year: 2018, co2: 400 },
  { year: 2019, co2: 420 },
  { year: 2020, co2: 390 },
  { year: 2021, co2: 370 },
  { year: 2022, co2: 360 },
];

export default function AreaChartDemo() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="co2" stroke="#2563eb" fill="#93c5fd" />
      </AreaChart>
    </ResponsiveContainer>
  );
}