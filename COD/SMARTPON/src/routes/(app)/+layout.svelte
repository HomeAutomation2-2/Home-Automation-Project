<script lang="ts">
    import Navbar from '@components/navbar.svelte';


	let { children } = $props()
</script>



<div class="body">
	<div class="base-content">
		{@render children()}
	</div>

	<Navbar />
</div>



<style>
	.body {
        display: flex;
        flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
    }

	.base-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}
</style>