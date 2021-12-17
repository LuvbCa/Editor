<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import Loading from '$lib/Loading.svelte';
	import Titlebar from '$lib/Titlebar.svelte';
	import { fade } from 'svelte/transition';

	let loading = true;

	onMount(async () => {
		await window.loading.waitInitial;
		loading = false;
	});
</script>

<main class="relative select-text bg-gray-900">
	{#if window['isElectron']}
		<Titlebar />
		{#if loading}
			<div out:fade>
				<Loading />
			</div>
		{:else}
			<slot />
		{/if}
	{:else}
		<div class="text-white">
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
