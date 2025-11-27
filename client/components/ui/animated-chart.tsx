import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Radar Chart Component
interface RadarChartProps {
  data: Array<{
    skill: string;
    value: number;
    color?: string;
  }>;
  size?: number;
  className?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 200,
  className,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const numPoints = data.length;

  const getPointCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle),
    };
  };

  const pathData = data
    .map((item, index) => {
      const point = getPointCoordinates(index, item.value);
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
          <motion.circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}

        {/* Grid lines */}
        {data.map((_, index) => {
          const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
          const endX = centerX + radius * Math.cos(angle);
          const endY = centerY + radius * Math.sin(angle);
          return (
            <motion.line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="currentColor"
              strokeWidth="1"
              opacity={0.1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          );
        })}

        {/* Data area */}
        <motion.path
          d={`${pathData} Z`}
          fill="url(#radarGradient)"
          fillOpacity={0.3}
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Data points */}
        {data.map((item, index) => {
          const point = getPointCoordinates(index, item.value);
          return (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={item.color || "currentColor"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            />
          );
        })}

        {/* Labels */}
        {data.map((item, index) => {
          const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
          const labelRadius = radius + 20;
          const labelX = centerX + labelRadius * Math.cos(angle);
          const labelY = centerY + labelRadius * Math.sin(angle);
          return (
            <motion.text
              key={index}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-current"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              {item.skill}
            </motion.text>
          );
        })}

        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Circular Progress Chart
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  color = "hsl(var(--primary))",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const offset = circumference - progress;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="text-2xl font-bold">{Math.round(value)}%</span>
        </motion.div>
      )}
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  maxValue?: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  className,
  orientation = "vertical",
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className={cn("flex gap-2", orientation === "horizontal" ? "flex-col" : "flex-row items-end", className)}>
      {data.map((item, index) => {
        const height = (item.value / max) * 100;
        return (
          <motion.div
            key={item.label}
            className={cn(
              "flex flex-col items-center gap-1",
              orientation === "horizontal" ? "flex-row" : "flex-col"
            )}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <motion.div
              className={cn(
                "rounded-t-sm",
                orientation === "horizontal" ? "h-4" : "w-8",
                item.color || "bg-primary"
              )}
              style={{
                [orientation === "horizontal" ? "width" : "height"]: `${height}%`,
              }}
              initial={{ [orientation === "horizontal" ? "width" : "height"]: 0 }}
              animate={{ [orientation === "horizontal" ? "width" : "height"]: `${height}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
            />
            <span className="text-xs text-muted-foreground text-center">
              {item.label}
            </span>
            <span className="text-xs font-medium">
              {item.value}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

// Line Chart Component
interface LineChartProps {
  data: Array<{
    x: number | string;
    y: number;
  }>;
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 300,
  height = 150,
  className,
  color = "hsl(var(--primary))",
}) => {
  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const range = maxY - minY;

  const getPoint = (point: { x: number | string; y: number }, index: number) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.y - minY) / range) * height;
    return { x, y };
  };

  const pathData = data
    .map((point, index) => {
      const { x, y } = getPoint(point, index);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className={cn("relative", className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <motion.line
            key={index}
            x1={0}
            y1={height * ratio}
            x2={width}
            y2={height * ratio}
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}

        {/* Line path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data points */}
        {data.map((point, index) => {
          const { x, y } = getPoint(point, index);
          return (
            <motion.circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            />
          );
        })}
      </svg>
    </div>
  );
};
