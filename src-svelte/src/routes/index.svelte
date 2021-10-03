<script lang="ts">
	import FileSideBar from '$lib/Sidebar.svelte';
	import Editor from '$lib/Editor.svelte';
	import Titlebar from '$lib/Titlebar.svelte';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="relative h-full w-full">
	<div>
		<Titlebar />
	</div>
	<section>
		<FileSideBar />
	</section>
	<section>
		<Editor />
	</section>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: min(40%, 320px) auto;
		grid-template-rows: 2em auto;
	}
	div div {
		grid-column-start: 1;
		grid-column-end: 2;
	}
	section {
		grid-row: 2;
	}
	:global(body) {
		overflow: hidden;
	}
</style>
