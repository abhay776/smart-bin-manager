import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryChartProps {
  data: Record<string, number>;
}

const COLORS = [
  "hsl(199, 89%, 48%)", // bin-partial
  "hsl(142, 71%, 45%)", // success
  "hsl(38, 92%, 50%)",  // warning/accent
  "hsl(215, 28%, 17%)", // primary
  "hsl(0, 84%, 60%)",   // destructive
  "hsl(270, 60%, 60%)", // purple
  "hsl(180, 70%, 45%)", // teal
  "hsl(330, 70%, 50%)", // pink
];

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              className="stroke-background stroke-2"
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number) => [`${value} units`, "Quantity"]}
        />
        <Legend 
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: 20 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
