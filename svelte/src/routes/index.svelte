<script lang="ts">
	import FileSideBar from '$lib/Sidebar.svelte';
	import Editor from '$lib/Editor.svelte';
	import Titlebar from '$lib/Titlebar.svelte';
	import Settings from '$lib/Settings.svelte';
	import {
		currentSidebarNavigator,
		currentFile,
		currentWorkingDir,
		currentWorkingDirTree,
		currentWorkingDirTreeDeepestLayer
	} from '$lib/store';
	import Tabcontainer from '$lib/components/Tabcontainer.svelte';
	import { onMount } from 'svelte';

	const logStores = (...inputs: any[]) => {
		console.log('--- STORE UPDATE ---');
		for (const input of inputs) {
			console.log(input);
		}
		console.log('--- STORE UPDATE FINSHED ---');
	};

	// $: logStores(
	// 	$currentWorkingDirTreeDeepestLayer,
	// 	$currentWorkingDirTree,
	// 	$currentWorkingDir,
	// 	$currentFile,
	// 	$currentSidebarNavigator
	// );
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
	<section id="">
		<FileSideBar />
	</section>
	<section class="rounded-3xl">
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
		grid-template-rows: calc(100vh - 2em);
	}
	section {
		grid-row: 1;
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
