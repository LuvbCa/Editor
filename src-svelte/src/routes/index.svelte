<script lang="ts">
	import FileSideBar from '$lib/Sidebar.svelte';
	import Editor from '$lib/Editor.svelte';
	import Titlebar from '$lib/Titlebar.svelte';
	import Settings from '$lib/Settings.svelte';
	import { currentWorkingDirTree, currentWorkingDirTreeDeepestLayer } from '$lib/store';
	import Tabcontainer from '$lib/components/Tabcontainer.svelte';

	// $: console.log($currentWorkingDirTreeDeepestLayer);
	// $: console.log($currentWorkingDirTree);
</script>

<svelte:head>
	<title>Home</title>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Poppins:wght@100;300;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative max-h-full max-w-full" id="site-container">
	<div id="titlebar-container">
		<Titlebar />
	</div>
	<section id="">
		<FileSideBar />
	</section>
	<section>
		<div id="main-editor-tabs-container">
			<div>
				<Tabcontainer />
			</div>
			<div>
				<Editor />
			</div>
		</div>
	</section>
</div>

<style>
	#site-container {
		display: grid;
		grid-template-columns: min(40%, 320px) calc(100% - min(40%, 320px));
		grid-template-rows: 2em calc(100vh - 2em);
	}
	#titlebar-container {
		grid-column-start: 1;
		grid-column-end: 2;
	}
	section {
		grid-row: 2;
		height: auto;
		max-height: 100%;
	}
	#main-editor-tabs-container {
		max-height: 100%;
		display: grid;
		/* grid-template-columns: min(40%, 320px) calc(100% - min(40%, 320px)); */
		grid-template-rows: 2em calc(100% - 2em);
	}
	:global(body) {
		overflow: hidden;
	}
</style>
