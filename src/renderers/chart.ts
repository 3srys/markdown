import type { Chart as ChartType, ChartConfiguration } from 'chart.js';

let chartModule: typeof import('chart.js/auto') | null = null;
const activeCharts = new WeakMap<HTMLCanvasElement, ChartType>();

const VALID_CHART_TYPES = new Set([
  'line',
  'bar',
  'pie',
  'doughnut',
  'radar',
  'polarArea',
  'scatter',
  'bubble',
]);

async function getChartJs() {
  if (!chartModule) {
    chartModule = await import('chart.js/auto');
  }
  return chartModule.default || chartModule.Chart;
}

export async function renderCharts(container: HTMLElement, isDark: boolean): Promise<void> {
  const chartContainers = container.querySelectorAll<HTMLElement>('.chart-container:not([data-rendered="true"])');
  if (chartContainers.length === 0) return;

  try {
    const Chart = await getChartJs();

    chartContainers.forEach((wrapper) => {
      const rawEl = wrapper.querySelector<HTMLElement>('.chart-raw');
      const rawConfig = (rawEl ? rawEl.textContent : null) || wrapper.getAttribute('data-chart') || '';
      const canvas = wrapper.querySelector('canvas');
      if (!canvas) return;

      // Clean up any existing chart instance on this canvas
      const existing = activeCharts.get(canvas);
      if (existing) {
        existing.destroy();
        activeCharts.delete(canvas);
      }

      try {
        const parsed = JSON.parse(rawConfig);

        // Validate type
        const type = parsed.type;
        if (!type || !VALID_CHART_TYPES.has(type)) {
          throw new Error(
            `Unsupported chart type "${type}". Supported types: ${Array.from(VALID_CHART_TYPES).join(', ')}`
          );
        }

        const textColor = isDark ? '#cbd5e1' : '#475569';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

        // Deep merge theme options safely
        const chartConfig: ChartConfiguration = {
          type: parsed.type,
          data: parsed.data || {
            labels: parsed.labels || [],
            datasets: parsed.datasets || [],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            color: textColor,
            ...parsed.options,
            plugins: {
              legend: {
                labels: { color: textColor },
              },
              ...parsed.options?.plugins,
            },
            scales: parsed.options?.scales
              ? Object.entries(parsed.options.scales).reduce((acc: any, [key, scale]: [string, any]) => {
                  acc[key] = {
                    ...scale,
                    ticks: { color: textColor, ...scale?.ticks },
                    grid: { color: gridColor, ...scale?.grid },
                  };
                  return acc;
                }, {})
              : undefined,
          },
        };

        const chart = new Chart(canvas, chartConfig);
        activeCharts.set(canvas, chart);
        wrapper.dataset.rendered = 'true';
        canvas.style.display = 'block';
        const loader = wrapper.querySelector('.chart-loading');
        if (loader) loader.remove();
      } catch (err: any) {
        wrapper.innerHTML = `
          <div class="render-error">
            <div class="render-error-title">Chart Error</div>
            <div class="render-error-message">${err.message || 'Invalid JSON chart configuration'}</div>
          </div>
        `;
        wrapper.dataset.rendered = 'true';
      }
    });
  } catch (err) {
    console.error('Failed to load Chart.js:', err);
    chartContainers.forEach((wrapper) => {
      wrapper.innerHTML = `
        <div class="render-error">
          <div class="render-error-title">Chart Module Error</div>
          <div class="render-error-message">${(err as any)?.message || 'Failed to initialize Chart.js'}</div>
        </div>
      `;
      wrapper.dataset.rendered = 'true';
    });
  }
}

