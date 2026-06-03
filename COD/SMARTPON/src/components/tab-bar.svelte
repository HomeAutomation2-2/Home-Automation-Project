<script lang="ts">
    import { page } from '$app/stores'

    type Tab = {
        label: string;
        href: string;
    };

    let { tabs } : { tabs: Tab[] } = $props()

    const active_tab = $derived(tabs.find(t => t.href === $page.url.pathname)?.href ?? tabs[0].href)
</script>



<div class="tab-bar">
    {#each tabs as tab (tab.label)}
        <a 
            href={tab.href}
            class:active={active_tab === tab.href}
        >{tab.label}</a>
    {/each}

    <div class="indicator"></div>
</div>



<style>
    .tab-bar {
        display: flex;
        flex-direction: row;
        position: relative;
        padding: 0 8px;
        flex: 1;
        border-bottom: 1px solid var(--dividers);
    }

    a {
        flex: 1;
        text-align: center;
        padding: 12px 16px;
        text-decoration: none;
        color: var(--text);
        font-weight: 500;
    }

    a.active {
        anchor-name: --active;
    }

    .indicator {
        height: 2px;
        border-radius: 4px 4px 0 0;
        background-color: var(--text);

        position: absolute;
        position-anchor: --active;
        bottom: anchor(bottom);
        left: anchor(left);
        right: anchor(right);
        transition: all 0.2s ease;
        will-change: left, right; /* remove motion artefacts by promote the element to its own layer before the transition starts, 
                                     so it composites cleanly without touching the pixels behind it. */
    }
</style>