"use client"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js"
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2"

// Registra i componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
)

interface ChartData {
  type: "line" | "bar" | "pie" | "doughnut" | "area"
  data: any[]
  config: {
    title?: string
    xKey?: string
    yKey?: string | string[]
    colors?: string[]
    width?: number
    height?: number
  }
}

interface ChartRendererProps {
  chartData: ChartData
}

const DEFAULT_COLORS = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
]

export function ChartRenderer({ chartData }: ChartRendererProps) {
  const { type, data, config } = chartData
  const colors = config.colors || DEFAULT_COLORS
  const height = config.height || 300

  // Prepara i dati per Chart.js
  const prepareChartData = () => {
    if (type === "pie" || type === "doughnut") {
      return {
        labels: data.map((item) => item[config.xKey || "name"]),
        datasets: [
          {
            data: data.map((item) => item[config.yKey || "value"]),
            backgroundColor: colors,
            borderColor: colors.map((color) => color),
            borderWidth: 1,
          },
        ],
      }
    }

    // Per grafici line, bar, area
    const labels = data.map((item) => item[config.xKey || "x"])

    if (Array.isArray(config.yKey)) {
      // Multiple datasets
      const datasets = config.yKey.map((key, index) => ({
        label: key,
        data: data.map((item) => item[key]),
        backgroundColor: type === "area" ? colors[index % colors.length] + "40" : colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        fill: type === "area",
        tension: type === "line" || type === "area" ? 0.4 : 0,
      }))

      return { labels, datasets }
    } else {
      // Single dataset
      return {
        labels,
        datasets: [
          {
            label: config.yKey || "Value",
            data: data.map((item) => item[config.yKey || "y"]),
            backgroundColor: type === "area" ? colors[0] + "40" : colors[0],
            borderColor: colors[0],
            borderWidth: 2,
            fill: type === "area",
            tension: type === "line" || type === "area" ? 0.4 : 0,
          },
        ],
      }
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "Raleway",
            size: 12,
          },
          color: "#374151",
        },
      },
      title: {
        display: !!config.title,
        text: config.title,
        font: {
          family: "Raleway",
          size: 16,
          weight: "normal" as const,
        },
        color: "#111827",
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#111827",
        bodyColor: "#374151",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: "Raleway",
          size: 12,
        },
        bodyFont: {
          family: "Raleway",
          size: 11,
        },
      },
    },
    scales:
      type === "pie" || type === "doughnut"
        ? {}
        : {
            x: {
              grid: {
                color: "#F3F4F6",
              },
              ticks: {
                font: {
                  family: "Raleway",
                  size: 11,
                },
                color: "#6B7280",
              },
            },
            y: {
              grid: {
                color: "#F3F4F6",
              },
              ticks: {
                font: {
                  family: "Raleway",
                  size: 11,
                },
                color: "#6B7280",
              },
            },
          },
  }

  const renderChart = () => {
    const chartData = prepareChartData()

    switch (type) {
      case "line":
      case "area":
        return <Line data={chartData} options={chartOptions} />
      case "bar":
        return <Bar data={chartData} options={chartOptions} />
      case "pie":
        return <Pie data={chartData} options={chartOptions} />
      case "doughnut":
        return <Doughnut data={chartData} options={chartOptions} />
      default:
        return <div className="text-red-500 text-center py-4">Tipo di grafico non supportato: {type}</div>
    }
  }

  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg border">
      <div style={{ height: `${height}px` }}>{renderChart()}</div>
    </div>
  )
}
