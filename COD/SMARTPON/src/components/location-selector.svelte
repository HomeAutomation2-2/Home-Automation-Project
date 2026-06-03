<script lang="ts">
    import Building from "./icons/building.svelte";
    import House from "./icons/house.svelte";

    let {
        location = $bindable(0)
    } : {
        location?: number
    } = $props()

    let showing_options = $state(false)

    function buttonAction(button: number)
    {
        console.log(button)

        if (button === location && !showing_options)
        {
            showing_options = true
        }
        else if (showing_options)
        {
            location = button
            showing_options = false
        }
    }
</script>



<div class="location-selector">
    <div 
        class="holder"
        class:active={!showing_options}
    >
        <button
            class:active={location === 0 && showing_options}
            class:hidden={!showing_options && location !== 0}
            onclick={ () => buttonAction(0) }
        >
            <House />
            <span>Home</span>
        </button>
        
        <button
            class:active={location === 1 && showing_options}
            class:hidden={!showing_options && location !== 1}
            onclick={ () => buttonAction(1) }
        >
            <Building />
            <span>Away</span>
        </button>
    </div>
    
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

    .holder {
        display: flex;
        flex-direction: row;
        flex: 1;
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
        transition: all 0.4s ease;

        &.hidden {
            flex: 0;
            width: 0;
            padding: 0;
            opacity: 0;
            pointer-events: none;
        }
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