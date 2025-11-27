import { BarChart, LineChart } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Placeholder for the actual data structure
interface AnalyticsData {
  name: string;
  value: number;
  date: string;
}

interface ChartProps {
  title: string;
  data: AnalyticsData[];
  dataKey: string;
  index: string;
  categories: string[];
}

export function LineChartComponent({
  title,
  data,
  dataKey,
  index,
  categories,
}: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          index={index}
          categories={categories}
          valueFormatter={(number) =>
            `$${Intl.NumberFormat("us").format(number).toString()}`
          }
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}

export function BarChartComponent({
  title,
  data,
  dataKey,
  index,
  categories,
}: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={data}
          index={index}
          categories={categories}
          valueFormatter={(number) =>
            `$${Intl.NumberFormat("us").format(number).toString()}`
          }
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}
