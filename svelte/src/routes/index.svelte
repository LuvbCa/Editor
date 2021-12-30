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
	import Tabcontainer from '$lib/Tabcontainer.svelte';
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
