<script>
    import Dashboard from "./icons/dashboard.svelte";
    import DoorOpen from "./icons/door-open.svelte";
    import House from "./icons/house.svelte";

</script>



<div class="navbar">
    <a href="/dashboard">
        <Dashboard />
        <span>Dash</span>
    </a>

    <a href="/access">
        <DoorOpen />
        <span>Dash</span>
    </a>

    <a href="/my-home/presence">
        <House />
        <span>My Home</span>
    </a>
</div>



<style>
    .navbar {
        display: flex;
        flex-direction: row;
        padding: 0 24px;
        padding-bottom: calc(env(safe-area-inset-top));
        background-color: var(--raised);
    }

    a {
        cursor: pointer;
        flex: 1;
        padding: 12px 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;

        & span {
            font-size: 0.85rem;
        }
    }
</style>