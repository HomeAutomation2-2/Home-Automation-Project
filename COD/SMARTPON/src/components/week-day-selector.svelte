<script lang="ts">
    let {
        grup = $bindable([1]),
        onDaySelect
    } : {
        grup?: number[]
        onDaySelect?: (id: number) => void
    } = $props()

    const days = [
        {id: 0, name: "Su"},
        {id: 1, name: "Mo"},
        {id: 2, name: "Tu"},
        {id: 3, name: "We"},
        {id: 4, name: "Th"},
        {id: 5, name: "Fr"},
        {id: 6, name: "Sa"}
    ]

    console.log(grup)
</script>



<div class="week-day-selector">
    {#each days as day (day.id)}
        <button 
            class="day-selector"
            class:selected={ grup.includes(day.id) }
            onclick={ () => onDaySelect?.(day.id) }
        >
            <span>{day.name}</span>
        </button>
    {/each}
</div>




<style>
    .week-day-selector {
        display: flex;
        flex-direction: row;
        gap: 4px;
        padding: 0 8px;
        align-self: stretch;
    }

    .day-selector {
        width: 32px;
        aspect-ratio: 1;
        display: flex;
        justify-content: center;
        align-items: center;

        border-radius: 100%;
        border: 1px solid var(--text);

        &.selected {
            background-color: var(--text-primary);
            color: var(--text-inverted);
            border-color: var(--text-primary);
        }
    }
</style>