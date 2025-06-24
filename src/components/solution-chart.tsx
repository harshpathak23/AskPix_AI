'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { GraphData } from '@/ai/schemas';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';


interface SolutionChartProps {
  chartData: GraphData;
}

export function SolutionChart({ chartData }: SolutionChartProps) {
  const chartConfig = {
    value: {
      label: chartData.yAxisLabel,
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{chartData.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData.data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                >
                  <Label value={chartData.xAxisLabel} offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                >
                  <Label value={chartData.yAxisLabel} angle={-90} position="insideLeft" />
                </YAxis>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
