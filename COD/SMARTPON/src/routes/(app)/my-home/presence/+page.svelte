<script lang="ts">
    import BannerUsersHome from "@components/banner-users-home.svelte";
    import UserCard from "@components/user-card.svelte";
    import type { MyHomeController } from "@controllers/my-home.controller.svelte";
    import { userStore } from "@services/user-profile";
    import { getContext, onMount } from "svelte";

    
    const controller = getContext("home-controller") as MyHomeController
    controller.updatePresence()
</script>



<div class="page-contents">
    <BannerUsersHome 
        present={controller.users_home}
        total={controller.users_total}
    />

    <div class="users">
        {#each controller.users_presence as user (user.id) }
            <UserCard 
                first_name={user.first_name}
                last_name={user.last_name}
                is_home={user.is_home}
                is_suspended={user.is_suspended}
                last_event={user.last_access_event}
            />
        {/each}
    </div>

    {#if userStore.isAdmin()}
        <div class="add-aligner">
            <a 
                class="add-user"
                href="/add-user"
            >
                Add user
            </a>
        </div>
    {/if}
</div>



<style>
    .page-contents {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 24px;
    }

    .users {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .add-aligner {
        display: flex;
        justify-content: center;
    }

    .add-user {
        color: var(--red-text);
        width: fit-content;
        text-decoration: underline;
    }
</style>