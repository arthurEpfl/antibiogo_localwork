<template>
    <div class="contents">
      <ContentCard>
        <template #title>PCA Visualization</template>
        <template #content>
          <div class="flex flex-col items-center gap-8">
            <CustomButton @click="fetchPCA">Load PCA</CustomButton>
  
            <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
              <!-- Current Model PCA -->
              <div class="canvas-container">
                <h3 class="text-center font-semibold">Current Model</h3>
                <canvas ref="pcaChartCurrent" v-if="pcaDataCurrent.length"></canvas>
              </div>
  
              <!-- Aggregated Model PCA -->
              <div class="canvas-container">
                <h3 class="text-center font-semibold">Aggregated Model</h3>
                <canvas ref="pcaChartAggregated" v-if="pcaDataAggregated.length"></canvas>
              </div>
            </div>
          </div>
        </template>
      </ContentCard>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import Chart from "chart.js/auto";
  import { useSettingsStore } from "@/stores/settings";
  import ContentCard from "@/components/ContentCard.vue";
  import CustomButton from "@/components/button/CustomButton.vue";
  import notify from '@/notify'

  
  const settingsStore = useSettingsStore();
  const pcaDataCurrent = ref<{ x: number; y: number; label: string; radius: number }[]>([]);
  const pcaDataAggregated = ref<{ x: number; y: number; label: string; radius: number }[]>([]);
  const pcaChartCurrent = ref<HTMLCanvasElement | null>(null);
  const pcaChartAggregated = ref<HTMLCanvasElement | null>(null);
  
  async function fetchPCA(): Promise<void> {
    try {
      const response = await axios.get(new URL("antibiogo/pca", settingsStore.serverEndpoint).href);
      if (response.status === 200) {
        notify.success('PCA successful')
        const { 
          current_pca_result, aggregated_pca_result, 
          current_labels, aggregated_labels, 
          current_radii, aggregated_radii 
        } = response.data;
  
        // Store PCA results separately with correct labels & radii
        pcaDataCurrent.value = current_pca_result.map(([x, y], index) => ({
          x,
          y,
          label: current_labels[index] || `Centroid ${index}`,
          radius: current_radii[index] || 5,
        }));
  
        pcaDataAggregated.value = aggregated_pca_result.map(([x, y], index) => ({
          x,
          y,
          label: aggregated_labels[index] || `Centroid ${index}`,
          radius: aggregated_radii[index] || 5,
        }));
  
        renderChart(pcaChartCurrent.value, pcaDataCurrent.value, "blue");
        renderChart(pcaChartAggregated.value, pcaDataAggregated.value, "red");
      } else {
        console.error("Error fetching PCA data:", response);
        notify.error('Error fetching PCA data, this can happen if buffer empty')
      }
    } catch (error) {
      console.error("Error fetching PCA:", error);
    }
  }
  
  function renderChart(
    canvas: HTMLCanvasElement | null, 
    pcaData: { x: number; y: number; label: string; radius: number }[], 
    color: string
  ): void {
    if (!pcaData.length || !canvas) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    const chart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: color === "blue" ? "Current Model" : "Aggregated Model",
            data: pcaData.map(({ x, y }) => ({ x, y })),
            backgroundColor: color,
            pointRadius: 5, // Regular centroid points
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: "linear", position: "bottom" },
          y: { type: "linear" },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem: any) {
                const dataPoint = pcaData[tooltipItem.dataIndex];
                return `(${dataPoint.x.toFixed(2)}, ${dataPoint.y.toFixed(2)}) - ${dataPoint.label}`;
              },
            },
          },
        },
        animation: {
          onComplete: () => {
            drawCircles(chart, pcaData, color);
          },
        },
      },
    });
  }
  
  function drawCircles(
    chartInstance: Chart, 
    pcaData: { x: number; y: number; radius: number }[], 
    color: string
  ): void {
    if (!chartInstance) return;
  
    const ctx = chartInstance.ctx;
    ctx.save();
    ctx.strokeStyle = color === "blue" ? "rgba(0, 0, 255, 0.5)" : "rgba(255, 0, 0, 0.5)"; // Blue for current, Red for aggregated
    ctx.lineWidth = 1;
  
    const xScale = chartInstance.scales.x;
    const yScale = chartInstance.scales.y;
  
    pcaData.forEach(({ x, y, radius }) => {
      const xPixel = xScale.getPixelForValue(x);
      const yPixel = yScale.getPixelForValue(y);
  
      // Scale radius to prevent oversized circles
      const scaledRadius = radius * (xScale.width / 70);
  
      ctx.beginPath();
      ctx.arc(xPixel, yPixel, scaledRadius, 0, 2 * Math.PI);
      ctx.stroke();
    });
  
    ctx.restore();
  }
  
  onMounted(fetchPCA);
  </script>
  
  <style scoped>
  .canvas-container {
    width: 600px; /* Set a fixed width */
    height: 400px; /* Set a fixed height */
    max-width: 100%;
  }
  
  canvas {
    width: 100% !important;
    height: 100% !important;
    max-width: 600px;
    max-height: 400px;
  }
  </style>
  