<script lang="ts">
    import { Line } from 'svelte-chartjs'
    import {
        Chart,
        LineElement,
        PointElement,
        LinearScale,
        TimeScale,
        Tooltip,
        Filler,
    } from 'chart.js'
    import 'chartjs-adapter-luxon'

    Chart.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler)

    let {
        room_name,
        readings,
    }: {
        room_name: string
        readings: { value: number; occuredAt: string }[]
    } = $props()

    let data = $derived({
        datasets: [{
            label: room_name,
            data: readings.map(r => ({ x: r.occuredAt, y: r.value })),
            borderColor: '#4f8ef7',
            backgroundColor: 'rgba(79, 142, 247, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
        }]
    })

    const options = {
        responsive: true,
        scales: {
            x: {
                type: 'time' as const,
                time: { unit: 'hour' as const },
                ticks: { maxTicksLimit: 8 },
            },
            y: {
                title: { display: true, text: '°C' },
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (ctx: any) => `${ctx.parsed.y.toFixed(1)}°C`
                }
            }
        }
    }
</script>

<div class="chart-wrapper">
    <h3>{room_name}</h3>
    <Line {data} {options} />
</div>

<style>
    .chart-wrapper {
        width: 100%;
        margin-bottom: 2rem;
    }
    h3 {
        margin-bottom: 0.5rem;
    }
</style>