<script lang="ts">
    let {
        total = 0,
        present = 0
    } : {
        total?: number
        present?: number
    } = $props()
</script>



<div class="users-home">
    <span class="text">Users home</span>

    <div class="presence">
        <span class="present">{present}</span>
        <span class="total">/{total}</span>
    </div>
</div>



<style>
    .users-home {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 0 8px;
        gap: 16px;
    }

    .text {
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--text-secondary);
        align-content: center;
    }

    .presence {
        display: flex;
        flex-direction: row;
        justify-content: baseline;
        font-weight: 500;
    }

    .present {
        font-size: 2rem;
    }

    .total {
        color: var(--text-secondary);
        font-size: 1.5rem;
        align-content: end;
    }

    .text {
        flex: 1;
    }
</style>