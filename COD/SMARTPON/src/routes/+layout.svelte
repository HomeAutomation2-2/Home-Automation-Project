<script lang="ts">
	let { children } = $props();
</script>



<div class="body">
	<div class="content">
		{@render children()}
	</div>
</div>



<style>
	.body {
        display: flex;
        flex-direction: column;
		width: 100%;
		height: 100%;
    }

	.content {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
</style>