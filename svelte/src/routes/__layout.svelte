<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
</script>

<main class="relative select-text">
	{#if window['isElectron']}
		<slot />
	{:else}
		<div>
			please Open this page or file in the appropiate Electron Wrapper!
			<p class="text-red-600">ERROR 0x01</p>
		</div>
	{/if}
</main>

<style>
	main {
		min-height: 100%;
		width: 100%;
	}
	:global(body) {
		min-height: 100%;
		width: 100%;

		font-family: Poppins;
	}
</style>
