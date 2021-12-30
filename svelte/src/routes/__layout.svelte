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
	{#if !window['isElectron']}
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

<svelte:head>
	<title>Home</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Poppins:wght@100;300;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

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
