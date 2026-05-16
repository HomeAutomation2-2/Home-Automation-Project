<script lang="ts">
    import Building from "./icons/building.svelte";
    import House from "./icons/house.svelte";
    import SquareArrowRightEnter from "./icons/square-arrow-right-enter.svelte";
    import SquareArrowRightExit from "./icons/square-arrow-right-exit.svelte";

    let {
        direction = $bindable(0)
    } : {
        direction?: number
    } = $props()
</script>



<div class="location-selector">
    <button
        class:active={direction === 0}
        onclick={ () => direction = 0 }
    >
        <SquareArrowRightEnter />
        <span>Coming</span>
    </button>
    
    <button
        class:active={direction === 1}
        onclick={ () => direction = 1 }
    >
        <SquareArrowRightExit />
        <span>Leaving</span>
    </button>
    
    <div class="indicator"></div>
</div>



<style>
    .active {
        anchor-name: --active;
    }

    .location-selector {
        position: relative;
        padding: 8px;
        border-radius: 200px;
        display: flex;
        flex-direction: row;
        background-color: var(--raised);
        justify-content: space-between;
        z-index: 0;  /* create a new stacking context */
    }

    button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px 24px;
        position: relative;
        flex: 1;
        z-index: 2;
    }

    span {
        font-size: 0.8rem;
    }

    .indicator {
        background-color: var(--primary-background);
        border-radius: 200px;
        z-index: 1;

        position: absolute;
        position-anchor: --active;
        top: anchor(top);
        bottom: anchor(bottom);
        left: anchor(left);
        right: anchor(right);
        transition: all 0.1s ease;
        will-change: left, right;
    }
</style>