<script lang="ts">
    import EntryLog from "@components/entry-log.svelte";
    import type { MyHomeController } from "@controllers/my-home.controller.svelte";
    import { getContext } from "svelte";

    
    const controller = getContext("home-controller") as MyHomeController
    controller.updateLogs()
</script>



<div class="page-contents">
    {#each controller.logs as log (log.id) }
        <EntryLog 
            type={log.type}
            message={log.message}
        />
    {/each}
</div>



<style>
    .page-contents {
        display: flex;
        flex-direction: column;
        padding: 16px;
    }
</style>