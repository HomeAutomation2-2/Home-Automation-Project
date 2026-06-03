<script lang="ts">
    let {
        user_id,
        first_name = "John",
        last_name = "Doe",
        is_suspended = false,
        is_home = false,
        last_event,
        is_you,
        clickable = false,
    } : {
        user_id: number
        first_name?: string
        last_name?: string
        is_suspended?: boolean
        is_home?: boolean
        last_event?: string,
        is_you?: boolean,
        clickable?: boolean
    } = $props()

    let initials = $derived((first_name?.[0] + last_name?.[0]).toUpperCase())
</script>


{#if clickable}
    <a 
        class="user-card"
        href={`/manage-user/${user_id}`}
    >
        <span class="avatar">{initials}</span>

        <div class="info">
            <span class="name">{first_name} {last_name}{is_you ? " (You)" : ""}</span>
            {#if !is_suspended}
                <span class="last-event">{last_event}</span>
            {:else}
                <span class="last-event">Account suspended</span>
            {/if}
        </div>

        <div 
            class="status"
            class:suspended={is_suspended}
            class:home={is_home}
            class:away={is_home === false}
        >
            <div class="dot"></div>
            <span class="location">{is_suspended ? "-" : is_home ? "Home" : "Away"}</span>
        </div>
    </a>
{:else}
    <div class="user-card">
        <span class="avatar">{initials}</span>

        <div class="info">
            <span class="name">{first_name} {last_name}{is_you ? " (You)" : ""}</span>
            {#if !is_suspended}
                <span class="last-event">{last_event}</span>
            {:else}
                <span class="last-event">Account suspended</span>
            {/if}
        </div>

        <div 
            class="status"
            class:suspended={is_suspended}
            class:home={is_home}
            class:away={is_home === false}
        >
            <div class="dot"></div>
            <span class="location">{is_suspended ? "-" : is_home ? "Home" : "Away"}</span>
        </div>
    </div>
{/if}



<style>
    .user-card {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 12px;
        gap: 8px;
        border-radius: 16px;
        border: 1px solid var(--raised-border);
        background-color: var(--raised);
        align-self: stretch;
    }

    .avatar {
        aspect-ratio: 1;
        border-radius: 100%;
        width: 48px;
        text-align: center;
        align-content: center;
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--text-inverted);
        background-color: var(--green-background);
    }

    .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        padding-left: 8px;
        flex: 1;

        & .last-event {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
    }

    .status {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 4px;
        gap: 8px;

        & .dot {
            width: 6px;
            aspect-ratio: 1;
            border-radius: 100%;
        }
        
        &.home {
            color: var(--green-text);
            
            & .dot {
                background-color: var(--green-background);
            }
        }

        &.away {
            color: var(--text-secondary);
            
            & .dot {
                background-color: var(--text-secondary);
            }
        }

        &.suspended {
            color: var(--red-text);
            
            & .dot {
                background-color: var(--red-background);
            }
        }
    }
</style>