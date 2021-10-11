<script lang="ts">
	import FileSideBar from '$lib/Sidebar.svelte';
	import Editor from '$lib/Editor.svelte';
	import Titlebar from '$lib/Titlebar.svelte';
	import Settings from '$lib/Settings.svelte';
	import { currentNavigator } from '$lib/store';

	currentNavigator;
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="relative max-h-full max-w-full">
	<div>
		<Titlebar />
	</div>
	<section>
		<FileSideBar />
	</section>
	<section>
		{#if $currentNavigator === 'editor'}
			<Editor />
		{:else if $currentNavigator === 'settings'}
			<Settings />
		{/if}
	</section>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: min(40%, 320px) calc(100% - min(40%, 320px));
		grid-template-rows: 2em calc(100vh - 2em);
	}
	div div {
		grid-column-start: 1;
		grid-column-end: 2;
	}
	section {
		grid-row: 2;
		height: auto;
		max-height: 100%;
	}
	:global(body) {
		overflow: hidden;
	}
</style>
