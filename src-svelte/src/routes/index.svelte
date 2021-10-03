<script lang="ts">
	import FileSideBar from '$lib/Sidebar.svelte';
	import Editor from '$lib/Editor.svelte';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section class="relative h-full w-full">
	<FileSideBar />
	<Editor />
</section>

<style>
	section {
		display: grid;
		grid-template-columns: min(20%, 250px) auto;
	}
	:global(body) {
		overflow: hidden;
	}
</style>
