<script lang="ts">
	import type { FolderIcon as Icon } from 'svelte-feather-icons';

	//use FolderIcon for typing
	export let icon: typeof Icon;
	export let size: 12 | 9 = 12;
	//no-drag webkit
	export let noDrag = true;
	export let bgColorHover: string = '';
</script>

<div on:click class:noDrag>
	<svelte:component
		this={icon}
		class="p-2 hover:scale-110 transition text-white {size == 9 ? 'h-9 w-9' : 'w-12 h-12'}"
	/>
</div>

<style>
	.noDrag {
		-webkit-app-region: no-drag;
	}
</style>
